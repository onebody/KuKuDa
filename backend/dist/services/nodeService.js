"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkflow = exports.getWorkflowConnections = exports.getWorkflowNodes = exports.deleteConnectionService = exports.addConnection = exports.deleteNodeService = exports.updateNodeService = exports.addNode = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const database_1 = require("../config/database");
const nodeRepository_1 = require("../repositories/nodeRepository");
const connectionRepository_1 = require("../repositories/connectionRepository");
const workflowRepository_1 = require("../repositories/workflowRepository");
/**
 * 节点服务层
 * 处理节点和连接相关的业务逻辑
 */
/**
 * 添加节点到工作流
 * @param workflowId - 工作流 ID
 * @param userId - 用户 ID（用于权限检查）
 * @param data - 节点数据
 * @returns 创建的节点
 */
const addNode = async (workflowId, userId, data) => {
    // 检查工作流是否存在且有权限
    const workflow = await (0, workflowRepository_1.findWorkflowById)(workflowId);
    if (!workflow) {
        throw new errorHandler_1.AppError('工作流不存在', 40401, 404);
    }
    if (workflow.userId !== userId) {
        throw new errorHandler_1.AppError('无权限修改此工作流', 40301, 403);
    }
    const node = await (0, nodeRepository_1.createNode)({
        workflowId,
        type: data.type,
        label: data.label,
        positionX: data.positionX,
        positionY: data.positionY,
        data: data.data,
        config: data.config,
    });
    return {
        id: node.id,
        type: node.type,
        label: node.label,
        positionX: node.positionX,
        positionY: node.positionY,
        data: node.data,
        config: node.config,
        status: node.status,
        createdAt: node.createdAt,
    };
};
exports.addNode = addNode;
/**
 * 更新节点
 * @param nodeId - 节点 ID
 * @param userId - 用户 ID（用于权限检查）
 * @param data - 要更新的数据
 * @returns 更新后的节点
 */
const updateNodeService = async (nodeId, userId, data) => {
    // 检查节点是否存在
    const node = await (0, nodeRepository_1.findNodeById)(nodeId);
    if (!node) {
        throw new errorHandler_1.AppError('节点不存在', 40402, 404);
    }
    // 检查权限
    const workflow = await (0, workflowRepository_1.findWorkflowById)(node.workflowId);
    if (!workflow || workflow.userId !== userId) {
        throw new errorHandler_1.AppError('无权限修改此节点', 40302, 403);
    }
    const updated = await (0, nodeRepository_1.updateNode)(nodeId, data);
    return {
        id: updated.id,
        type: updated.type,
        label: updated.label,
        positionX: updated.positionX,
        positionY: updated.positionY,
        data: updated.data,
        config: updated.config,
        status: updated.status,
        updatedAt: updated.updatedAt,
    };
};
exports.updateNodeService = updateNodeService;
/**
 * 删除节点
 * @param nodeId - 节点 ID
 * @param userId - 用户 ID（用于权限检查）
 */
const deleteNodeService = async (nodeId, userId) => {
    // 检查节点是否存在
    const node = await (0, nodeRepository_1.findNodeById)(nodeId);
    if (!node) {
        throw new errorHandler_1.AppError('节点不存在', 40402, 404);
    }
    // 检查权限
    const workflow = await (0, workflowRepository_1.findWorkflowById)(node.workflowId);
    if (!workflow || workflow.userId !== userId) {
        throw new errorHandler_1.AppError('无权限删除此节点', 40302, 403);
    }
    // 删除相关连接
    // (已在 repository 中通过 onDelete: Cascade 自动处理)
    await (0, nodeRepository_1.deleteNode)(nodeId);
};
exports.deleteNodeService = deleteNodeService;
/**
 * 添加连接到工作流
 * @param workflowId - 工作流 ID
 * @param userId - 用户 ID（用于权限检查）
 * @param data - 连接数据
 * @returns 创建的连接
 */
const addConnection = async (workflowId, userId, data) => {
    // 检查工作流是否存在且有权限
    const workflow = await (0, workflowRepository_1.findWorkflowById)(workflowId);
    if (!workflow) {
        throw new errorHandler_1.AppError('工作流不存在', 40401, 404);
    }
    if (workflow.userId !== userId) {
        throw new errorHandler_1.AppError('无权限修改此工作流', 40301, 403);
    }
    // 检查源节点和目标节点是否存在
    const [sourceNode, targetNode] = await Promise.all([
        (0, nodeRepository_1.findNodeById)(data.sourceNodeId),
        (0, nodeRepository_1.findNodeById)(data.targetNodeId),
    ]);
    if (!sourceNode || sourceNode.workflowId !== workflowId) {
        throw new errorHandler_1.AppError('源节点不存在', 40402, 404);
    }
    if (!targetNode || targetNode.workflowId !== workflowId) {
        throw new errorHandler_1.AppError('目标节点不存在', 40402, 404);
    }
    const connection = await (0, connectionRepository_1.createConnection)({
        workflowId,
        sourceNodeId: data.sourceNodeId,
        sourceHandle: data.sourceHandle,
        targetNodeId: data.targetNodeId,
        targetHandle: data.targetHandle,
    });
    return {
        id: connection.id,
        sourceNodeId: connection.sourceNodeId,
        sourceHandle: connection.sourceHandle,
        targetNodeId: connection.targetNodeId,
        targetHandle: connection.targetHandle,
        createdAt: connection.createdAt,
    };
};
exports.addConnection = addConnection;
/**
 * 删除连接
 * @param connectionId - 连接 ID
 * @param userId - 用户 ID（用于权限检查）
 */
