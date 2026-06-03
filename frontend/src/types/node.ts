/**
 * 节点相关类型定义（前端）
 */

import { 
  NodeType as SharedNodeType, 
  NodeCategory, 
  DataType, 
  PortDefinition, 
  ConfigSchema, 
  NodeOutput, 
  NodeInput 
} from '../../../shared/types/node'

// 重新导出共享类型
export type { NodeCategory, DataType, PortDefinition, ConfigSchema, NodeOutput, NodeInput }

/**
 * 节点类型枚举（扩展自共享类型）
 */
export enum NodeType {
  TEXT_INPUT = 'TEXT_INPUT',
  IMAGE_INPUT = 'IMAGE_INPUT',
  FILE_INPUT = 'FILE_INPUT',
  AI_IMAGE = 'AI_IMAGE',
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
    collapsed?: boolean;
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
