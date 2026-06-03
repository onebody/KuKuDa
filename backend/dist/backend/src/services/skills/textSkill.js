"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextSkill = void 0;
const baseSkill_1 = require("./baseSkill");
class TextSkill extends baseSkill_1.BaseSkill {
    getDefinition() {
        return {
            id: 'text_processor',
            name: '文本处理器',
            description: '执行文本处理操作，包括转换大小写、分割、替换等',
            category: '工具',
            parameters: [
                {
                    name: 'text',
                    type: 'string',
                    description: '输入文本',
                    required: true,
                },
                {
                    name: 'operation',
                    type: 'string',
                    description: '操作类型: uppercase, lowercase, capitalize, trim, split, replace',
                    required: true,
                },
                {
                    name: 'delimiter',
                    type: 'string',
                    description: '分割符（仅split操作需要）',
                    required: false,
                    default: ',',
                },
                {
                    name: 'search',
                    type: 'string',
                    description: '搜索文本（仅replace操作需要）',
                    required: false,
                },
                {
                    name: 'replace',
                    type: 'string',
                    description: '替换文本（仅replace操作需要）',
                    required: false,
                    default: '',
                },
            ],
            returnType: 'string | string[]',
            returnDescription: '处理后的文本',
        };
    }
    async execute(parameters, _context) {
        const { text, operation } = parameters;
        try {
            let result = text;
            switch (operation.toLowerCase()) {
                case 'uppercase':
                    result = text.toUpperCase();
                    break;
                case 'lowercase':
                    result = text.toLowerCase();
                    break;
                case 'capitalize':
                    result = text.replace(/\b\w/g, (char) => char.toUpperCase());
                    break;
                case 'trim':
                    result = text.trim();
                    break;
                case 'split':
                    const delimiter = parameters.delimiter || ',';
                    result = text.split(delimiter);
                    break;
                case 'replace':
                    const search = parameters.search;
                    const replace = parameters.replace || '';
                    result = text.replace(new RegExp(search, 'g'), replace);
                    break;
                default:
                    return this.errorResult(`不支持的操作类型: ${operation}`);
            }
            return this.successResult(result);
        }
        catch (error) {
            return this.errorResult(`文本处理失败: ${error.message}`);
        }
    }
}
exports.TextSkill = TextSkill;
//# sourceMappingURL=textSkill.js.map