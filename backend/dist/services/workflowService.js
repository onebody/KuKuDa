"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowService = void 0;
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.workflowService = {
    // 获取工作流列表
    async getWorkflows(userId) {
        return await prisma.workflow.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        });
    },
    // 创建工作流
    async createWorkflow(userId, data) {
        return await prisma.workflow.create({
            data: {
                name: data.name,
                description: data.description,
                userId
            }
        });
    },
    // 获取工作流详情（包含节点和连接）
    async getWorkflow(userId, workflowId) {
        const workflow = await prisma.workflow.findFirst({
            where: {
                id: workflowId,
                OR: [
                    { userId },
                    { isPublic: true }
                ]
            },
            include: {
                nodes: true,
                connections: true
            }
        });
        if (!workflow) {
            throw new Error('工作流不存在或无权限访问');
        }
        return workflow;
    },
    // 更新工作流
    async updateWorkflow(userId, workflowId, data) {
        // 检查权限
        const workflow = await prisma.workflow.findFirst({
            where: { id: workflowId, userId }
        });
        if (!workflow) {
            throw new Error('工作流不存在或无权限修改');
        }
        return await prisma.workflow.update({
            where: { id: workflowId },
            data
        });
    },
    // 删除工作流
    async deleteWorkflow(userId, workflowId) {
        const workflow = await prisma.workflow.findFirst({
            where: { id: workflowId, userId }
        });
        if (!workflow) {
            throw new Error('工作流不存在或无权限删除');
        }
        await prisma.workflow.delete({
            where: { id: workflowId }
        });
    },
    // 执行工作流
    async executeWorkflow(userId, workflowId) {
        // 检查工作流是否存在
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
                status: client_2.ExecutionStatus.PENDING,
                triggeredBy: userId
            }
        });
        // TODO: 启动执行引擎（异步）
        // 这里应该调用执行服务，现在先返回执行ID
        return {
            executionId: execution.id,
            status: execution.status
        };
    },
    // 获取执行记录
    async getExecutions(userId, workflowId) {
        return await prisma.execution.findMany({
            where: {
                workflowId,
                userId
            },
            orderBy: { startedAt: 'desc' }
        });
    }
};
//# sourceMappingURL=workflowService.js.map