/**
 * 前端节点执行服务（重构版）
 * 使用适配器模式，通过 nodeAdapterBridge 调用后端API
 * 支持：文本输入、文本输出、AI绘图等节点类型
 */

import nodeAdapterBridge from './nodeAdapterBridge'
import { NodeType, NodeOutput, NodeInput } from '../../../shared/types/node'

// 重新导出类型（兼容旧代码）
export type { NodeExecutionRequest, WorkflowExecutionRequest } from './nodeAdapterBridge'

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
 * 执行单个节点（通过后端适配器）
 * @param nodeId 节点ID
 * @param nodeType 节点类型
 * @param config 节点配置
 * @param input 节点输入（可选）
 * @returns 节点输出
 */
export async function executeNode(
  nodeId: string,
  nodeType: string,
  config: Record<string, any>,
  input?: NodeInput
): Promise<NodeOutput> {
  try {
    const request: NodeExecutionRequest = {
      nodeId,
      nodeType,
      config,
      input,
      context: {
        executionId: `exec_${Date.now()}`,
        userId: getCurrentUserId(),
        workflowId: getCurrentWorkflowId(),
      },
    }

    const result = await nodeAdapterBridge.executeNode(request)
    return result
  } catch (error: any) {
    console.error('[nodeExecutionService] 节点执行失败:', error)
    
    return {
      status: 'ERROR',
      error: {
        code: 'NODE_EXECUTION_FAILED',
        message: error.message || '节点执行失败',
        details: error.stack,
      },
      metadata: {
        nodeId,
        executionTime: 0,
        timestamp: new Date(),
        upstreamNodeIds: [],
      },
    }
  }
}

/**
 * 执行工作流（通过后端执行引擎）
 * @param workflowId 工作流ID
 * @param nodes 节点数组
 * @param connections 连接数组
 * @returns 工作流执行结果
 */
export async function executeWorkflow(
  workflowId: string,
  nodes: Array<{
    id: string
    type: string
    config: Record<string, any>
  }>,
  connections: Array<{
    id: string
    sourceNodeId: string
    targetNodeId: string
    sourceHandle?: string
    targetHandle?: string
  }>
): Promise<any> {
  try {
    const request = {
      workflowId,
      executionId: `exec_${Date.now()}`,
      nodes,
      connections,
    }

    const result = await nodeAdapterBridge.executeWorkflow(request)
    return result
  } catch (error: any) {
    console.error('[nodeExecutionService] 工作流执行失败:', error)
    throw error
  }
}

/**
 * 验证节点配置
 * @param nodeType 节点类型
 * @param config 节点配置
 * @returns 验证结果
 */
export async function validateNodeConfig(
  nodeType: string,
  config: Record<string, any>
): Promise<{ valid: boolean; errors: any[] }> {
  try {
    const result = await nodeAdapterBridge.validateNodeConfig(nodeType, config)
    return result
  } catch (error: any) {
    console.error('[nodeExecutionService] 配置验证失败:', error)
    return {
      valid: false,
      errors: [
        {
          code: 'VALIDATION_FAILED',
          message: error.message || '配置验证失败',
        },
      ],
    }
  }
}

/**
 * 获取当前用户ID（辅助函数）
 */
function getCurrentUserId(): string {
  // 从 localStorage 或 auth store 获取
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return user.id || 'anonymous'
    } catch (e) {
      return 'anonymous'
    }
  }
  return 'anonymous'
}

/**
 * 获取当前工作流ID（辅助函数）
 */
function getCurrentWorkflowId(): string {
  // 从 URL 或 state 获取
  const path = window.location.pathname
  const match = path.match(/\/workflow\/(\w+)/)
  if (match) {
    return match[1]
  }
  return 'unknown'
}

/**
 * 处理变量插值（前端预处理）
 * @param text 包含变量的文本
 * @param variables 变量上下文
 * @returns 解析后的文本
 */
export function resolveVariables(
  text: string,
  variables: Record<string, any>
): string {
  return nodeAdapterBridge.resolveVariables(text, variables)
}

/**
 * 批量执行节点
 * @param requests 节点执行请求数组
 * @returns 节点输出数组
 */
export async function executeNodesBatch(
  requests: NodeExecutionRequest[]
): Promise<NodeOutput[]> {
  try {
    const result = await nodeAdapterBridge.executeNodesBatch(requests)
    return result
  } catch (error: any) {
    console.error('[nodeExecutionService] 批量执行失败:', error)
    
    return requests.map((req) => ({
      status: 'ERROR' as const,
      error: {
        code: 'BATCH_EXECUTION_FAILED',
        message: error.message || '批量执行失败',
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
 * @param nodeId 节点ID（可选）
 */
export async function cancelExecution(
  executionId: string,
  nodeId?: string
): Promise<void> {
  try {
    await nodeAdapterBridge.cancelExecution(executionId, nodeId)
  } catch (error: any) {
    console.error('[nodeExecutionService] 取消执行失败:', error)
    throw error
  }
}

/**
 * 获取执行状态
 * @param executionId 执行ID
 * @returns 执行状态
 */
export async function getExecutionStatus(executionId: string): Promise<any> {
  try {
    const result = await nodeAdapterBridge.getExecutionStatus(executionId)
    return result
  } catch (error: any) {
    console.error('[nodeExecutionService] 获取执行状态失败:', error)
    throw error
  }
}

/**
 * 兼容性函数：保持与旧代码的兼容性
 * @deprecated 请使用 executeNode 代替
 */
export async function executeNodeLegacy(
  model: string,
  prompt: string,
  images?: string[],
  temperature?: number,
  maxTokens?: number
): Promise<{ success: boolean; text?: string; imageUrls?: string[]; error?: string }> {
  console.warn('[nodeExecutionService] executeNodeLegacy 已弃用，请使用 executeNode')
  
  // 根据模型类型判断是文本还是图片
  const isImageModel = model.toLowerCase().includes('image') ||
    model.toLowerCase().includes('dall') ||
    model.toLowerCase().includes('stable')
  
  if (isImageModel) {
    // 图片生成
    const result = await executeNode(`node_${Date.now()}`, NodeType.AI_IMAGE, {
      model,
      prompt,
      count: 1,
      size: '1024x1024',
    })
    
    if (result.status === 'SUCCESS' && result.data) {
      return {
        success: true,
        imageUrls: result.data.imageUrls || [],
      }
    } else {
      return {
        success: false,
        error: result.error?.message || '执行失败',
      }
    }
  } else {
    // 文本生成
    const result = await executeNode(`node_${Date.now()}`, NodeType.LLM_CALL, {
      model,
      prompt,
      temperature,
      maxTokens,
    })
    
    if (result.status === 'SUCCESS' && result.data) {
      return {
        success: true,
        text: result.data.text || '',
      }
    } else {
      return {
        success: false,
        error: result.error?.message || '执行失败',
      }
    }
  }
}

// 导出默认对象（保持与旧代码的兼容性）
export default {
  executeNode,
  executeWorkflow,
  validateNodeConfig,
  resolveVariables,
  executeNodesBatch,
  cancelExecution,
  getExecutionStatus,
  executeNodeLegacy,
}
