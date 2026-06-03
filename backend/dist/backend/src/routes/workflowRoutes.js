"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workflowController_1 = require("../controllers/workflowController");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/', workflowController_1.workflowController.getWorkflows);
router.post('/', workflowController_1.workflowController.createWorkflow);
router.get('/:id', workflowController_1.workflowController.getWorkflow);
router.put('/:id', workflowController_1.workflowController.updateWorkflow);
router.delete('/:id', workflowController_1.workflowController.deleteWorkflow);
router.post('/:id/execute', workflowController_1.workflowController.executeWorkflow);
router.get('/:id/executions', workflowController_1.workflowController.getExecutions);
exports.default = router;
//# sourceMappingURL=workflowRoutes.js.map