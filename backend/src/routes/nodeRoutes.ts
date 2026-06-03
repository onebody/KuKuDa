import { Router } from 'express';
import {
  addNodeController,
  getWorkflowNodesController,
  updateNodeController,
  deleteNodeController,
  addConnectionController,
  getWorkflowConnectionsController,
  deleteConnectionController,
  updateWorkflowController,
} from '../controllers/nodeController';
import { authMiddleware } from '../middleware/auth';

/**
 * 节点路由
 * 定义节点和连接相关的 API 端点
 */

const router = Router();

// ============ 节点路由 ============

/**
 * POST /api/workflows/:workflowId/nodes
 * 添加节点到工作流
 */
router.post('/workflows/:workflowId/nodes', authMiddleware as any, addNodeController as any);

/**
 * GET /api/workflows/:workflowId/nodes
 * 获取工作流的所有节点
 */
router.get('/workflows/:workflowId/nodes', authMiddleware as any, getWorkflowNodesController as any);

// ============ 连接路由 ============

/**
 * POST /api/workflows/:workflowId/connections
 * 添加连接到工作流
 */
router.post(
  '/workflows/:workflowId/connections',
  authMiddleware as any,
  addConnectionController as any
);

/**
 * GET /api/workflows/:workflowId/connections
 * 获取工作流的所有连接
 */
router.get(
  '/workflows/:workflowId/connections',
  authMiddleware as any,
  getWorkflowConnectionsController as any
);

// ============ 保存整个工作流 ============

/**
 * PUT /api/workflows/:workflowId/save
 * 保存整个工作流（包含节点和连接）
 */
router.put('/workflows/:workflowId/save', authMiddleware as any, updateWorkflowController as any);

// ============ 单个节点路由 ============

/**
 * PUT /api/nodes/:id
 * 更新节点
 */
router.put('/nodes/:id', authMiddleware as any, updateNodeController as any);

/**
 * DELETE /api/nodes/:id
 * 删除节点
 */
router.delete('/nodes/:id', authMiddleware as any, deleteNodeController as any);

// ============ 单个连接路由 ============

/**
 * DELETE /api/connections/:id
 * 删除连接
 */
router.delete('/connections/:id', authMiddleware as any, deleteConnectionController as any);

export { router as nodeRouter };
