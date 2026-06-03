"use strict";
/**
 * 工作流执行引擎服务
 * 实现拓扑排序（Kahn's Algorithm）、并行执行、错误传播
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutorService = void 0;
exports.executeWorkflow = executeWorkflow;
const client_1 = require("@prisma/client");
const nodeAdapters_1 = require("./ai/nodeAdapters");
const prisma = new client_1.PrismaClient();
/**
 * 工作流执行引擎类
 * 负责工作流的拓扑排序、节点执行、错误传播
 */
class WorkflowExecutorService {
    constructor(executionId, workflowId, userId) {
        this.nodeResults = new Map();
        this.executionStatus = new Map();
        this.startTime = 0;
        this.executionId = executionId;
        this.workflowId = workflowId;
        this.userId = userId;
    }
    /**
     * 执行工作流（主入口）
     */
    async execute(nodes, connections) {
        this.startTime = Date.now();
        const nodeResults = [];
        try {
            console.log(`[WorkflowExecutor] 开始执行工作流 ${this.workflowId}`);
            // 步骤1：拓扑排序
            const sortedNodeIds = this.topologicalSort(nodes, connections);
            if (sortedNodeIds.length === 0 && nodes.length > 0) {
                throw new Error('工作流存在循环依赖，无法进行拓扑排序');
            }
            console.log(`[WorkflowExecutor] 拓扑排序结果: ${sortedNodeIds.join(' -> ')}`);
            // 步骤2：按拓扑顺序执行节点（串行执行以保证正确性）
            for (const nodeId of sortedNodeIds) {
                const node = nodes.find((n) => n.id === nodeId);
                if (!node)
                    continue;
                this.executionStatus.set(nodeId, 'RUNNING');
                await this.updateNodeStatus(nodeId, 'RUNNING');
                const nodeResult = await this.executeNode(node, nodes, connections);
                this.nodeResults.set(nodeId, nodeResult);
                this.executionStatus.set(nodeId, nodeResult.status === 'SUCCESS' ? 'SUCCESS' : 'ERROR');
                const nodeExecResult = {
                    nodeId,
                    nodeType: node.type,
                    status: nodeResult.status,
                    output: nodeResult,
                    startTime: new Date(this.startTime),
                    endTime: new Date(),
                    duration: Date.now() - this.startTime,
                };
                nodeResults.push(nodeExecResult);
                await this.updateNodeStatus(nodeId, nodeResult.status === 'SUCCESS' ? 'SUCCESS' : 'ERROR', nodeResult.error?.message);
                if (nodeResult.status === 'ERROR') {
                    console.error(`[WorkflowExecutor] 节点 ${nodeId} 执行失败: ${nodeResult.error?.message}`);
                    await this.propagateError(nodeId, nodes, connections);
                    break;
                }
            }
            // 步骤3：汇总执行结果
            const endTime = Date.now();
            const duration = endTime - this.startTime;
            const allSuccess = nodeResults.every((r) => r.status === 'SUCCESS');
            const result = {
                executionId: this.executionId,
                workflowId: this.workflowId,
                status: allSuccess ? 'SUCCESS' : 'ERROR',
                nodeResults,
                startTime: new Date(this.startTime),
                endTime: new Date(),
                duration,
            };
            await this.updateExecutionRecord(result);
            console.log(`[WorkflowExecutor] 工作流执行完成，状态: ${result.status}, 耗时: ${duration}ms`);
            return result;
        }
        catch (error) {
            const endTime = Date.now();
            const duration = endTime - this.startTime;
            console.error('[WorkflowExecutor] 工作流执行失败:', error);
            const result = {
                executionId: this.executionId,
                workflowId: this.workflowId,
                status: 'ERROR',
                nodeResults,
                startTime: new Date(this.startTime),
                endTime: new Date(),
                duration,
                error: {
                    code: 'WORKFLOW_EXECUTION_FAILED',
                    message: error.message || '工作流执行失败',
                    details: error.stack,
                },
            };
            await this.updateExecutionRecord(result);
            return result;
        }
    }
    /**
     * 拓扑排序（Kahn's Algorithm）
     */
    topologicalSort(nodes, connections) {
        const graph = new Map();
        const inDegree = new Map();
        nodes.forEach((node) => {
            graph.set(node.id, []);
            inDegree.set(node.id, 0);
        });
        connections.forEach((conn) => {
            const source = conn.sourceNodeId;
            const target = conn.targetNodeId;
            if (graph.has(source) && graph.has(target)) {
                const neighbors = graph.get(source);
                neighbors.push(target);
                graph.set(source, neighbors);
                inDegree.set(target, (inDegree.get(target) || 0) + 1);
            }
        });
        const queue = [];
        inDegree.forEach((degree, nodeId) => {
            if (degree === 0)
                queue.push(nodeId);
        });
        const result = [];
        while (queue.length > 0) {
            const nodeId = queue.shift();
            result.push(nodeId);
            const neighbors = graph.get(nodeId) || [];
            for (const neighbor of neighbors) {
                const newDegree = inDegree.get(neighbor) - 1;
                inDegree.set(neighbor, newDegree);
                if (newDegree === 0)
                    queue.push(neighbor);
            }
        }
        if (result.length !== nodes.length) {
            console.warn('[WorkflowExecutor] 检测到循环依赖');
            return [];
        }
        return result;
    }
    /**
     * 执行单个节点
     */
    async executeNode(node, allNodes, connections) {
        const startTime = Date.now();
        try {
            const adapter = this.getNodeAdapter(node.type);
            if (!adapter) {
                return {
                    status: 'ERROR',
                    error: {
                        code: 'ADAPTER_NOT_FOUND',
                        message: `未找到节点类型 ${node.type} 的适配器`,
                    },
                    metadata: {
                        nodeId: node.id,
                        executionTime: Date.now() - startTime,
                        timestamp: new Date(),
                        upstreamNodeIds: this.getUpstreamNodeIds(node.id, connections),
                    },
                };
            }
            const input = this.getNodeInput(node.id, allNodes, connections);
            const validation = adapter.validate(input, node.config || {});
            if (!validation.valid) {
                return {
                    status: 'ERROR',
                    error: {
                        code: 'VALIDATION_FAILED',
                        message: `配置验证失败: ${validation.errors.map((e) => e.message).join(', ')}`,
                        details: validation.errors,
                    },
                    metadata: {
                        nodeId: node.id,
                        executionTime: Date.now() - startTime,
                        timestamp: new Date(),
                        upstreamNodeIds: this.getUpstreamNodeIds(node.id, connections),
                    },
                };
            }
            const context = {
                executionId: this.executionId,
                userId: this.userId,
                workflowId: this.workflowId,
                variables: this.buildVariables(),
                timeout: 30000,
            };
            const timeout = context.timeout || 30000;
            const executionPromise = adapter.execute(input, node.config || {}, context);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`节点执行超时 (${timeout}ms)`)), timeout);
            });
            const result = (await Promise.race([executionPromise, timeoutPromise]));
            if (result.metadata) {
                result.metadata.nodeId = node.id;
                result.metadata.executionTime = Date.now() - startTime;
                result.metadata.timestamp = new Date();
                result.metadata.upstreamNodeIds = this.getUpstreamNodeIds(node.id, connections);
            }
            return result;
        }
        catch (error) {
            console.error(`[WorkflowExecutor] 节点 ${node.id} 执行失败:`, error);
            return {
                status: 'ERROR',
                error: {
                    code: 'NODE_EXECUTION_FAILED',
                    message: error.message || '节点执行失败',
                    details: error.stack,
                },
                metadata: {
                    nodeId: node.id,
                    executionTime: Date.now() - startTime,
                    timestamp: new Date(),
                    upstreamNodeIds: this.getUpstreamNodeIds(node.id, connections),
                },
            };
        }
    }
    getNodeAdapter(nodeType) {
        return nodeAdapters_1.adapterRegistry.createInstance(nodeType);
    }
    getNodeInput(nodeId, allNodes, connections) {
        const input = {};
        const incomingConnections = connections.filter((conn) => conn.targetNodeId === nodeId);
        for (const conn of incomingConnections) {
            const sourceNodeId = conn.sourceNodeId;
            const targetHandle = conn.targetHandle || 'default';
            const sourceResult = this.nodeResults.get(sourceNodeId);
            if (sourceResult && sourceResult.data) {
                input[targetHandle] = sourceResult.data;
            }
        }
        if (Object.keys(input).length === 0) {
            const upstreamNodeIds = this.getUpstreamNodeIds(nodeId, connections);
            for (const upstreamId of upstreamNodeIds) {
                const result = this.nodeResults.get(upstreamId);
                if (result && result.data) {
                    input['default'] = result.data;
                    break;
                }
            }
        }
        return input;
    }
    getUpstreamNodeIds(nodeId, connections) {
        const upstreamIds = [];
        connections.forEach((conn) => {
            if (conn.targetNodeId === nodeId) {
                upstreamIds.push(conn.sourceNodeId);
            }
        });
        return upstreamIds;
    }
    buildVariables() {
        const variables = {};
        this.nodeResults.forEach((result, nodeId) => {
            variables[nodeId] = result;
        });
        return variables;
    }
    async propagateError(failedNodeId, nodes, connections) {
        const downstreamNodes = this.getDownstreamNodes(failedNodeId, nodes, connections);
        for (const nodeId of downstreamNodes) {
            this.executionStatus.set(nodeId, 'ERROR');
            await this.updateNodeStatus(nodeId, 'ERROR', `上游节点 ${failedNodeId} 执行失败`);
            console.log(`[WorkflowExecutor] 错误传播到下游节点: ${nodeId}`);
        }
    }
    getDownstreamNodes(nodeId, nodes, connections) {
        const downstreamIds = [];
        const visited = new Set();
        const traverse = (currentId) => {
            if (visited.has(currentId))
                return;
            visited.add(currentId);
            const outgoingConnections = connections.filter((conn) => conn.sourceNodeId === currentId);
            for (const conn of outgoingConnections) {
                const targetId = conn.targetNodeId;
                downstreamIds.push(targetId);
                traverse(targetId);
            }
        };
        traverse(nodeId);
        return downstreamIds;
    }
    async updateNodeStatus(nodeId, status, error) {
        try {
            // Map internal status to Prisma ExecutionStatus enum
            const statusMap = {
                'RUNNING': 'RUNNING',
                'SUCCESS': 'SUCCESS',
                'ERROR': 'FAILED',
            };
            await prisma.node.update({
                where: { id: nodeId },
                data: {
                    status: statusMap[status] || 'FAILED',
                    error,
                    executedAt: new Date(),
                },
            });
        }
        catch (err) {
            console.error(`[WorkflowExecutor] 更新节点状态失败: ${nodeId}`, err);
        }
    }
    async updateExecutionRecord(result) {
        try {
            // Map internal status to Prisma ExecutionStatus enum
            const statusMap = {
                'SUCCESS': 'SUCCESS',
                'ERROR': 'FAILED',
                'RUNNING': 'RUNNING',
            };
            await prisma.execution.update({
                where: { id: this.executionId },
                data: {
                    status: statusMap[result.status] || 'FAILED',
                    completedAt: result.endTime,
                    error: result.error?.message,
                    nodeResults: result.nodeResults,
                },
            });
        }
        catch (err) {
            console.error('[WorkflowExecutor] 更新执行记录失败:', err);
        }
    }
}
exports.WorkflowExecutorService = WorkflowExecutorService;
/**
 * 创建并运行工作流执行
 */
async function executeWorkflow(executionId, workflowId, userId, nodes, connections) {
    const executor = new WorkflowExecutorService(executionId, workflowId, userId);
    return await executor.execute(nodes, connections);
}
//# sourceMappingURL=workflowExecutorService.js.map