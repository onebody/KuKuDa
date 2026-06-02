"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillController = void 0;
const skills_1 = require("../services/skills");
exports.skillController = {
    getAllSkills: async (_req, res) => {
        try {
            const skills = skills_1.skillRegistry.getAllDefinitions();
            res.json({
                code: 0,
                data: skills,
                message: '获取技能列表成功',
            });
        }
        catch (error) {
            res.status(500).json({
                code: -1,
                data: null,
                message: error.message,
            });
        }
    },
    getSkillById: async (req, res) => {
        try {
            const { id } = req.params;
            const skill = skills_1.skillRegistry.get(id);
            if (!skill) {
                return res.status(404).json({
                    code: -1,
                    data: null,
                    message: '技能不存在',
                });
            }
            res.json({
                code: 0,
                data: skill.getDefinition(),
                message: '获取技能成功',
            });
        }
        catch (error) {
            res.status(500).json({
                code: -1,
                data: null,
                message: error.message,
            });
        }
    },
    executeSkill: async (req, res) => {
        try {
            const { skillId } = req.params;
            const { parameters, context } = req.body;
            const executionContext = {
                workflowId: context?.workflowId,
                nodeId: context?.nodeId,
                userId: context?.userId,
                inputData: context?.inputData,
            };
            const result = await skills_1.skillRegistry.execute(skillId, parameters, executionContext);
            res.json({
                code: result.success ? 0 : -1,
                data: result.data,
                message: result.success ? '技能执行成功' : result.error,
                executionTime: result.executionTime,
            });
        }
        catch (error) {
            res.status(500).json({
                code: -1,
                data: null,
                message: error.message,
            });
        }
    },
};
//# sourceMappingURL=skillController.js.map