"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkflowController = exports.deleteConnectionController = exports.getWorkflowConnectionsController = exports.addConnectionController = exports.deleteNodeController = exports.updateNodeController = exports.getWorkflowNodesController = exports.addNodeController = void 0;
const workflowValidator_1 = require("../validators/workflowValidator");
const nodeService_1 = require("../services/nodeService");
const validator_1 = require("../middleware/validator");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * 节点控制器
 * 处理节点和连接相关的 HTTP 请求
 */
/**
 * 添加节点到工作流
 * POST /api/workflows/:workflowId/nodes
 */
exports.addNodeController = [
    auth_1.authMiddleware,
    (0, validator_1.validateRequest)(workflowValidator_1.createNodeSchema),
    async (req, res) => {
        try {
            const workflowId = req.params.workflowId;
            const userId = req.user.userId;
            const { type, label, positionX, positionY, data, config } = req.body;
            const result = await (0, nodeService_1.addNode)(workflowId, userId, {
                type,
                label,
                positionX,
                positionY,
                data,
                config,
            });
            logger_1.logger.info('节点添加成功:', { nodeId: result.id, workflowId });
            res.status(201).json({
                code: 0,
                data: result,
                message: '节点添加成功',
            });
        }
        catch (error) {
            logger_1.logger.error('节点添加失败:', error);
            if (error instanceof errorHandler_1.AppError) {
                res.status(error.statusCode).json({
                    code: error.code,
                    data: null,
                    message: error.message,
                });
            }
            else {
                res.status(500).json({
                    code: 50001,
                    data: null,
                    message: '服务器内部错误',
                });
            }
        }
    },
];
/**
 * 获取工作流的所有节点
 * GET /api/workflows/:workflowId/nodes
 */
exports.getWorkflowNodesController = [
    auth_1.authMiddleware,
    async (req, res) => {
        try {
            const workflowId = req.params.workflowId;
            const userId = req.user.userId;
            const result = await (0, nodeService_1.getWorkflowNodes)(workflowId, userId);
            res.status(200).json({
                code: 0,
                data: result,
                message: 'success',
            });
        }
        catch (error) {
            logger_1.logger.error('获取节点列表失败:', error);
            if (error instanceof errorHandler_1.AppError) {
                res.status(error.statusCode).json({
                    code: error.code,
                    data: null,
                    message: error.message,
                });
            }
            else {
                res.status(500).json({
                    code: 50001,
                    data: null,
                    message: '服务器内部错误',
                });
            }
        }
    },
];
/**
 * 更新节点
 * PUT /api/nodes/:id
 */
exports.updateNodeController = [
    auth_1.authMiddleware,
    (0, validator_1.validateRequest)(workflowValidator_1.updateNodeSchema),
    async (req, res) => {
        try {
            const nodeId = req.params.id;
            const userId = req.user.userId;
            const { label, positionX, positionY, data, config } = req.body;
            const result = await (0, nodeService_1.updateNode)(nodeId, {
                label,
                positionX,
                positionY,
                data,
                config,
            });
            logger_1.logger.info('节点更新成功:', { nodeId, userId });
            res.status(200).json({
                code: 0,
                data: result,
                message: '节点更新成功',
            });
        }
        catch (error) {
            logger_1.logger.error('节点更新失败:', error);
            if (error instanceof errorHandler_1.AppError) {
                res.status(error.statusCode).json({
                    code: error.code,
                    data: null,
                    message: error.message,
                });
            }
            else {
                res.status(500).json({
                    code: 50001,
                    data: null,
                    message: '服务器内部错误',
                });
            }
        }
    },
];
/**
 * 删除节点
 * DELETE /api/nodes/:id
 */
exports.deleteNodeController = [
    auth_1.authMiddleware,
    (0, validator_1.validateRequest)(workflowValidator_1.nodeIdSchema),
    async (req, res) => {
        try {
            const nodeId = req.params.id;
            const userId = req.user.userId;
            await (0, nodeService_1.deleteNode)(nodeId);
            logger_1.logger.info('节点删除成功:', { nodeId, userId });
            res.status(200).json({
                code: 0,
                data: null,
                message: '节点删除成功',
            });
        }
        catch (error) {
            logger_1.logger.error('节点删除失败:', error);
            if (error instanceof errorHandler_1.AppError) {
                res.status(error.statusCode).json({
                    code: error.code,
                    data: null,
                    message: error.message,
                });
            }
            else {
                res.status(500).json({
                    code: 50001,
                    data: null,
                    message: '服务器内部错误',
                });
            }
        }
    },
];
/**
 * 添加连接到工作流
 * POST /api/workflows/:workflowId/connections
 */
