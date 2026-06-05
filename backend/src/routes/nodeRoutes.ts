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
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// ============ 节点路由 ============
router.post('/workflows/:workflowId/nodes', authenticateToken as any, addNodeController as any);
router.get('/workflows/:workflowId/nodes', authenticateToken as any, getWorkflowNodesController as any);

// ============ 连接路由 ============
router.post('/workflows/:workflowId/connections', authenticateToken as any, addConnectionController as any);
router.get('/workflows/:workflowId/connections', authenticateToken as any, getWorkflowConnectionsController as any);

// ============ 保存整个工作流 ============
router.put('/workflows/:workflowId/save', authenticateToken as any, updateWorkflowController as any);

// ============ 单个节点路由 ============
router.put('/nodes/:id', authenticateToken as any, updateNodeController as any);
router.delete('/nodes/:id', authenticateToken as any, deleteNodeController as any);

// ============ 单个连接路由 ============
router.delete('/connections/:id', authenticateToken as any, deleteConnectionController as any);

export { router as nodeRouter };
