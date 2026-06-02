"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workflowController_1 = require("../controllers/workflowController");
const nodeController_1 = require("../controllers/nodeController");
const router = (0, express_1.Router)();
// 所有工作流路由都需要认证
router.use(auth_1.authMiddleware);
// 工作流CRUD
router.get('/', workflowController_1.workflowController.getWorkflows);
router.post('/', workflowController_1.workflowController.createWorkflow);
router.get('/:id', workflowController_1.workflowController.getWorkflow);
router.put('/:id', workflowController_1.workflowController.updateWorkflow);
router.delete('/:id', workflowController_1.workflowController.deleteWorkflow);
// 工作流执行
router.post('/:id/execute', workflowController_1.workflowController.executeWorkflow);
router.get('/:id/executions', workflowController_1.workflowController.getExecutions);
// 节点管理（嵌套路由）
router.post('/:workflowId/nodes', nodeController_1.addNodeController);
router.get('/:workflowId/nodes', nodeController_1.getWorkflowNodesController);
router.put('/nodes/:id', nodeController_1.updateNodeController);
router.delete('/nodes/:id', nodeController_1.deleteNodeController);
// 节点连接管理
router.post('/:workflowId/connections', nodeController_1.addConnectionController);
router.delete('/connections/:id', nodeController_1.deleteConnectionController);
exports.default = router;
//# sourceMappingURL=workflowRoutes.js.map