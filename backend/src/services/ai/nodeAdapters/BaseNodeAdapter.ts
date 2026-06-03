/**
 * 节点适配器基类（新架构）
 * 所有节点适配器都应该继承这个基类
 * 提供统一的节点执行接口
 */

import {
  NodeInput,
  NodeOutput,
  ConfigSchema,
  ValidationResult,
  StandardError,
} from 'shared/types/node'
import { LogLevel, ExecutionContext } from '../../../types/node'

/**
 * 节点适配器抽象基类
 * 所有节点适配器都应该继承这个基类
 */
export abstract class BaseNodeAdapter {
  /**
   * 节点类型
   */
  abstract nodeType: string

  /**
   * 配置Schema
   */
  abstract configSchema: ConfigSchema

  /**
   * 验证节点输入和配置
   * @param input 节点输入
   * @param config 节点配置
   * @returns 验证结果
   */
  validate(input: NodeInput, config: Record<string, any>): ValidationResult {
    try {
      // 验证配置
      const configValidation = this.configSchema.validate(config)
      if (!configValidation.valid) {
        return configValidation
      }

      // 验证输入（基本验证）
      if (input && typeof input !== 'object') {
        return {
          valid: false,
          errors: [
            {
              code: 'INVALID_INPUT',
              message: '节点输入必须是对象类型',
            },
          ],
        }
      }

      return { valid: true, errors: [] }
    } catch (error: any) {
      return {
        valid: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            message: error.message || '验证过程中发生错误',
          },
        ],
      }
    }
  }

  /**
   * 执行节点（核心方法）
   * @param input 节点输入
   * @param config 节点配置
   * @param context 执行上下文
   * @returns 节点输出
   */
  abstract execute(
    input: NodeInput,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeOutput>

  /**
   * 获取节点元数据
   * @returns 节点元数据
   */
  getMetadata(): Record<string, any> {
    return {
      nodeType: this.nodeType,
      configSchema: this.configSchema,
    }
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @returns 标准错误对象
   */
  protected handleError(error: any): StandardError {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    this.log(LogLevel.ERROR, `节点执行失败: ${errorMessage}`, errorStack)

    return {
      code: 'EXECUTION_ERROR',
      message: errorMessage,
      details: errorStack,
    }
  }

  /**
   * 创建成功输出
   * @param data 输出数据
   * @param metadata 执行元数据
   * @returns 节点输出
   */
  protected createSuccessOutput(
    data: any,
    metadata?: any
  ): NodeOutput {
    return {
      status: 'SUCCESS',
      data,
      metadata,
    }
  }

  /**
   * 创建错误输出
   * @param error 错误信息
   * @returns 节点输出
   */
  protected createErrorOutput(error: StandardError): NodeOutput {
    return {
      status: 'ERROR',
      error,
    }
  }

  /**
   * 日志记录
   * @param level 日志级别
   * @param message 日志消息
   * @param details 详细信息
   */
  protected log(level: LogLevel, message: string, details?: any): void {
    const prefix = `[${this.nodeType}]`

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${message}`, details)
        break
      case LogLevel.INFO:
        console.info(`${prefix} ${message}`)
        break
      case LogLevel.WARN:
        console.warn(`${prefix} ${message}`, details)
        break
      case LogLevel.ERROR:
        console.error(`${prefix} ${message}`, details)
        break
    }
  }

  /**
   * 解析变量插值
   * @param text 包含变量的文本
   * @param variables 变量上下文
   * @returns 解析后的文本
   */
  protected resolveVariableInterpolation(
    text: string,
    variables: Record<string, any>
  ): string {
    if (!text || typeof text !== 'string') {
      return text
    }

    // 匹配 {{nodeId.handleId}} 模式
    return text.replace(/\{\{(\w+)\.(\w+)\}\}/g, (match, nodeId, handleId) => {
      const nodeResult = variables[nodeId]
      if (!nodeResult) {
        this.log(LogLevel.WARN, `未找到节点 ${nodeId} 的输出`)
        return match
      }

      // 从输出中提取数据
      if (nodeResult.data) {
        if (handleId === 'text' && nodeResult.data.text) {
          return nodeResult.data.text
        }
        if (handleId === 'imageUrls' && nodeResult.data.imageUrls) {
          return nodeResult.data.imageUrls.join(',')
        }
        if (handleId in nodeResult.data) {
          return String(nodeResult.data[handleId])
        }
      }

      this.log(LogLevel.WARN, `未找到节点 ${nodeId} 的句柄 ${handleId}`)
      return match
    })
  }
}