const deleteConnectionService = async (connectionId, userId) => {
    // 检查连接是否存在
    const connection = await database_1.prisma.nodeConnection.findUnique({
        where: { id: connectionId },
    });
    if (!connection) {
        throw new errorHandler_1.AppError('连接不存在', 40403, 404);
    }
    // 检查权限
    const workflow = await (0, workflowRepository_1.findWorkflowById)(connection.workflowId);
    if (!workflow || workflow.userId !== userId) {
        throw new errorHandler_1.AppError('无权限删除此连接', 40303, 403);
    }
    await (0, connectionRepository_1.deleteConnection)(connectionId);
};
exports.deleteConnectionService = deleteConnectionService;
/**
 * 获取工作流的所有节点
 * @param workflowId - 工作流 ID
 * @param userId - 用户 ID（用于权限检查）
 * @returns 节点列表
 */
const getWorkflowNodes = async (workflowId, userId) => {
    const workflow = await (0, workflowRepository_1.findWorkflowById)(workflowId);
    if (!workflow) {
        throw new errorHandler_1.AppError('工作流不存在', 40401, 404);
    }
    // 检查权限（非公开/非模板的工作流需要权限）
    if (!workflow.isPublic && !workflow.isTemplate) {
        if (userId && workflow.userId !== userId) {
            throw new errorHandler_1.AppError('无权限访问此工作流', 40301, 403);
        }
    }
    const nodes = await (0, nodeRepository_1.findNodesByWorkflowId)(workflowId);
    return nodes.map((node) => ({
        id: node.id,
        type: node.type,
        label: node.label,
        positionX: node.positionX,
        positionY: node.positionY,
        data: node.data,
        config: node.config,
        status: node.status,
        result: node.result,
        error: node.error,
        executedAt: node.executedAt,
    }));
};
exports.getWorkflowNodes = getWorkflowNodes;
/**
 * 获取工作流的所有连接
 * @param workflowId - 工作流 ID
 * @param userId - 用户 ID（用于权限检查）
 * @returns 连接列表
 */
const getWorkflowConnections = async (workflowId, userId) => {
    const workflow = await (0, workflowRepository_1.findWorkflowById)(workflowId);
    if (!workflow) {
        throw new errorHandler_1.AppError('工作流不存在', 40401, 404);
    }
    // 检查权限
    if (!workflow.isPublic && !workflow.isTemplate) {
        if (userId && workflow.userId !== userId) {
            throw new errorHandler_1.AppError('无权限访问此工作流', 40301, 403);
        }
    }
    const connections = await (0, connectionRepository_1.findConnectionsByWorkflowId)(workflowId);
    return connections.map((conn) => ({
        id: conn.id,
        sourceNodeId: conn.sourceNodeId,
        sourceHandle: conn.sourceHandle,
        targetNodeId: conn.targetNodeId,
        targetHandle: conn.targetHandle,
    }));
};
exports.getWorkflowConnections = getWorkflowConnections;
/**
 * 更新整个工作流（包括节点和连接）
 * @param workflowId - 工作流 ID
 * @param userId - 用户 ID（用于权限检查）
 * @param data - 包含 nodes 和 connections 的数据
 * @returns 更新结果
 */
const updateWorkflow = async (workflowId, userId, data) => {
    const workflow = await (0, workflowRepository_1.findWorkflowById)(workflowId);
    if (!workflow) {
        throw new errorHandler_1.AppError('工作流不存在', 40401, 404);
    }
    if (workflow.userId !== userId) {
        throw new errorHandler_1.AppError('无权限修改此工作流', 40301, 403);
    }
    const result = {};
    if (data.nodes !== undefined) {
        await (0, nodeRepository_1.deleteNodesByWorkflowId)(workflowId);
        if (data.nodes.length > 0) {
            const nodes = await (0, nodeRepository_1.createManyNodes)(data.nodes.map((node) => ({
                workflowId,
                type: node.type,
                label: node.label,
                positionX: node.positionX,
                positionY: node.positionY,
                data: node.data,
                config: node.config,
            })));
            result.nodes = nodes.map((node) => ({
                id: node.id,
                type: node.type,
                label: node.label,
                positionX: node.positionX,
                positionY: node.positionY,
                data: node.data,
                config: node.config,
                status: node.status,
            }));
        }
    }
    if (data.connections !== undefined) {
        await (0, connectionRepository_1.deleteConnectionsByWorkflowId)(workflowId);
        if (data.connections.length > 0) {
            const connections = await (0, connectionRepository_1.createManyConnections)(data.connections.map((conn) => ({
                workflowId,
                sourceNodeId: conn.sourceNodeId,
                sourceHandle: conn.sourceHandle,
                targetNodeId: conn.targetNodeId,
                targetHandle: conn.targetHandle,
            })));
            result.connections = connections.map((conn) => ({
                id: conn.id,
                sourceNodeId: conn.sourceNodeId,
                sourceHandle: conn.sourceHandle,
                targetNodeId: conn.targetNodeId,
                targetHandle: conn.targetHandle,
            }));
        }
    }
    return result;
};
exports.updateWorkflow = updateWorkflow;
//# sourceMappingURL=nodeService.js.map