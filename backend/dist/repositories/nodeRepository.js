"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNodesByWorkflowId = exports.updateNodeResult = exports.updateNodesStatus = exports.createManyNodes = exports.deleteNode = exports.updateNode = exports.findNodesByWorkflowId = exports.findNodeById = exports.createNode = void 0;
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
/**
 * 节点数据访问层
 * 封装所有节点相关的数据库操作
 */
/**
 * 创建节点
 * @param data - 节点数据
 * @returns 创建的节点
 */
const createNode = async (data) => {
    return await database_1.prisma.node.create({
        data: {
            workflowId: data.workflowId,
            type: data.type,
            label: data.label,
            positionX: data.positionX,
            positionY: data.positionY,
            data: data.data,
            config: data.config,
            status: client_1.NodeStatus.IDLE,
        },
    });
};
exports.createNode = createNode;
/**
 * 根据 ID 查找节点
 * @param id - 节点 ID
 * @returns 节点对象或 null
 */
const findNodeById = async (id) => {
    return await database_1.prisma.node.findUnique({
        where: { id },
    });
};
exports.findNodeById = findNodeById;
/**
 * 获取工作流的所有节点
 * @param workflowId - 工作流 ID
 * @returns 节点列表
 */
const findNodesByWorkflowId = async (workflowId) => {
    return await database_1.prisma.node.findMany({
        where: { workflowId },
        orderBy: { createdAt: 'asc' },
    });
};
exports.findNodesByWorkflowId = findNodesByWorkflowId;
/**
 * 更新节点
 * @param id - 节点 ID
 * @param data - 要更新的数据
 * @returns 更新后的节点
 */
const updateNode = async (id, data) => {
    return await database_1.prisma.node.update({
        where: { id },
        data,
    });
};
exports.updateNode = updateNode;
/**
 * 删除节点
 * @param id - 节点 ID
 */
const deleteNode = async (id) => {
    await database_1.prisma.node.delete({
        where: { id },
    });
};
exports.deleteNode = deleteNode;
/**
 * 批量创建节点
 * @param nodes - 节点数据数组
 * @returns 创建的节点列表
 */
const createManyNodes = async (nodes) => {
    const createdNodes = [];
    for (const nodeData of nodes) {
        const node = await database_1.prisma.node.create({
            data: {
                ...nodeData,
                status: client_1.NodeStatus.IDLE,
            },
        });
        createdNodes.push(node);
    }
    return createdNodes;
};
exports.createManyNodes = createManyNodes;
/**
 * 批量更新节点状态
 * @param nodeIds - 节点 ID 数组
 * @param status - 新状态
 */
const updateNodesStatus = async (nodeIds, status) => {
    await database_1.prisma.node.updateMany({
        where: {
            id: { in: nodeIds },
        },
        data: { status },
    });
};
exports.updateNodesStatus = updateNodesStatus;
/**
 * 更新节点执行结果
 * @param id - 节点 ID
 * @param result - 执行结果
 * @param status - 节点状态
 * @param error - 错误信息
 */
const updateNodeResult = async (id, result, status, error) => {
    return await database_1.prisma.node.update({
        where: { id },
        data: {
            result,
            status,
            error,
            executedAt: new Date(),
        },
    });
};
exports.updateNodeResult = updateNodeResult;
/**
 * 删除工作流的所有节点
 * @param workflowId - 工作流 ID
 */
const deleteNodesByWorkflowId = async (workflowId) => {
    await database_1.prisma.node.deleteMany({
        where: { workflowId },
    });
};
exports.deleteNodesByWorkflowId = deleteNodesByWorkflowId;
//# sourceMappingURL=nodeRepository.js.map