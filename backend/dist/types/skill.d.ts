export interface SkillParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    required: boolean;
    default?: any;
}
export interface SkillDefinition {
    id: string;
    name: string;
    description: string;
    category: string;
    parameters: SkillParameter[];
    returnType: string;
    returnDescription: string;
}
export interface SkillExecutionResult {
    success: boolean;
    data?: any;
    error?: string;
    executionTime?: number;
}
export interface SkillContext {
    workflowId?: string;
    nodeId?: string;
    userId?: string;
    inputData?: Record<string, any>;
}
//# sourceMappingURL=skill.d.ts.map