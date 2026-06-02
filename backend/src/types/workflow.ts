/**
 * 工作流相关类型定义
 */

/**
 * 节点类型枚举
 */
export enum NodeType {
  TEXT_INPUT = 'TEXT_INPUT',
  TEXT_OUTPUT = 'TEXT_OUTPUT',
  LLM_CALL = 'LLM_CALL',
  IMAGE_GENERATION = 'IMAGE_GENERATION',
  AI_IMAGE = 'AI_IMAGE',
  IMAGE_INPUT = 'IMAGE_INPUT',
  FILE_INPUT = 'FILE_INPUT',
  CODE = 'CODE',
  CONDITION = 'CONDITION',
  LOOP = 'LOOP',
}

/**
 * 节点状态枚举
 */
export enum NodeStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

/**
 * 执行状态枚举
 */
export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * 节点数据接口
 */
export interface NodeData {
  [key: string]: any;
}

/**
 * 节点配置接口
 */
export interface NodeConfig {
  model?: string;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  imageSize?: string;
  [key: string]: any;
}

/**
 * 工作流节点接口
 */
export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  positionX: number;
  positionY: number;
  data?: NodeData;
  config?: NodeConfig;
}

/**
 * 节点连接接口
 */
export interface NodeConnectionData {
  id: string;
  sourceNodeId: string;
  sourceHandle: string;
  targetNodeId: string;
  targetHandle: string;
}

/**
 * 创建工作流请求
 */
export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  isTemplate?: boolean;
}

/**
 * 更新工作流请求
 */
export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  nodes?: WorkflowNode[];
  connections?: NodeConnectionData[];
  isTemplate?: boolean;
  isPublic?: boolean;
}

/**
 * 创建节点请求
 */
export interface CreateNodeRequest {
  type: NodeType;
  label: string;
  positionX: number;
  positionY: number;
  data?: NodeData;
  config?: NodeConfig;
}

/**
 * 更新节点请求
 */
export interface UpdateNodeRequest {
  label?: string;
  positionX?: number;
  positionY?: number;
  data?: NodeData;
  config?: NodeConfig;
}

/**
 * 创建连接请求
 */
export interface CreateConnectionRequest {
  sourceNodeId: string;
  sourceHandle: string;
  targetNodeId: string;
  targetHandle: string;
}
