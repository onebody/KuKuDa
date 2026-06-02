// 用户相关类型
export interface User {
  id: string
  phone: string
  name: string
  avatar?: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type UserRole = 'USER' | 'ADMIN' | 'TEAM_ADMIN'

// API响应类型
export interface ApiResponse<T> {
  code: number
  data: T | null
  message: string
}

export interface PaginatedResponse<T> {
  code: number
  data: {
    items: T[]
    total: number
    page: number
    pageSize: number
  }
  message: string
}

// 认证相关
export interface LoginRequest {
  phone: string
  password: string
}

export interface RegisterRequest {
  phone: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

// 工作流相关类型
export type NodeType = 'TEXT_INPUT' | 'LLM' | 'IMAGE_GEN' | 'TEXT_OUTPUT' | 'IMAGE_OUTPUT' | 'AI_IMAGE'

export interface NodeData {
  id: string
  type: NodeType
  label: string
  inputs: Record<string, any>
  outputs: Record<string, any>
  status: ExecutionStatus
  config: Record<string, any>
  positionX?: number
  positionY?: number
  result?: string
  error?: string
  data?: Record<string, any>
}

export interface ConnectionData {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface WorkflowData {
  nodes: NodeData[]
  connections: ConnectionData[]
  viewport?: string | null
}

export type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

export interface Workflow {
  id: string
  name: string
  description?: string
  data: WorkflowData
  status: WorkflowStatus
  userId: string
  createdAt: string
  updatedAt: string
  user?: User
}

// 执行相关类型
export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface NodeExecution {
  id: string
  nodeId: string
  status: ExecutionStatus
  inputs: Record<string, any>
  outputs: Record<string, any>
  error?: string
  startedAt?: string
  completedAt?: string
}

export interface Execution {
  id: string
  workflowId: string
  status: ExecutionStatus
  nodeExecutions: NodeExecution[]
  startedAt: string
  completedAt?: string
  error?: string
  workflow?: Workflow
}

// 文件上传
export interface UploadResponse {
  url: string
  filename: string
  size: number
}
