// 节点类型定义
export type NodeType =
  | 'TEXT_INPUT'
  | 'IMAGE_INPUT'
  | 'FILE_INPUT'
  | 'AI_IMAGE'

// 节点状态
export type NodeStatus = 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR'

// 工作流节点
export interface WorkflowNode {
  id: string
  workflowId: string
  type: NodeType
  label: string
  positionX: number
  positionY: number
  data?: any
  config?: any
  status: NodeStatus
  result?: any
  error?: string
  executedAt?: string
  createdAt: string
  updatedAt: string
}

// 节点连接
export interface NodeConnection {
  id: string
  workflowId: string
  sourceNodeId: string
  sourceHandle: string
  targetNodeId: string
  targetHandle: string
  createdAt: string
}

// 工作流
export interface Workflow {
  id: string
  name: string
  description?: string
  userId: string
  isTemplate: boolean
  isPublic: boolean
  thumbnail?: string
  nodes: WorkflowNode[]
  connections: NodeConnection[]
  createdAt: string
  updatedAt: string
  lastExecutedAt?: string
}

// 执行记录
export interface Execution {
  id: string
  workflowId: string
  userId: string
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
  triggeredBy: string
  startedAt: string
  completedAt?: string
  error?: string
  nodeResults?: any
}