exports.addConnectionController = [
    auth_1.authMiddleware,
    (0, validator_1.validateRequest)(workflowValidator_1.createConnectionSchema),
    async (req, res) => {
        try {
            const workflowId = req.params.workflowId;
            const userId = req.user.userId;
            const { sourceNodeId, sourceHandle, targetNodeId, targetHandle, } = req.body;
            const result = await (0, nodeService_1.addConnection)(workflowId, userId, {
                sourceNodeId,
                sourceHandle,
                targetNodeId,
                targetHandle,
            });
            logger_1.logger.info('连接添加成功:', { connectionId: result.id, workflowId });
            res.status(201).json({
                code: 0,
                data: result,
                message: '连接添加成功',
            });
        }
        catch (error) {
            logger_1.logger.error('连接添加失败:', error);
            if (error instanceof errorHandler_1.AppError) {
                res.status(error.statusCode).json({
                    code: error.code,
                    data: null,
                    message: error.message,
                });
            }
            else {
                res.status(500).json({
                    code: 50001,
                    data: null,
                    message: '服务器内部错误',
                });
            }
        }
    },
];
/**
 * 获取工作流的所有连接
 * GET /api/workflows/:workflowId/connections
 */
exports.getWorkflowConnectionsController = [
    auth_1.authMiddleware,
    async (req, res) => {
        try {
            const workflowId = req.params.workflowId;
            const userId = req.user.userId;
            const result = await (0, nodeService_1.getWorkflowConnections)(workflowId, userId);
            res.status(200).json({
                code: 0,
                data: result,
                message: 'success',
            });
        }
        catch (error) {
            logger_1.logger.error('获取连接列表失败:', error);
            if (error instanceof errorHandler_1.AppError) {
                res.status(error.statusCode).json({
                    code: error.code,
                    data: null,
                    message: error.message,
                });
            }
            else {
                res.status(500).json({
                    code: 50001,
                    data: null,
                    message: '服务器内部错误',
                });
            }
        }
    },
];
/**
 * 删除连接
 * DELETE /api/connections/:id
 */
exports.deleteConnectionController = [
    auth_1.authMiddleware,
    (0, validator_1.validateRequest)(workflowValidator_1.connectionIdSchema),
    async (req, res) => {
        try {
            const connectionId = req.params.id;
            const userId = req.user.userId;
            await (0, nodeService_1.deleteConnection)(connectionId);
            logger_1.logger.info('连接删除成功:', { connectionId, userId });
            res.status(200).json({
                code: 0,
                data: null,
                message: '连接删除成功',
            });
        }
        catch (error) {
            logger_1.logger.error('连接删除失败:', error);
            if (error instanceof errorHandler_1.AppError) {
                res.status(error.statusCode).json({
                    code: error.code,
                    data: null,
                    message: error.message,
                });
            }
            else {
                res.status(500).json({
                    code: 50001,
                    data: null,
                    message: '服务器内部错误',
                });
            }
        }
    },
];
/**
 * 更新整个工作流（包含节点和连接）
 * PUT /api/workflows/:workflowId/save
 */
exports.updateWorkflowController = [
    auth_1.authMiddleware,
    async (req, res) => {
        try {
            const workflowId = req.params.workflowId;
            const userId = req.user.userId;
            const { nodes, connections } = req.body;
            const result = await (0, nodeService_1.updateWorkflow)(workflowId, userId, {
                nodes,
                connections,
            });
            logger_1.logger.info('工作流保存成功', { workflowId });
            res.json({
                code: 0,
                data: result,
                message: '保存成功',
            });
        }
        catch (error) {
            logger_1.logger.error('保存工作流失败:', error);
            if (error instanceof errorHandler_1.AppError) {
                res.status(error.statusCode).json({
                    code: error.code,
                    data: null,
                    message: error.message,
                });
            }
            else {
                res.status(500).json({
                    code: 50001,
                    data: null,
                    message: '服务器内部错误',
                });
            }
        }
    },
];
//# sourceMappingURL=nodeController.js.map