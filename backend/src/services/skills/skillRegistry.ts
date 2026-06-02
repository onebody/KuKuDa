import { BaseSkill } from './baseSkill';
import { SkillDefinition, SkillExecutionResult, SkillContext } from '../../types/skill';

class SkillRegistry {
  private skills: Map<string, BaseSkill> = new Map();

  register(skill: BaseSkill): void {
    const definition = skill.getDefinition();
    this.skills.set(definition.id, skill);
  }

  get(skillId: string): BaseSkill | undefined {
    return this.skills.get(skillId);
  }

  getAll(): BaseSkill[] {
    return Array.from(this.skills.values());
  }

  getAllDefinitions(): SkillDefinition[] {
    return this.getAll().map((skill) => skill.getDefinition());
  }

  async execute(
    skillId: string,
    parameters: Record<string, any>,
    context: SkillContext
  ): Promise<SkillExecutionResult> {
    const skill = this.skills.get(skillId);

    if (!skill) {
      return {
        success: false,
        error: `技能不存在: ${skillId}`,
      };
    }

    const validation = skill.validateParameters(parameters);
    if (!validation.valid) {
      return {
        success: false,
        error: `参数验证失败: ${validation.errors.join(', ')}`,
      };
    }

    try {
      const startTime = Date.now();
      const result = await skill.execute(parameters, context);
      const executionTime = Date.now() - startTime;

      return {
        ...result,
        executionTime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '技能执行失败',
      };
    }
  }
}

export const skillRegistry = new SkillRegistry();
