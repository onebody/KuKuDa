/**
 * 前后端共享类型定义
 * 这些类型在前后端之间共享，确保类型一致性
 */

/**
 * 节点类型枚举
 */
export enum NodeType {
  TEXT_INPUT = 'TEXT_INPUT',
  TEXT_OUTPUT = 'TEXT_OUTPUT',
  AI_IMAGE = 'AI_IMAGE',
  IMAGE_INPUT = 'IMAGE_INPUT',
  FILE_INPUT = 'FILE_INPUT',
  PROMPT_OPTIMIZE = 'PROMPT_OPTIMIZE',
  SKILL = 'SKILL',
  LLM_CALL = 'LLM_CALL',
  IMAGE_GENERATION = 'IMAGE_GENERATION',
  IMAGE_OUTPUT = 'IMAGE_OUTPUT',
  CODE = 'CODE',
  CONDITION = 'CONDITION',
  LOOP = 'LOOP',
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
 * API响应格式
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}
