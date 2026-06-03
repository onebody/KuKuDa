"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathSkill = void 0;
const baseSkill_1 = require("./baseSkill");
class MathSkill extends baseSkill_1.BaseSkill {
    getDefinition() {
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
    async execute(parameters, _context) {
        const expression = parameters.expression;
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
        }
        catch (error) {
            return this.errorResult(`计算失败: ${error.message}`);
        }
    }
}
exports.MathSkill = MathSkill;
//# sourceMappingURL=mathSkill.js.map