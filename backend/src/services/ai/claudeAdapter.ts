import axios, { AxiosInstance } from 'axios';
import { BaseAIAdapter, NodeResult } from './baseAdapter';
import { NodeConfig } from '../../types/workflow';

/**
 * Anthropic Claude API 适配器
 * 支持 Claude 3 系列模型
 */
export class ClaudeAdapter extends BaseAIAdapter {
  modelType: string = 'claude';
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL: string;

  /**
   * 构造函数
   * @param apiKey - Anthropic API Key
   * @param baseURL - API 基础 URL（可选，默认 https://api.anthropic.com）
   */
  constructor(
    apiKey: string,
    baseURL: string = 'https://api.anthropic.com'
  ) {
    super();
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 秒超时
    });
  }

  /**
   * 执行 Claude 模型调用
   * @param config - 节点配置
   * @param inputData - 输入数据
   * @returns 执行结果
   */
  async execute(
    config: NodeConfig,
    inputData?: any
  ): Promise<NodeResult> {
    try {
      const model = config.model || 'claude-3-opus-20240229';
      const prompt = config.prompt || '';
      const temperature = config.temperature || 0.7;
      const maxTokens = config.maxTokens || 2048;

      // 构建消息
      let userMessage = '';

      // 添加输入数据（如果有）
      if (inputData) {
        if (typeof inputData === 'string') {
          userMessage += inputData + '\n\n';
        } else if (inputData.text) {
          userMessage += inputData.text + '\n\n';
        }
      }

      // 添加提示词
      if (prompt) {
        userMessage += prompt;
      }

      // 如果没有消息，返回错误
      if (!userMessage.trim()) {
        return {
          success: false,
          error: '没有提供输入数据或提示词',
        };
      }

      // 调用 Claude API
      const response = await this.client.post('/v1/messages', {
        model,
        messages: [{ role: 'user', content: userMessage }],
        temperature,
        max_tokens: maxTokens,
      });

      const result = response.data.content[0].text;

      return {
        success: true,
        data: {
          text: result,
          model: model,
          usage: response.data.usage,
        },
        executionTime: response.data.usage?.input_tokens + response.data.usage?.output_tokens,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * 验证配置
   * @param config - 节点配置
   * @returns 是否有效
   */
  validateConfig(config: NodeConfig): boolean {
    if (!super.validateConfig(config)) return false;
    if (!this.apiKey) return false;
    return true;
  }
}
