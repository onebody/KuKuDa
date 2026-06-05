import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { workflowController } from '../controllers/workflowController';

const router = Router();

// 创建新工作流
router.post('/', authenticateToken as any, workflowController.createWorkflow as any);

// 获取用户的所有工作流
router.get('/', authenticateToken as any, workflowController.getWorkflows as any);

// 获取单个工作流详情
router.get('/:id', authenticateToken as any, workflowController.getWorkflow as any);

// 更新工作流基本信息
router.put('/:id', authenticateToken as any, workflowController.updateWorkflow as any);

// 完整保存工作流（nodes + connections + viewport）
router.put('/:id/save', authenticateToken as any, workflowController.saveWorkflow as any);

// 删除工作流
router.delete('/:id', authenticateToken as any, workflowController.deleteWorkflow as any);

// 执行工作流
router.post('/:id/execute', authenticateToken as any, workflowController.executeWorkflow as any);

export default router;
