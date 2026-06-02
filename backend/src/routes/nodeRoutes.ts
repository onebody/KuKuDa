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
router.post('/workflows/:workflowId/nodes', ...addNodeController);

/**
 * GET /api/workflows/:workflowId/nodes
 * 获取工作流的所有节点
 */
router.get('/workflows/:workflowId/nodes', ...getWorkflowNodesController);

// ============ 连接路由 ============

/**
 * POST /api/workflows/:workflowId/connections
 * 添加连接到工作流
 */
router.post(
  '/workflows/:workflowId/connections',
  ...addConnectionController
);

/**
 * GET /api/workflows/:workflowId/connections
 * 获取工作流的所有连接
 */
router.get(
  '/workflows/:workflowId/connections',
  ...getWorkflowConnectionsController
);

// ============ 保存整个工作流 ============

/**
 * PUT /api/workflows/:workflowId/save
 * 保存整个工作流（包含节点和连接）
 */
router.put('/workflows/:workflowId/save', ...updateWorkflowController);

// ============ 单个节点路由 ============

/**
 * PUT /api/nodes/:id
 * 更新节点
 */
router.put('/nodes/:id', ...updateNodeController);

/**
 * DELETE /api/nodes/:id
 * 删除节点
 */
router.delete('/nodes/:id', ...deleteNodeController);

// ============ 单个连接路由 ============

/**
 * DELETE /api/connections/:id
 * 删除连接
 */
router.delete('/connections/:id', ...deleteConnectionController);

export { router as nodeRouter };
