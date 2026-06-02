"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteConnectionsByNodeId = exports.deleteConnectionsByWorkflowId = exports.createManyConnections = exports.deleteConnection = exports.findConnectionsByWorkflowId = exports.findConnectionById = exports.createConnection = void 0;
const database_1 = require("../config/database");
/**
 * 节点连接数据访问层
 * 封装所有节点连接相关的数据库操作
 */
/**
 * 创建连接
 * @param data - 连接数据
 * @returns 创建的连接
 */
const createConnection = async (data) => {
    return await database_1.prisma.nodeConnection.create({
        data: {
            workflowId: data.workflowId,
            sourceNodeId: data.sourceNodeId,
            sourceHandle: data.sourceHandle,
            targetNodeId: data.targetNodeId,
            targetHandle: data.targetHandle,
        },
    });
};
exports.createConnection = createConnection;
/**
 * 根据 ID 查找连接
 * @param id - 连接 ID
 * @returns 连接对象或 null
 */
const findConnectionById = async (id) => {
    return await database_1.prisma.nodeConnection.findUnique({
        where: { id },
    });
};
exports.findConnectionById = findConnectionById;
/**
 * 获取工作流的所有连接
 * @param workflowId - 工作流 ID
 * @returns 连接列表
 */
const findConnectionsByWorkflowId = async (workflowId) => {
    return await database_1.prisma.nodeConnection.findMany({
        where: { workflowId },
        orderBy: { createdAt: 'asc' },
    });
};
exports.findConnectionsByWorkflowId = findConnectionsByWorkflowId;
/**
 * 删除连接
 * @param id - 连接 ID
 */
const deleteConnection = async (id) => {
    await database_1.prisma.nodeConnection.delete({
        where: { id },
    });
};
exports.deleteConnection = deleteConnection;
/**
 * 批量创建连接
 * @param connections - 连接数据数组
 * @returns 创建的连接列表
 */
const createManyConnections = async (connections) => {
    const createdConnections = [];
    for (const connData of connections) {
        const conn = await database_1.prisma.nodeConnection.create({
            data: connData,
        });
        createdConnections.push(conn);
    }
    return createdConnections;
};
exports.createManyConnections = createManyConnections;
/**
 * 删除工作流的所有连接
 * @param workflowId - 工作流 ID
 */
const deleteConnectionsByWorkflowId = async (workflowId) => {
    await database_1.prisma.nodeConnection.deleteMany({
        where: { workflowId },
    });
};
exports.deleteConnectionsByWorkflowId = deleteConnectionsByWorkflowId;
/**
 * 删除节点的所有相关连接（作为源或目标）
 * @param nodeId - 节点 ID
 */
const deleteConnectionsByNodeId = async (nodeId) => {
    await database_1.prisma.nodeConnection.deleteMany({
        where: {
            OR: [
                { sourceNodeId: nodeId },
                { targetNodeId: nodeId },
            ],
        },
    });
};
exports.deleteConnectionsByNodeId = deleteConnectionsByNodeId;
//# sourceMappingURL=connectionRepository.js.map