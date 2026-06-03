"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSkill = void 0;
class BaseSkill {
    validateParameters(parameters) {
        const definition = this.getDefinition();
        const errors = [];
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
    successResult(data, executionTime) {
        return {
            success: true,
            data,
            executionTime,
        };
    }
    errorResult(error) {
        return {
            success: false,
            error,
        };
    }
}
exports.BaseSkill = BaseSkill;
//# sourceMappingURL=baseSkill.js.map