import { Request, Response } from 'express';
import { skillRegistry } from '../services/skills';
import { SkillContext } from '../types/skill';

export const skillController = {
  getAllSkills: async (_req: Request, res: Response) => {
    try {
      const skills = skillRegistry.getAllDefinitions();
      res.json({
        code: 0,
        data: skills,
        message: '获取技能列表成功',
      });
    } catch (error: any) {
      res.status(500).json({
        code: -1,
        data: null,
        message: error.message,
      });
    }
  },

  getSkillById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const skill = skillRegistry.get(id);

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
    } catch (error: any) {
      res.status(500).json({
        code: -1,
        data: null,
        message: error.message,
      });
    }
  },

  executeSkill: async (req: Request, res: Response) => {
    try {
      const { skillId } = req.params;
      const { parameters, context } = req.body;

      const executionContext: SkillContext = {
        workflowId: context?.workflowId,
        nodeId: context?.nodeId,
        userId: context?.userId,
        inputData: context?.inputData,
      };

      const result = await skillRegistry.execute(skillId, parameters, executionContext);

      res.json({
        code: result.success ? 0 : -1,
        data: result.data,
        message: result.success ? '技能执行成功' : result.error,
        executionTime: result.executionTime,
      });
    } catch (error: any) {
      res.status(500).json({
        code: -1,
        data: null,
        message: error.message,
      });
    }
  },
};
