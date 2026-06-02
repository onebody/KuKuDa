import { BaseSkill } from './baseSkill';
import { SkillDefinition, SkillExecutionResult, SkillContext } from '../../types/skill';

export class DateSkill extends BaseSkill {
  getDefinition(): SkillDefinition {
    return {
      id: 'date_processor',
      name: '日期处理器',
      description: '执行日期相关操作，包括格式化、计算时间差等',
      category: '工具',
      parameters: [
        {
          name: 'operation',
          type: 'string',
          description: '操作类型: now, format, add, diff',
          required: true,
        },
        {
          name: 'date',
          type: 'string',
          description: '输入日期（ISO格式），now操作不需要',
          required: false,
        },
        {
          name: 'format',
          type: 'string',
          description: '输出格式，如 YYYY-MM-DD HH:mm:ss',
          required: false,
          default: 'YYYY-MM-DD HH:mm:ss',
        },
        {
          name: 'years',
          type: 'number',
          description: '添加的年数（add操作）',
          required: false,
          default: 0,
        },
        {
          name: 'months',
          type: 'number',
          description: '添加的月数（add操作）',
          required: false,
          default: 0,
        },
        {
          name: 'days',
          type: 'number',
          description: '添加的天数（add操作）',
          required: false,
          default: 0,
        },
        {
          name: 'date2',
          type: 'string',
          description: '第二个日期（diff操作）',
          required: false,
        },
      ],
      returnType: 'string | number',
      returnDescription: '处理后的日期或时间差（毫秒）',
    };
  }

  async execute(
    parameters: Record<string, any>,
    _context: SkillContext
  ): Promise<SkillExecutionResult> {
    const { operation } = parameters;

    try {
      let result: string | number;
      const format = parameters.format || 'YYYY-MM-DD HH:mm:ss';

      switch (operation.toLowerCase()) {
        case 'now': {
          const date = new Date();
          result = this.formatDate(date, format);
          break;
        }
        case 'format': {
          const dateStr = parameters.date;
          if (!dateStr) {
            return this.errorResult('缺少日期参数');
          }
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            return this.errorResult('无效的日期格式');
          }
          result = this.formatDate(date, format);
          break;
        }
        case 'add': {
          const dateStr = parameters.date || new Date().toISOString();
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            return this.errorResult('无效的日期格式');
          }
          date.setFullYear(date.getFullYear() + (parameters.years || 0));
          date.setMonth(date.getMonth() + (parameters.months || 0));
          date.setDate(date.getDate() + (parameters.days || 0));
          result = this.formatDate(date, format);
          break;
        }
        case 'diff': {
          const dateStr1 = parameters.date;
          const dateStr2 = parameters.date2;
          if (!dateStr1 || !dateStr2) {
            return this.errorResult('缺少日期参数');
          }
          const date1 = new Date(dateStr1);
          const date2 = new Date(dateStr2);
          if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
            return this.errorResult('无效的日期格式');
          }
          result = date2.getTime() - date1.getTime();
          break;
        }
        default:
          return this.errorResult(`不支持的操作类型: ${operation}`);
      }

      return this.successResult(result);
    } catch (error: any) {
      return this.errorResult(`日期处理失败: ${error.message}`);
    }
  }

  private formatDate(date: Date, format: string): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return format
      .replace('YYYY', date.getFullYear().toString())
      .replace('MM', pad(date.getMonth() + 1))
      .replace('DD', pad(date.getDate()))
      .replace('HH', pad(date.getHours()))
      .replace('mm', pad(date.getMinutes()))
      .replace('ss', pad(date.getSeconds()));
  }
}
