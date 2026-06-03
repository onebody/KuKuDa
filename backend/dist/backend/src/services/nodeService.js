"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteConnection = exports.addConnection = exports.getWorkflowConnections = exports.getWorkflowNodes = exports.deleteNode = exports.updateNode = exports.addNode = exports.updateWorkflow = exports.createManyConnections = exports.createManyNodes = exports.deleteNodesByWorkflowId = exports.deleteConnectionsByWorkflowId = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const workflow_1 = require("../types/workflow");
const errorHandler_1 = require("../middleware/errorHandler");
// ============ 批量操作（供 updateWorkflow 内部使用）============
const deleteConnectionsByWorkflowId = async (workflowId) => {
    await prisma.nodeConnection.deleteMany({ where: { workflowId } });
};
exports.deleteConnectionsByWorkflowId = deleteConnectionsByWorkflowId;
const deleteNodesByWorkflowId = async (workflowId) => {
    await prisma.node.deleteMany({ where: { workflowId } });
};
exports.deleteNodesByWorkflowId = deleteNodesByWorkflowId;
const createManyNodes = async (nodes) => {
    const createdNodes = [];
    for (const nodeData of nodes) {
        const { id, ...rest } = nodeData;
        const node = await prisma.node.create({
            data: { ...(id ? { id } : {}), ...rest, status: workflow_1.NodeStatus.IDLE },
        });
        createdNodes.push(node);
    }
    return createdNodes;
};
exports.createManyNodes = createManyNodes;
const createManyConnections = async (connections) => {
    const createdConnections = [];
    for (const connData of connections) {
        const conn = await prisma.nodeConnection.create({ data: connData });
        createdConnections.push(conn);
    }
    return createdConnections;
};
exports.createManyConnections = createManyConnections;
// ============ 工作流保存（覆盖式）============
const updateWorkflow = async (workflowId, userId, data) => {
    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow)
        throw new errorHandler_1.AppError('工作流不存在', 40402, 404);
    if (workflow.userId !== userId)
        throw new errorHandler_1.AppError('无权限修改此工作流', 40301, 403);
    const result = {};
    if (data.nodes !== undefined) {
        await (0, exports.deleteConnectionsByWorkflowId)(workflowId);
        await (0, exports.deleteNodesByWorkflowId)(workflowId);
        if (data.nodes.length > 0) {
            const nodes = await (0, exports.createManyNodes)(data.nodes.map((node) => ({
                id: node.id,
                workflowId,
                type: node.type,
                label: node.label,
                positionX: node.positionX ?? node.data?.position?.x ?? 0,
                positionY: node.positionY ?? node.data?.position?.y ?? 0,
                data: node.data ?? {},
                config: node.config ?? {},
            })));
            result.nodes = nodes;
        }
    }
    if (data.connections !== undefined) {
        if (data.connections.length > 0) {
            const connections = await (0, exports.createManyConnections)(data.connections.map((conn) => ({
                workflowId,
                sourceNodeId: conn.sourceNodeId ?? conn.source,
                sourceHandle: conn.sourceHandle ?? null,
                targetNodeId: conn.targetNodeId ?? conn.target,
                targetHandle: conn.targetHandle ?? null,
            })));
            result.connections = connections;
        }
    }
    // 保存 viewport
    if (data.viewport !== undefined) {
        await prisma.workflow.update({
            where: { id: workflowId },
            data: { viewport: JSON.stringify(data.viewport) },
        });
    }
    return result;
};
exports.updateWorkflow = updateWorkflow;
// ============ 单节点操作（供 controller 使用）============
/** 添加节点（controller 中叫 addNode） */
const addNode = async (workflowId, userId, data) => {
    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow)
        throw new errorHandler_1.AppError('工作流不存在', 40402, 404);
    if (workflow.userId !== userId)
        throw new errorHandler_1.AppError('无权限修改此工作流', 40301, 403);
    return prisma.node.create({
        data: {
            workflowId,
            type: data.type,
            label: data.label,
            positionX: data.positionX ?? 0,
            positionY: data.positionY ?? 0,
            data: data.data ?? {},
            config: data.config ?? {},
            status: workflow_1.NodeStatus.IDLE,
        },
    });
};
exports.addNode = addNode;
/** 更新节点 */
const updateNode = async (nodeId, data) => {
    const node = await prisma.node.findUnique({ where: { id: nodeId } });
    if (!node)
        throw new errorHandler_1.AppError('节点不存在', 40401, 404);
    return prisma.node.update({
        where: { id: nodeId },
        data: {
            ...(data.label !== undefined && { label: data.label }),
            ...(data.positionX !== undefined && { positionX: data.positionX }),
            ...(data.positionY !== undefined && { positionY: data.positionY }),
            ...(data.data !== undefined && { data: data.data }),
            ...(data.config !== undefined && { config: data.config }),
        },
    });
};
exports.updateNode = updateNode;
/** 删除节点 */
const deleteNode = async (nodeId) => {
    const node = await prisma.node.findUnique({ where: { id: nodeId } });
    if (!node)
        throw new errorHandler_1.AppError('节点不存在', 40401, 404);
    await prisma.node.delete({ where: { id: nodeId } });
};
exports.deleteNode = deleteNode;
/** 获取工作流的所有节点（controller 中叫 getWorkflowNodes） */
const getWorkflowNodes = async (workflowId, userId) => {
    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow)
        throw new errorHandler_1.AppError('工作流不存在', 40402, 404);
    return prisma.node.findMany({ where: { workflowId }, orderBy: { createdAt: 'asc' } });
};
exports.getWorkflowNodes = getWorkflowNodes;
/** 获取工作流的所有连接（controller 中叫 getWorkflowConnections） */
const getWorkflowConnections = async (workflowId, userId) => {
    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow)
        throw new errorHandler_1.AppError('工作流不存在', 40402, 404);
    return prisma.nodeConnection.findMany({ where: { workflowId }, orderBy: { createdAt: 'asc' } });
};
exports.getWorkflowConnections = getWorkflowConnections;
// ============ 连接操作 ============
/** 添加连接（controller 中叫 addConnection） */
const addConnection = async (workflowId, userId, data) => {
    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow)
        throw new errorHandler_1.AppError('工作流不存在', 40402, 404);
    if (workflow.userId !== userId)
        throw new errorHandler_1.AppError('无权限修改此工作流', 40301, 403);
    return prisma.nodeConnection.create({
        data: {
            workflowId,
            sourceNodeId: data.sourceNodeId,
            sourceHandle: data.sourceHandle ?? null,
            targetNodeId: data.targetNodeId,
            targetHandle: data.targetHandle ?? null,
        },
    });
};
exports.addConnection = addConnection;
/** 删除连接（controller 中叫 deleteConnectionService） */
const deleteConnection = async (connectionId) => {
    const conn = await prisma.nodeConnection.findUnique({ where: { id: connectionId } });
    if (!conn)
        throw new errorHandler_1.AppError('连接不存在', 40404, 404);
    await prisma.nodeConnection.delete({ where: { id: connectionId } });
};
exports.deleteConnection = deleteConnection;
//# sourceMappingURL=nodeService.js.map