import { BaseSkill } from './baseSkill';
import { SkillDefinition, SkillExecutionResult, SkillContext } from '../../types/skill';
export declare class TextSkill extends BaseSkill {
    getDefinition(): SkillDefinition;
    execute(parameters: Record<string, any>, _context: SkillContext): Promise<SkillExecutionResult>;
}
//# sourceMappingURL=textSkill.d.ts.map