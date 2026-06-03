import { BaseSkill } from './baseSkill';
import { SkillDefinition, SkillExecutionResult, SkillContext } from '../../types/skill';
export declare class MathSkill extends BaseSkill {
    getDefinition(): SkillDefinition;
    execute(parameters: Record<string, any>, _context: SkillContext): Promise<SkillExecutionResult>;
}
//# sourceMappingURL=mathSkill.d.ts.map