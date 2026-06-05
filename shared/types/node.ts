/**
 * 前后端共享类型定义
 * 这些类型在前后端之间共享，确保类型一致性
 */

/**
 * 节点类型枚举
 * M1 里程碑：8 种节点类型（5 种源节点 + 3 种处理节点）
 */
export enum NodeType {
  // 源节点（5 种）
  TEXT_INPUT = 'TEXT_INPUT',                    // 文本输入节点
  IMAGE_INPUT_SINGLE = 'IMAGE_INPUT_SINGLE',  // 单图片输入节点
  IMAGE_INPUT_MULTI = 'IMAGE_INPUT_MULTI',    // 多图片输入节点
  FILE_INPUT_SINGLE = 'FILE_INPUT_SINGLE',     // 单文件输入节点
  FILE_INPUT_MULTI = 'FILE_INPUT_MULTI',       // 多文件输入节点

  // 处理节点（3 种）
  AI_IMAGE = 'AI_IMAGE',                      // AI 绘图节点
  TEXT_OUTPUT = 'TEXT_OUTPUT',                // 文本输出节点
  SKILL = 'SKILL',                           // 技能节点
}

/**
 * 数据类型枚举
 */
export enum DataType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  JSON = 'JSON',
  BINARY = 'BINARY',
  ANY = 'ANY',
}

/**
 * 节点分类枚举
 */
export enum NodeCategory {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  PROCESSING = 'PROCESSING',
  AI = 'AI',
  LOGIC = 'LOGIC',
}

/**
 * 配置字段类型
 */
export type FieldType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'file'
  | 'image'

/**
 * 端口定义
 */
export interface PortDefinition {
  id: string;
  label: string;
  dataType: DataType;
}

/**
 * 配置字段定义
 */
export interface ConfigField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue: any;
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  description?: string;
  min?: number;
  max?: number;
  validate?: (value: any) => ValidationError | null;
}

/**
 * 配置Schema
 */
export interface ConfigSchema {
  fields: ConfigField[];
  validate: (values: Record<string, any>) => ValidationResult;
}

/**
 * 验证错误
 */
export interface ValidationError {
  field?: string;
  code: string;
  message: string;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * 输出数据
 */
export interface OutputData {
  text?: string;
  imageUrls?: string[];
  files?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
    metadata?: Record<string, any>;
  }>;
  json?: Record<string, any>;
  binary?: Buffer;
}

/**
 * 错误信息
 */
export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
}

/**
 * 执行元数据
 */
export interface ExecutionMetadata {
  nodeId: string;
  executionTime: number;
  timestamp: Date;
  upstreamNodeIds: string[];
}

/**
 * 节点执行输出
 */
export interface NodeOutput {
  status: 'SUCCESS' | 'ERROR' | 'RUNNING';
  data?: OutputData;
  error?: ErrorInfo;
  metadata?: ExecutionMetadata;
}

/**
 * 节点输入
 */
export interface NodeInput {
  [handleId: string]: OutputData | undefined;
}

/**
 * 节点类型定义（注册用）
 */
export interface NodeTypeDefinition {
  type: string;
  label: string;
  icon: string;
  description: string;
  category: NodeCategory;
  configSchema: ConfigSchema;
  component: any; // React.FC<any>
  adapterClass: new () => any; // new () => BaseNodeAdapter
  maxInstances?: number;
}

/**
 * 节点元数据
 */
export interface NodeMetadata {
  id: string;
  type: string;
  label: string;
  config: Record<string, any>;
  inputPorts: PortDefinition[];
  outputPorts: PortDefinition[];
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR';
  result?: NodeOutput;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 标准错误格式（前后端统一）
 */
export interface StandardError {
  code: string;
  message: string;
  details?: any;
}

/**
 * 源节点数据接口（5 种）
 */

/**
 * 文本输入节点数据
 */
export interface TextInputNodeData {
  text: string;
  placeholder?: string;
}

/**
 * 单图片输入节点数据
 */
export interface SingleImageInputNodeData {
  imageUrl: string | null;
  fileName?: string;
  fileSize?: number;
}

/**
 * 多图片输入节点数据
 */
export interface MultiImageInputNodeData {
  imageUrls: Array<{
    url: string;
    fileName: string;
    fileSize: number;
    index: number;
  }>;
  maxCount: number; // 最大 20 个
}

/**
 * 单文件输入节点数据
 */
export interface SingleFileInputNodeData {
  fileUrl: string | null;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

/**
 * 多文件输入节点数据
 */
export interface MultiFileInputNodeData {
  fileUrls: Array<{
    url: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }>;
  maxCount: number; // 不限制或限制 50 个
}

/**
 * 处理节点数据接口（3 种）
 */

/**
 * AI 绘图节点数据
 */
export interface AIImageNodeData {
  prompt: string;
  negativePrompt?: string;
  imageSize: '256x256' | '512x512' | '1024x1024';
  imageUrl?: string; // 生成的图片 URL
  generating: boolean;
}

/**
 * 文本输出节点数据
 */
export interface TextOutputNodeData {
  outputText: string;
 上游文本?: string; // 从上游节点读取
}

/**
 * 技能节点数据
 */
export interface SkillNodeData {
  skillId: string;
  skillName?: string;
  config: Record<string, any>; // 技能配置（动态表单）
  result?: any; // 技能执行结果
  executing: boolean;
}

/**
 * API响应格式
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}
