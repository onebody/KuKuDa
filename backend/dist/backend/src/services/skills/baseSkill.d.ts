import { SkillDefinition, SkillExecutionResult, SkillContext } from '../../types/skill';
export declare abstract class BaseSkill {
    abstract getDefinition(): SkillDefinition;
    abstract execute(parameters: Record<string, any>, context: SkillContext): Promise<SkillExecutionResult>;
    validateParameters(parameters: Record<string, any>): {
        valid: boolean;
        errors: string[];
    };
    protected successResult(data: any, executionTime?: number): SkillExecutionResult;
    protected errorResult(error: string): SkillExecutionResult;
}
//# sourceMappingURL=baseSkill.d.ts.map