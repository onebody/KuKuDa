/**
 * 节点类型常量定义
 */

import { NodeType } from '../types/node';

/**
 * 节点类型信息
 */
export interface NodeTypeInfo {
  type: NodeType;
  label: string;
  description: string;
  category: 'input' | 'output' | 'ai' | 'tool';
  color: string;
  icon: string;
}

/**
 * 所有可用节点类型
 */
export const NODE_TYPES: NodeTypeInfo[] = [
  {
    type: NodeType.TEXT_INPUT,
    label: '文本输入',
    description: '输入文本内容',
    category: 'input',
    color: '#2196F3', // 蓝色
    icon: 'TextFields',
  },
  {
    type: NodeType.TEXT_OUTPUT,
    label: '文本输出',
    description: '显示文本结果',
    category: 'output',
    color: '#4CAF50', // 绿色
    icon: 'TextSnippet',
  },
  {
    type: NodeType.LLM_CALL,
    label: 'LLM 调用',
    description: '调用大语言模型',
    category: 'ai',
    color: '#9C27B0', // 紫色
    icon: 'SmartToy',
  },
  {
    type: NodeType.IMAGE_GENERATION,
    label: '图片生成',
    description: '使用 AI 生成图片',
    category: 'ai',
    color: '#FF9800', // 橙色
    icon: 'Image',
  },
  {
    type: NodeType.IMAGE_INPUT,
    label: '图片输入',
    description: '上传或选择图片',
    category: 'input',
    color: '#2196F3', // 蓝色
    icon: 'Upload',
  },
  {
    type: NodeType.FILE_INPUT,
    label: '文件输入',
    description: '上传文件',
    category: 'input',
    color: '#2196F3', // 蓝色
    icon: 'AttachFile',
  },
  {
    type: NodeType.SKILL,
    label: '技能调用',
    description: '调用工作流技能',
    category: 'tool',
    color: '#00BCD4', // 青色
    icon: 'Zap',
  },
];

/**
 * 根据节点类型获取节点信息
 * @param type - 节点类型
 * @returns 节点类型信息
 */
export const getNodeTypeInfo = (
  type: NodeType
): NodeTypeInfo | undefined => {
  return NODE_TYPES.find((nodeType) => nodeType.type === type);
};

/**
 * 根据类别获取节点类型列表
 * @param category - 节点类别
 * @returns 节点类型列表
 */
export const getNodeTypesByCategory = (
  category: 'input' | 'output' | 'ai' | 'tool'
): NodeTypeInfo[] => {
  return NODE_TYPES.filter((nodeType) => nodeType.category === category);
};

/**
 * 节点类别标签映射
 */
export const NODE_CATEGORY_LABELS: Record<string, string> = {
  input: '输入节点',
  output: '输出节点',
  ai: 'AI 节点',
  tool: '工具节点',
};
