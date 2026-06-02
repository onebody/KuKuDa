import { BaseSkill } from './baseSkill';
import { SkillDefinition, SkillExecutionResult, SkillContext } from '../../types/skill';

export class MathSkill extends BaseSkill {
  getDefinition(): SkillDefinition {
    return {
      id: 'math_calculator',
      name: '数学计算器',
      description: '执行基本数学运算，支持加减乘除、幂运算、平方根等',
      category: '工具',
      parameters: [
        {
          name: 'expression',
          type: 'string',
          description: '数学表达式，例如: 2 + 3 * 4',
          required: true,
        },
      ],
      returnType: 'number',
      returnDescription: '计算结果',
    };
  }

  async execute(
    parameters: Record<string, any>,
    _context: SkillContext
  ): Promise<SkillExecutionResult> {
    const expression = parameters.expression as string;

    try {
      const sanitized = expression
        .replace(/[^0-9+\-*/().^√πe\s]/g, '')
        .replace(/√/g, 'Math.sqrt')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**');

      const result = new Function(`return ${sanitized}`)();

      if (typeof result !== 'number' || !isFinite(result)) {
        return this.errorResult('无效的数学表达式');
      }

      return this.successResult(result);
    } catch (error: any) {
      return this.errorResult(`计算失败: ${error.message}`);
    }
  }
}
