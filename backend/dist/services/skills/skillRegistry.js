"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillRegistry = void 0;
class SkillRegistry {
    constructor() {
        this.skills = new Map();
    }
    register(skill) {
        const definition = skill.getDefinition();
        this.skills.set(definition.id, skill);
    }
    get(skillId) {
        return this.skills.get(skillId);
    }
    getAll() {
        return Array.from(this.skills.values());
    }
    getAllDefinitions() {
        return this.getAll().map((skill) => skill.getDefinition());
    }
    async execute(skillId, parameters, context) {
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message || '技能执行失败',
            };
        }
    }
}
exports.skillRegistry = new SkillRegistry();
//# sourceMappingURL=skillRegistry.js.map