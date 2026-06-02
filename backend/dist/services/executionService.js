"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executionService = void 0;
const client_1 = require("@prisma/client");
const openaiAdapter_1 = require("./ai/openaiAdapter");
const prisma = new client_1.PrismaClient();
exports.executionService = {
    /**
     * 执行工作流
     */
    async executeWorkflow(workflowId, userId) {
        // 获取工作流详情
        const workflow = await prisma.workflow.findFirst({
            where: { id: workflowId, userId },
            include: { nodes: true, connections: true }
        });
        if (!workflow) {
            throw new Error('工作流不存在');
        }
        // 创建执行记录
        const execution = await prisma.execution.create({
            data: {
                workflowId,
                userId,
                status: 'RUNNING',
                triggeredBy: userId
            }
        });
        // 异步执行工作流（实际应用中应该使用消息队列）
        this.runExecution(execution.id, workflow.nodes, workflow.connections).catch(console.error);
        return execution;
    },
    /**
     * 运行执行（核心执行引擎）
     */
    async runExecution(executionId, nodes, connections) {
        try {
            // 构建节点映射
            const nodeMap = new Map(nodes.map(node => [node.id, node]));
            // 构建邻接表（用于拓扑排序）
            const graph = new Map();
            const inDegree = new Map();
            nodes.forEach(node => {
                graph.set(node.id, []);
                inDegree.set(node.id, 0);
            });
            connections.forEach(conn => {
                const targets = graph.get(conn.sourceNodeId) || [];
                targets.push(conn.targetNodeId);
                graph.set(conn.sourceNodeId, targets);
                inDegree.set(conn.targetNodeId, (inDegree.get(conn.targetNodeId) || 0) + 1);
            });
            // 拓扑排序（BFS）
            const queue = [];
            inDegree.forEach((degree, nodeId) => {
                if (degree === 0)
                    queue.push(nodeId);
            });
            const nodeResults = {};
            while (queue.length > 0) {
                const nodeId = queue.shift();
                const node = nodeMap.get(nodeId);
                // 执行节点
                const result = await this.executeNode(node, nodeResults);
                nodeResults[nodeId] = result;
                // 更新节点状态
                await prisma.node.update({
                    where: { id: nodeId },
                    data: {
                        status: result.error ? 'ERROR' : 'SUCCESS',
                        result: result,
                        error: result.error,
                        executedAt: new Date()
                    }
                });
                // 处理下游节点
                const targets = graph.get(nodeId) || [];
                for (const targetId of targets) {
                    inDegree.set(targetId, inDegree.get(targetId) - 1);
                    if (inDegree.get(targetId) === 0) {
                        queue.push(targetId);
                    }
                }
            }
            // 更新执行记录
            await prisma.execution.update({
                where: { id: executionId },
                data: {
                    status: 'SUCCESS',
                    completedAt: new Date(),
                    nodeResults: nodeResults
                }
            });
        }
        catch (error) {
            // 更新执行记录为失败
            await prisma.execution.update({
                where: { id: executionId },
                data: {
                    status: 'FAILED',
                    completedAt: new Date(),
                    error: error.message
                }
            });
        }
    },
    /**
     * 执行单个节点
     */
    async executeNode(node, previousResults) {
        const adapter = this.getAdapter(node.type);
        if (!adapter) {
            return { error: `不支持的节点类型: ${node.type}` };
        }
        // 准备输入数据（从上游节点获取）
        const input = this.getNodeInput(node.id, previousResults);
        return await adapter.execute({
            type: node.type,
            config: node.config,
            input
        });
    },
    /**
     * 获取AI适配器
     */
    getAdapter(nodeType) {
        // TODO: 从数据库或配置获取API Key
        const apiKey = process.env.OPENAI_API_KEY || '';
        switch (nodeType) {
            case 'LLM_CALL':
                return new openaiAdapter_1.OpenAIAdapter(apiKey);
            // TODO: 添加其他适配器
            default:
                return null;
        }
    },
    /**
     * 获取节点输入（从上游节点结果）
     */
    getNodeInput(nodeId, previousResults) {
        // 简化实现：返回所有上游节点的结果
        return {
            text: Object.values(previousResults).map(r => r.text).join('\n')
        };
    }
};
//# sourceMappingURL=executionService.js.map