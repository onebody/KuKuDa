/**
 * AI模型适配器基类
 * 所有AI模型适配器都应该继承这个基类
 */
export interface NodeResult {
  text?: string
  imageUrl?: string
  error?: string
}

export interface NodeData {
  type: string
  config?: any
  input?: any
}

export abstract class BaseAIAdapter {
  abstract modelType: string

  /**
   * 执行节点
   * @param params 节点参数
   * @returns 执行结果
   */
  abstract execute(params: NodeData): Promise<NodeResult>

  /**
   * 验证配置
   * @param config 节点配置
   * @returns 是否有效
   */
  validateConfig(config: any): boolean {
    return true // 默认实现，子类可以重写
  }

  /**
   * 处理错误
   */
  protected handleError(error: any): NodeResult {
    console.error(`[${this.modelType}] Error:`, error)
    return {
      error: error.message || '执行失败'
    }
  }
}
