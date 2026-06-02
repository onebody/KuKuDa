/**
 * 节点类型常量
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
 * 节点类型颜色映射
 */
export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  [NodeType.TEXT_INPUT]: '#2196F3',
  [NodeType.TEXT_OUTPUT]: '#4CAF50',
  [NodeType.LLM_CALL]: '#9C27B0',
  [NodeType.IMAGE_GENERATION]: '#FF9800',
  [NodeType.AI_IMAGE]: '#FF9800',
  [NodeType.IMAGE_INPUT]: '#2196F3',
  [NodeType.FILE_INPUT]: '#2196F3',
  [NodeType.CODE]: '#FF5722',
  [NodeType.CONDITION]: '#FFC107',
  [NodeType.LOOP]: '#009688',
};

/**
 * 节点类型标签映射
 */
export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  [NodeType.TEXT_INPUT]: '文本输入',
  [NodeType.TEXT_OUTPUT]: '文本输出',
  [NodeType.LLM_CALL]: 'LLM 调用',
  [NodeType.IMAGE_GENERATION]: '图片生成',
  [NodeType.AI_IMAGE]: 'AI绘图',
  [NodeType.IMAGE_INPUT]: '图片输入',
  [NodeType.FILE_INPUT]: '文件输入',
  [NodeType.CODE]: '代码',
  [NodeType.CONDITION]: '条件',
  [NodeType.LOOP]: '循环',
};
