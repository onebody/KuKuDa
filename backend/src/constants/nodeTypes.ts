/**
 * 节点类型常量
 * 前后端共享的节点类型定义
 */

/**
 * 节点类型枚举
 * 与 frontend/src/types/node.ts 和 shared/types/node.ts 保持一致
 */
export enum NodeType {
  // 源节点（5 种）
  TEXT_INPUT = 'TEXT_INPUT',
  IMAGE_INPUT_SINGLE = 'IMAGE_INPUT_SINGLE',
  IMAGE_INPUT_MULTI = 'IMAGE_INPUT_MULTI',
  FILE_INPUT_SINGLE = 'FILE_INPUT_SINGLE',
  FILE_INPUT_MULTI = 'FILE_INPUT_MULTI',

  // 处理节点（3 种）
  AI_IMAGE = 'AI_IMAGE',
  TEXT_OUTPUT = 'TEXT_OUTPUT',
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
 * 节点类型颜色映射
 */
export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  [NodeType.TEXT_INPUT]: '#2196F3',
  [NodeType.IMAGE_INPUT_SINGLE]: '#2196F3',
  [NodeType.IMAGE_INPUT_MULTI]: '#2196F3',
  [NodeType.FILE_INPUT_SINGLE]: '#2196F3',
  [NodeType.FILE_INPUT_MULTI]: '#2196F3',
  [NodeType.AI_IMAGE]: '#FF9800',
  [NodeType.TEXT_OUTPUT]: '#4CAF50',
  [NodeType.SKILL]: '#9C27B0',
};

/**
 * 节点类型标签映射
 */
export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  [NodeType.TEXT_INPUT]: '文本输入',
  [NodeType.IMAGE_INPUT_SINGLE]: '单图片输入',
  [NodeType.IMAGE_INPUT_MULTI]: '多图片输入',
  [NodeType.FILE_INPUT_SINGLE]: '单文件输入',
  [NodeType.FILE_INPUT_MULTI]: '多文件输入',
  [NodeType.AI_IMAGE]: 'AI绘图',
  [NodeType.TEXT_OUTPUT]: '文本输出',
  [NodeType.SKILL]: '技能节点',
};

/**
 * 所有有效的节点类型值数组（用于 Zod 验证等）
 */
export const NODE_TYPE_VALUES = Object.values(NodeType) as string[];
