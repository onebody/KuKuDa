"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeRouter = void 0;
const express_1 = require("express");
const nodeController_1 = require("../controllers/nodeController");
/**
 * 节点路由
 * 定义节点和连接相关的 API 端点
 */
const router = (0, express_1.Router)();
exports.nodeRouter = router;
// ============ 节点路由 ============
/**
 * POST /api/workflows/:workflowId/nodes
 * 添加节点到工作流
 */
router.post('/workflows/:workflowId/nodes', ...nodeController_1.addNodeController);
/**
 * GET /api/workflows/:workflowId/nodes
 * 获取工作流的所有节点
 */
router.get('/workflows/:workflowId/nodes', ...nodeController_1.getWorkflowNodesController);
// ============ 连接路由 ============
/**
 * POST /api/workflows/:workflowId/connections
 * 添加连接到工作流
 */
router.post('/workflows/:workflowId/connections', ...nodeController_1.addConnectionController);
/**
 * GET /api/workflows/:workflowId/connections
 * 获取工作流的所有连接
 */
router.get('/workflows/:workflowId/connections', ...nodeController_1.getWorkflowConnectionsController);
// ============ 保存整个工作流 ============
/**
 * PUT /api/workflows/:workflowId/save
 * 保存整个工作流（包含节点和连接）
 */
router.put('/workflows/:workflowId/save', ...nodeController_1.updateWorkflowController);
// ============ 单个节点路由 ============
/**
 * PUT /api/nodes/:id
 * 更新节点
 */
router.put('/nodes/:id', ...nodeController_1.updateNodeController);
/**
 * DELETE /api/nodes/:id
 * 删除节点
 */
router.delete('/nodes/:id', ...nodeController_1.deleteNodeController);
// ============ 单个连接路由 ============
/**
 * DELETE /api/connections/:id
 * 删除连接
 */
router.delete('/connections/:id', ...nodeController_1.deleteConnectionController);
// ============ 工作流执行路由 ============
/**
 * POST /api/workflows/:workflowId/execute
 * 执行工作流
 */
router.post('/workflows/:workflowId/execute', ...nodeController_1.executeWorkflowController);
//# sourceMappingURL=nodeRoutes.js.map