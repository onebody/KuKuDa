import { BaseSkill } from './baseSkill';
import { SkillDefinition, SkillExecutionResult, SkillContext } from '../../types/skill';
export declare class DateSkill extends BaseSkill {
    getDefinition(): SkillDefinition;
    execute(parameters: Record<string, any>, _context: SkillContext): Promise<SkillExecutionResult>;
    private formatDate;
}
//# sourceMappingURL=dateSkill.d.ts.map