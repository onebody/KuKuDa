import axios from 'axios'
import { BaseAIAdapter, NodeData, NodeResult } from './baseAdapter'

export class OpenAIAdapter extends BaseAIAdapter {
  modelType = 'OpenAI'

  private apiKey: string
  private apiUrl = 'https://api.openai.com/v1/chat/completions'

  constructor(apiKey: string) {
    super()
    this.apiKey = apiKey
  }

  async execute(params: NodeData): Promise<NodeResult> {
    try {
      const { config, input } = params

      // 构建请求体
      const requestBody = {
        model: config?.model || 'gpt-4',
        messages: [
          {
            role: 'user',
            content: input?.text || config?.prompt || ''
          }
        ],
        temperature: config?.temperature || 0.7,
        max_tokens: config?.maxTokens || 2000
      }

      // 调用OpenAI API
      const response = await axios.post(this.apiUrl, requestBody, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      // 解析结果
      const result = response.data
      const text = result.choices?.[0]?.message?.content || ''

      return {
        text
      }
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  validateConfig(config: any): boolean {
    return !!this.apiKey && !!config?.model
  }
}
