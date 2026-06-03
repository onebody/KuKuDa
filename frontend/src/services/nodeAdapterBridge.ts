/**
 * 节点适配器桥接服务
 * 前端与后端节点适配器之间的桥梁
 * 负责调用后端API执行节点、处理响应
 */

import { NodeType, DataType, NodeOutput, NodeInput } from '../../../shared/types/node'
import api from './api'

/**
 * 节点执行请求接口
 */
interface NodeExecutionRequest {
  nodeId: string
  nodeType: string
  config: Record<string, any>
  input?: NodeInput
  context?: {
    executionId: string
    userId: string
    workflowId: string
    variables?: Record<string, any>
  }
}

/**
 * 工作流执行请求接口
 */
interface WorkflowExecutionRequest {
  workflowId: string
  executionId?: string
  nodes: Array<{
    id: string
    type: string
    config: Record<string, any>
  }>
  connections: Array<{
    id: string
    sourceNodeId: string
    targetNodeId: string
    sourceHandle?: string
    targetHandle?: string
  }>
}

/**
 * 节点适配器桥接服务类
 */
class NodeAdapterBridge {
  private baseUrl: string
  private timeout: number

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
    this.timeout = 30000 // 30秒超时
  }

  /**
   * 执行单个节点
   * @param request 节点执行请求
   * @returns 节点输出
   */
  async executeNode(request: NodeExecutionRequest): Promise<NodeOutput> {
    try {
      const response = await api.post<NodeOutput>(
        '/nodes/execute',
        request,
        { timeout: this.timeout }
      )
      return response.data
    } catch (error: any) {
      console.error('[NodeAdapterBridge] 节点执行失败:', error)
      
      // 返回标准错误格式
      return {
        status: 'ERROR',
        error: {
          code: 'BRIDGE_EXECUTION_FAILED',
          message: error.message || '节点执行失败',
          details: error.stack,
        },
        metadata: {
          nodeId: request.nodeId || 'unknown',
          executionTime: 0,
          timestamp: new Date(),
          upstreamNodeIds: [],
        },
      }
    }
  }

  /**
   * 执行工作流
   * @param request 工作流执行请求
   * @returns 工作流执行结果
   */
  async executeWorkflow(request: WorkflowExecutionRequest): Promise<any> {
    try {
      const response = await api.post(
        '/workflows/execute',
        request,
        { timeout: this.timeout * 2 }
      )
      return response.data
    } catch (error: any) {
      console.error('[NodeAdapterBridge] 工作流执行失败:', error)
      throw error
    }
  }

  /**
   * 验证节点配置
   * @param nodeType 节点类型
   * @param config 节点配置
   * @returns 验证结果
   */
  async validateNodeConfig(
    nodeType: string,
    config: Record<string, any>
  ): Promise<{ valid: boolean; errors: any[] }> {
    try {
      const response = await api.post(
        '/nodes/validate',
        { nodeType, config }
      )
      return response.data
    } catch (error: any) {
      console.error('[NodeAdapterBridge] 配置验证失败:', error)
      return {
        valid: false,
        errors: [
          {
            code: 'VALIDATION_REQUEST_FAILED',
            message: error.message || '配置验证请求失败',
          },
        ],
      }
    }
  }

  /**
   * 获取节点类型定义
   * @param nodeType 节点类型
   * @returns 节点类型定义
   */
  async getNodeTypeDefinition(nodeType: string): Promise<any> {
    try {
      const response = await api.get(`/nodes/types/${nodeType}`)
      return response.data
    } catch (error: any) {
      console.error('[NodeAdapterBridge] 获取节点类型定义失败:', error)
      throw error
    }
  }

  /**
   * 获取所有已注册的节点类型
   * @returns 节点类型列表
   */
  async getAllNodeTypes(): Promise<string[]> {
    try {
      const response = await api.get('/nodes/types')
      return response.data
    } catch (error: any) {
      console.error('[NodeAdapterBridge] 获取节点类型列表失败:', error)
      return []
    }
  }

  /**
   * 处理变量插值（前端预处理）
   * @param text 包含变量的文本
   * @param variables 变量上下文
   * @returns 解析后的文本
   */
  resolveVariables(text: string, variables: Record<string, any>): string {
    if (!text || typeof text !== 'string') {
      return text
    }

    // 匹配 {{nodeId.handleId}} 或 {{nodeId.handleId.field}} 模式
    return text.replace(
      /\{\{(\w+)\.(\w+)(?:\.(\w+))?\}\}/g,
      (match, nodeId, handleId, field) => {
        const nodeOutput = variables[nodeId]

        if (!nodeOutput) {
          console.warn(`[NodeAdapterBridge] 未找到节点 ${nodeId} 的输出`)
          return match
        }

        if (!nodeOutput.data) {
          console.warn(`[NodeAdapterBridge] 节点 ${nodeId} 没有输出数据`)
          return match
        }

        // 提取数据
        const data = nodeOutput.data

        if (field && data[handleId]) {
          // 支持嵌套路径
          const nestedData = data[handleId]
          if (nestedData && typeof nestedData === 'object' && field in nestedData) {
            return String(nestedData[field])
          }
          return match
        }

        if (data[handleId] !== undefined) {
          return String(data[handleId])
        }

        // 如果handleId是'text'，直接返回text字段
        if (handleId === 'text' && data.text) {
          return data.text
        }

        console.warn(
          `[NodeAdapterBridge] 未找到节点 ${nodeId} 的句柄 ${handleId}`
        )
        return match
      }
    )
  }

  /**
   * 批量执行节点（并行执行无依赖的节点）
   * @param requests 节点执行请求数组
   * @returns 节点输出数组
   */
  async executeNodesBatch(requests: NodeExecutionRequest[]): Promise<NodeOutput[]> {
    try {
      const response = await api.post(
        '/nodes/execute-batch',
        { nodes: requests },
        { timeout: this.timeout * requests.length }
      )
      return response.data
    } catch (error: any) {
      console.error('[NodeAdapterBridge] 批量执行节点失败:', error)
      
      // 返回标准错误格式
      return requests.map((req) => ({
        status: 'ERROR' as const,
        error: {
          code: 'BATCH_EXECUTION_FAILED',
          message: error.message || '批量执行失败',
          details: error.stack,
        },
        metadata: {
          nodeId: req.nodeId || 'unknown',
          executionTime: 0,
          timestamp: new Date(),
          upstreamNodeIds: [],
        },
      }))
    }
  }

  /**
   * 取消节点执行
   * @param executionId 执行ID
   * @param nodeId 节点ID（可选，不传则取消整个工作流）
   */
  async cancelExecution(executionId: string, nodeId?: string): Promise<void> {
    try {
      await api.post('/nodes/cancel', {
        executionId,
        nodeId,
      })
    } catch (error: any) {
      console.error('[NodeAdapterBridge] 取消执行失败:', error)
      throw error
    }
  }

  /**
   * 获取执行状态
   * @param executionId 执行ID
   * @returns 执行状态
   */
  async getExecutionStatus(executionId: string): Promise<any> {
    try {
      const response = await api.get(`/executions/${executionId}/status`)
      return response.data
    } catch (error: any) {
      console.error('[NodeAdapterBridge] 获取执行状态失败:', error)
      throw error
    }
  }
}

// 创建全局单例
const nodeAdapterBridge = new NodeAdapterBridge()

export default nodeAdapterBridge
export { NodeAdapterBridge }
export type { NodeExecutionRequest, WorkflowExecutionRequest }
