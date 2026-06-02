import axios, { AxiosInstance } from 'axios';
import { BaseAIAdapter, NodeResult } from './baseAdapter';
import { NodeConfig } from '../../types/workflow';

/**
 * 百度文心一言 API 适配器
 */
export class WenxinAdapter extends BaseAIAdapter {
  modelType: string = 'wenxin';
  private client: AxiosInstance;
  private apiKey: string;
  private secretKey: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(apiKey: string, secretKey: string) {
    super();
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.client = axios.create({
      baseURL: 'https://aip.baidu.com',
      timeout: 60000,
    });
  }

  /**
   * 获取 access_token
   */
  private async getAccessToken(): Promise<string> {
    // 检查 token 是否过期
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const res = await axios.get(
        'https://aip.baidu.com/oauth/2.0/token',
        {
          params: {
            grant_type: 'client_credentials',
            client_id: this.apiKey,
            client_secret: this.secretKey,
          },
        }
      );

      this.accessToken = res.data.access_token;
      // 提前 5 分钟过期
      this.tokenExpiry = Date.now() + (res.data.expires_in - 300) * 1000;

      return this.accessToken!;
    } catch (error: any) {
      return {
        success: false,
        error: '获取文心一言 access_token 失败: ' + error.message,
      } as NodeResult;
    }
  }

  async execute(config: NodeConfig, inputData?: any): Promise<NodeResult> {
    try {
      const model = config.model || 'ernie-4.0';
      const prompt = config.prompt || '';
      const temperature = config.temperature || 0.7;

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

      const token = await this.getAccessToken();
      if (!token) {
        return { success: false, error: '无法获取 access_token' };
      }

      const response = await this.client.post(
        `/rul/2.0/ernievilms/${model}?access_token=${token}`,
        {
          messages,
          temperature,
        }
      );

      return {
        success: true,
        data: {
          text: response.data.result,
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
    if (!this.apiKey || !this.secretKey) return false;
    return true;
  }
}
