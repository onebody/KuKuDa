import axios, { AxiosInstance } from 'axios';
import { BaseAIAdapter, NodeResult } from './baseAdapter';
import { NodeConfig } from '../../types/workflow';

/**
 * 阿里通义千问 API 适配器
 */
export class QwenAdapter extends BaseAIAdapter {
  modelType: string = 'qwen';
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL: string;

  constructor(
    apiKey: string,
    baseURL: string = 'https://dashscope.aliyuncs.com/api/v1'
  ) {
    super();
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });
  }

  async execute(config: NodeConfig, inputData?: any): Promise<NodeResult> {
    try {
      const model = config.model || 'qwen-max';
      const prompt = config.prompt || '';
      const temperature = config.temperature || 0.7;
      const maxTokens = config.maxTokens || 2048;

      let messages: Array<{ role: string; content: string }> = [];

      if (inputData) {
        if (typeof inputData === 'string') {
          messages.push({ role: 'user', content: inputData });
        } else if (inputData.text) {
          messages.push({ role: 'user', content: inputData.text });
        }
      }

      if (prompt) {
        messages.push({ role: 'user', content: prompt });
      }

      if (messages.length === 0) {
        return { success: false, error: '没有提供输入数据或提示词' };
      }

      const response = await this.client.post('/chat/completions', {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      return {
        success: true,
        data: {
          text: response.data.choices[0].message.content,
          model: model,
          usage: response.data.usage,
        },
        executionTime: response.data.usage?.total_tokens,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  validateConfig(config: NodeConfig): boolean {
    if (!super.validateConfig(config)) return false;
    if (!this.apiKey) return false;
    return true;
  }
}
