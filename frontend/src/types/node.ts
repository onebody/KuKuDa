/**
 * 节点相关类型定义（前端）
 */

/**
 * 节点类型枚举
 */
export enum NodeType {
  TEXT_INPUT = 'TEXT_INPUT',
  TEXT_OUTPUT = 'TEXT_OUTPUT',
  LLM_CALL = 'LLM_CALL',
  IMAGE_GENERATION = 'IMAGE_GENERATION',
  IMAGE_INPUT = 'IMAGE_INPUT',
  FILE_INPUT = 'FILE_INPUT',
  IMAGE_OUTPUT = 'IMAGE_OUTPUT',
  AI_IMAGE = 'AI_IMAGE',
  CODE = 'CODE',
  CONDITION = 'CONDITION',
  LOOP = 'LOOP',
  SKILL = 'SKILL',
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
 * React Flow 节点数据
 */
export interface ReactFlowNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    nodeType: NodeType;
    status: NodeStatus;
    config?: NodeConfig;
    result?: any;
    error?: string;
    [key: string]: any;
  };
}

/**
 * React Flow 连接（边）
 */
export interface ReactFlowEdge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  label?: string;
}

/**
 * 节点配置
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
 * 后端节点数据
 */
export interface NodeData {
  id: string;
  type: NodeType;
  label: string;
  positionX: number;
  positionY: number;
  data?: any;
  config?: NodeConfig;
  status: NodeStatus;
  result?: any;
  error?: string;
  executedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 后端连接数据
 */
export interface ConnectionData {
  id: string;
  sourceNodeId: string;
  sourceHandle: string;
  targetNodeId: string;
  targetHandle: string;
  createdAt: string;
}
