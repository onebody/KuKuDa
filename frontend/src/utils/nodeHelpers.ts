/**
 * 节点辅助函数
 * 提供节点相关的工具函数
 */

import { NodeStatus } from '../types/node';
import { ExecutionStatus } from '../types/index';

/**
 * 获取节点状态对应的颜色
 * @param status - 节点状态
 * @returns 颜色字符串
 */
export const getNodeStatusColor = (status: NodeStatus): string => {
  switch (status) {
    case NodeStatus.IDLE:
      return '#9E9E9E'; // 灰色
    case NodeStatus.RUNNING:
      return '#2196F3'; // 蓝色
    case NodeStatus.SUCCESS:
      return '#4CAF50'; // 绿色
    case NodeStatus.ERROR:
      return '#F44336'; // 红色
    default:
      return '#9E9E9E';
  }
};

/**
 * 获取执行状态对应的颜色
 * @param status - 执行状态
 * @returns 颜色字符串
 */
export const getExecutionStatusColor = (status: ExecutionStatus): string => {
  switch (status) {
    case ExecutionStatus.PENDING:
      return '#FF9800'; // 橙色
    case ExecutionStatus.RUNNING:
      return '#2196F3'; // 蓝色
    case ExecutionStatus.COMPLETED:
      return '#4CAF50'; // 绿色
    case ExecutionStatus.FAILED:
      return '#F44336'; // 红色
    case ExecutionStatus.CANCELLED:
      return '#9E9E9E'; // 灰色
    default:
      return '#9E9E9E';
  }
};

/**
 * 获取节点类型的默认标签
 * @param nodeType - 节点类型
 * @returns 默认标签
 */
export const getNodeDefaultLabel = (nodeType: string): string => {
  const labelMap: Record<string, string> = {
    TEXT_INPUT: '文本输入',
    IMAGE_INPUT: '图片输入',
    FILE_INPUT: '文件输入',
    AI_IMAGE: 'AI绘图',
  };
  return labelMap[nodeType] || '节点';
};

/**
 * 验证节点连接是否合法
 * @param sourceType - 源节点类型
 * @param targetType - 目标节点类型
 * @returns 是否允许连接
 */
export const isConnectionValid = (
  sourceType: string,
  targetType: string
): boolean => {
  // 基本验证：允许所有连接
  // 可以根据业务需求添加更复杂的验证逻辑
  return true;
};

/**
 * 格式化节点执行结果
 * @param result - 执行结果
 * @returns 格式化后的字符串
 */
export const formatNodeResult = (result: any): string => {
  if (!result) return '';
  
  if (typeof result === 'string') {
    return result;
  }
  
  if (result.url) {
    return `[图片](${result.url})`;
  }
  
  if (result.text) {
    return result.text;
  }
  
  return JSON.stringify(result, null, 2);
};
