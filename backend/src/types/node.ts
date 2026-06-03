/**
 * 后端节点类型定义
 * 定义后端节点相关的类型和接口
 */

import {
  NodeType,
  DataType,
  NodeCategory,
  PortDefinition,
  ConfigField,
  ConfigSchema,
  OutputData,
  ErrorInfo,
  ExecutionMetadata,
  NodeOutput,
  NodeInput,
  NodeTypeDefinition,
  NodeMetadata,
  StandardError,
  ValidationResult,
  ValidationError,
} from '../../../shared/types/node'

// 重新导出共享类型
export {
  NodeType,
  DataType,
  NodeCategory,
  PortDefinition,
  ConfigField,
  ConfigSchema,
  OutputData,
  ErrorInfo,
  ExecutionMetadata,
  NodeOutput,
  NodeInput,
  NodeTypeDefinition,
  NodeMetadata,
  StandardError,
  ValidationResult,
  ValidationError,
}

/**
 * 节点执行上下文
 */
export interface ExecutionContext {
  executionId: string
  userId: string
  workflowId: string
  variables?: Record<string, any>
  timeout?: number
}

/**
 * 节点执行结果
 */
export interface NodeExecutionResult {
  nodeId: string
  nodeType: string
  status: 'SUCCESS' | 'ERROR' | 'RUNNING'
  output?: NodeOutput
  startTime: Date
  endTime?: Date
  duration?: number
}

/**
 * 工作流执行结果
 */
export interface WorkflowExecutionResult {
  executionId: string
  workflowId: string
  status: 'SUCCESS' | 'ERROR' | 'RUNNING'
  nodeResults: NodeExecutionResult[]
  startTime: Date
  endTime?: Date
  duration?: number
  error?: StandardError
}

/**
 * 节点适配器接口（抽象基类）
 */
export interface INodeAdapter {
  nodeType: string
  configSchema: ConfigSchema
  validate(input: NodeInput, config: Record<string, any>): ValidationResult
  execute(
    input: NodeInput,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeOutput>
  getMetadata(): NodeMetadata
}

/**
 * 变量插值上下文
 */
export interface VariableInterpolationContext {
  nodes: Map<string, any>
  edges: any[]
  results: Map<string, NodeOutput>
}

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}
