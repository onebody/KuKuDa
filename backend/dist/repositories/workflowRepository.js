"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findWorkflowExecutions = exports.duplicateWorkflow = exports.deleteWorkflow = exports.updateWorkflow = exports.findTemplates = exports.findWorkflowsByUserId = exports.findWorkflowById = exports.createWorkflow = void 0;
const database_1 = require("../config/database");
/**
 * 工作流数据访问层
 * 封装所有工作流相关的数据库操作
 */
/**
 * 创建工作流
 * @param data - 工作流数据
 * @returns 创建的工作流
 */
const createWorkflow = async (data) => {
    return await database_1.prisma.workflow.create({
        data: {
            name: data.name,
            description: data.description,
            userId: data.userId,
            isTemplate: data.isTemplate || false,
        },
    });
};
exports.createWorkflow = createWorkflow;
/**
 * 根据 ID 查找工作流
 * @param id - 工作流 ID
 * @returns 工作流对象或 null
 */
const findWorkflowById = async (id) => {
    return await database_1.prisma.workflow.findUnique({
        where: { id },
        include: {
            nodes: true,
            connections: true,
        },
    });
};
exports.findWorkflowById = findWorkflowById;
/**
 * 获取用户的工作流列表
 * @param userId - 用户 ID
 * @param page - 页码
 * @param pageSize - 每页数量
 * @returns 工作流列表和总数
 */
const findWorkflowsByUserId = async (userId, page = 1, pageSize = 20) => {
    const skip = (page - 1) * pageSize;
    const [workflows, total] = await Promise.all([
        database_1.prisma.workflow.findMany({
            where: {
                userId,
                isTemplate: false,
            },
            skip,
            take: pageSize,
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: {
                        nodes: true,
                        executions: true,
                    },
                },
            },
        }),
        database_1.prisma.workflow.count({
            where: {
                userId,
                isTemplate: false,
            },
        }),
    ]);
    return { workflows, total };
};
exports.findWorkflowsByUserId = findWorkflowsByUserId;
/**
 * 获取模板列表
 * @param page - 页码
 * @param pageSize - 每页数量
 * @returns 模板列表和总数
 */
const findTemplates = async (page = 1, pageSize = 20) => {
    const skip = (page - 1) * pageSize;
    const [workflows, total] = await Promise.all([
        database_1.prisma.workflow.findMany({
            where: {
                isTemplate: true,
            },
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        }),
        database_1.prisma.workflow.count({
            where: {
                isTemplate: true,
            },
        }),
    ]);
    return { workflows, total };
};
exports.findTemplates = findTemplates;
/**
 * 更新工作流
 * @param id - 工作流 ID
 * @param data - 要更新的数据
 * @returns 更新后的工作流
 */
const updateWorkflow = async (id, data) => {
    return await database_1.prisma.workflow.update({
        where: { id },
        data,
    });
};
exports.updateWorkflow = updateWorkflow;
/**
 * 删除工作流
 * @param id - 工作流 ID
 */
const deleteWorkflow = async (id) => {
    await database_1.prisma.workflow.delete({
        where: { id },
    });
};
exports.deleteWorkflow = deleteWorkflow;
/**
 * 复制工作流
 * @param id - 源工作流 ID
 * @param userId - 新用户 ID
 * @returns 新的工作流
 */
const duplicateWorkflow = async (id, userId) => {
    const source = await database_1.prisma.workflow.findUnique({
        where: { id },
        include: {
            nodes: true,
            connections: true,
        },
    });
    if (!source) {
        throw new Error('工作流不存在');
    }
    // 创建新工作流
    const newWorkflow = await database_1.prisma.workflow.create({
        data: {
            name: `${source.name} (副本)`,
            description: source.description,
            userId,
            isTemplate: false,
            nodes: {
                create: source.nodes.map((node) => ({
                    type: node.type,
                    label: node.label,
                    positionX: node.positionX,
                    positionY: node.positionY,
                    data: node.data,
                    config: node.config,
                })),
            },
            connections: {
                create: source.connections.map((conn) => ({
                    sourceNodeId: conn.sourceNodeId,
                    sourceHandle: conn.sourceHandle,
                    targetNodeId: conn.targetNodeId,
                    targetHandle: conn.targetHandle,
                })),
            },
        },
        include: {
            nodes: true,
            connections: true,
        },
    });
    return newWorkflow;
};
exports.duplicateWorkflow = duplicateWorkflow;
/**
 * 获取工作流执行记录
 * @param workflowId - 工作流 ID
 * @param page - 页码
 * @param pageSize - 每页数量
 * @returns 执行记录列表和总数
 */
const findWorkflowExecutions = async (workflowId, page = 1, pageSize = 20) => {
    const skip = (page - 1) * pageSize;
    const [executions, total] = await Promise.all([
        database_1.prisma.execution.findMany({
            where: { workflowId },
            skip,
            take: pageSize,
            orderBy: { startedAt: 'desc' },
        }),
        database_1.prisma.execution.count({
            where: { workflowId },
        }),
    ]);
    return { executions, total };
};
exports.findWorkflowExecutions = findWorkflowExecutions;
//# sourceMappingURL=workflowRepository.js.map