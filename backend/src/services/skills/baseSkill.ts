import { SkillDefinition, SkillExecutionResult, SkillContext } from '../../types/skill';

export abstract class BaseSkill {
  abstract getDefinition(): SkillDefinition;

  abstract execute(parameters: Record<string, any>, context: SkillContext): Promise<SkillExecutionResult>;

  validateParameters(parameters: Record<string, any>): { valid: boolean; errors: string[] } {
    const definition = this.getDefinition();
    const errors: string[] = [];

    for (const param of definition.parameters) {
      if (param.required && parameters[param.name] === undefined) {
        errors.push(`缺少必需参数: ${param.name}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  protected successResult(data: any, executionTime?: number): SkillExecutionResult {
    return {
      success: true,
      data,
      executionTime,
    };
  }

  protected errorResult(error: string): SkillExecutionResult {
    return {
      success: false,
      error,
    };
  }
}
