import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { workflowController } from '../controllers/workflowController'

const router = Router()

router.use(authMiddleware as any)

router.get('/', workflowController.getWorkflows as any)
router.post('/', workflowController.createWorkflow as any)
router.get('/:id', workflowController.getWorkflow as any)
router.put('/:id', workflowController.updateWorkflow as any)
router.delete('/:id', workflowController.deleteWorkflow as any)

router.post('/:id/execute', workflowController.executeWorkflow as any)
router.get('/:id/executions', workflowController.getExecutions as any)

export default router
