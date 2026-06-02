import { BaseSkill } from './baseSkill';
import { SkillDefinition, SkillExecutionResult, SkillContext } from '../../types/skill';
declare class SkillRegistry {
    private skills;
    register(skill: BaseSkill): void;
    get(skillId: string): BaseSkill | undefined;
    getAll(): BaseSkill[];
    getAllDefinitions(): SkillDefinition[];
    execute(skillId: string, parameters: Record<string, any>, context: SkillContext): Promise<SkillExecutionResult>;
}
export declare const skillRegistry: SkillRegistry;
export {};
//# sourceMappingURL=skillRegistry.d.ts.map