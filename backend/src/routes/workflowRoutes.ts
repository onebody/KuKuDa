import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { workflowController } from '../controllers/workflowController'

const router = Router()

router.use(authMiddleware)

router.get('/', workflowController.getWorkflows)
router.post('/', workflowController.createWorkflow)
router.get('/:id', workflowController.getWorkflow)
router.put('/:id', workflowController.updateWorkflow)
router.delete('/:id', workflowController.deleteWorkflow)

router.post('/:id/execute', workflowController.executeWorkflow)
router.get('/:id/executions', workflowController.getExecutions)

export default router
