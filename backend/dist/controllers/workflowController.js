"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowController = void 0;
const workflowService_1 = require("../services/workflowService");
exports.workflowController = {
    // 获取工作流列表
    async getWorkflows(req, res) {
        try {
            const userId = req.user.userId;
            const workflows = await workflowService_1.workflowService.getWorkflows(userId);
            res.json({
                code: 0,
                data: workflows,
                message: 'success'
            });
        }
        catch (error) {
            res.status(500).json({
                code: 50001,
                data: null,
                message: error.message
            });
        }
    },
    // 创建工作流
    async createWorkflow(req, res) {
        try {
            const userId = req.user.userId;
            const { name, description } = req.body;
            const workflow = await workflowService_1.workflowService.createWorkflow(userId, { name, description });
            res.status(201).json({
                code: 0,
                data: workflow,
                message: '创建成功'
            });
        }
        catch (error) {
            res.status(400).json({
                code: 40001,
                data: null,
                message: error.message
            });
        }
    },
    // 获取工作流详情
    async getWorkflow(req, res) {
        try {
            const userId = req.user.userId;
            const workflowId = req.params.id;
            const workflow = await workflowService_1.workflowService.getWorkflow(userId, workflowId);
            res.json({
                code: 0,
                data: workflow,
                message: 'success'
            });
        }
        catch (error) {
            res.status(404).json({
                code: 40401,
                data: null,
                message: error.message
            });
        }
    },
    // 更新工作流
    async updateWorkflow(req, res) {
        try {
            const userId = req.user.userId;
            const workflowId = req.params.id;
            const data = req.body;
            const workflow = await workflowService_1.workflowService.updateWorkflow(userId, workflowId, data);
            res.json({
                code: 0,
                data: workflow,
                message: '更新成功'
            });
        }
        catch (error) {
            res.status(400).json({
                code: 40001,
                data: null,
                message: error.message
            });
        }
    },
    // 删除工作流
    async deleteWorkflow(req, res) {
        try {
            const userId = req.user.userId;
            const workflowId = req.params.id;
            await workflowService_1.workflowService.deleteWorkflow(userId, workflowId);
            res.json({
                code: 0,
                data: null,
                message: '删除成功'
            });
        }
        catch (error) {
            res.status(400).json({
                code: 40001,
                data: null,
                message: error.message
            });
        }
    },
    // 执行工作流
    async executeWorkflow(req, res) {
        try {
            const userId = req.user.userId;
            const workflowId = req.params.id;
            const execution = await workflowService_1.workflowService.executeWorkflow(userId, workflowId);
            res.json({
                code: 0,
                data: execution,
                message: '执行已启动'
            });
        }
        catch (error) {
            res.status(500).json({
                code: 50001,
                data: null,
                message: error.message
            });
        }
    },
    // 获取执行记录
    async getExecutions(req, res) {
        try {
            const userId = req.user.userId;
            const workflowId = req.params.id;
            const executions = await workflowService_1.workflowService.getExecutions(userId, workflowId);
            res.json({
                code: 0,
                data: executions,
                message: 'success'
            });
        }
        catch (error) {
            res.status(500).json({
                code: 50001,
                data: null,
                message: error.message
            });
        }
    }
};
//# sourceMappingURL=workflowController.js.map