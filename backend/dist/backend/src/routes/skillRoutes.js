"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const skillController_1 = require("../controllers/skillController");
const router = (0, express_1.Router)();
router.get('/', skillController_1.skillController.getAllSkills);
router.get('/:id', skillController_1.skillController.getSkillById);
router.post('/:skillId/execute', skillController_1.skillController.executeSkill);
exports.default = router;
//# sourceMappingURL=skillRoutes.js.map