/**
 * 节点类型常量
 */

/**
 * 节点类型枚举
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
  [NodeType.IMAGE_INPUT]: '#2196F3',
  [NodeType.FILE_INPUT]: '#2196F3',
  [NodeType.AI_IMAGE]: '#FF9800',
};

/**
 * 节点类型标签映射
 */
export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  [NodeType.TEXT_INPUT]: '文本输入',
  [NodeType.IMAGE_INPUT]: '图片输入',
  [NodeType.FILE_INPUT]: '文件输入',
  [NodeType.AI_IMAGE]: 'AI绘图',
};
