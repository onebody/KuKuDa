import api from './api';

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
  code: number;
  data?: any;
  message: string;
  executionTime?: number;
}

export const skillService = {
  getAllSkills: async (): Promise<SkillDefinition[]> => {
    const response = await api.get('/api/skills');
    return response.data.data;
  },

  getSkillById: async (skillId: string): Promise<SkillDefinition> => {
    const response = await api.get(`/api/skills/${skillId}`);
    return response.data.data;
  },

  executeSkill: async (
    skillId: string,
    parameters: Record<string, any>,
    context?: Record<string, any>
  ): Promise<SkillExecutionResult> => {
    const response = await api.post(`/api/skills/${skillId}/execute`, {
      parameters,
      context,
    });
    return response.data;
  },
};
