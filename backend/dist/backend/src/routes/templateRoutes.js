"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// 获取模板列表
router.get('/', async (req, res) => {
    res.json({ code: 0, data: [], message: 'success' });
});
// 从模板创建工作流
router.post('/:id/use', async (req, res) => {
    res.json({ code: 0, data: { id: 'new-workflow-id' }, message: 'success' });
});
exports.default = router;
//# sourceMappingURL=templateRoutes.js.map