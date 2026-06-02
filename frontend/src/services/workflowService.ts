import api from './api'
import { ApiResponse, Workflow, Execution } from '../types'

export const workflowService = {
  // 获取工作流列表
  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    const response = await api.get('/api/workflows')
    return response.data
  },

  // 创建工作流
  async createWorkflow(data: { name: string; description?: string }): Promise<ApiResponse<Workflow>> {
    const response = await api.post('/api/workflows', data)
    return response.data
  },

  // 获取工作流详情
  async getWorkflow(id: string): Promise<ApiResponse<Workflow>> {
    const response = await api.get(`/api/workflows/${id}`)
    return response.data
  },

  // 更新工作流
  async updateWorkflow(id: string, data: any): Promise<ApiResponse<Workflow>> {
    const response = await api.put(`/api/workflows/${id}`, data)
    return response.data
  },

  // 删除工作流
  async deleteWorkflow(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/api/workflows/${id}`)
    return response.data
  },

  // 执行工作流
  async executeWorkflow(id: string): Promise<ApiResponse<{ executionId: string; status: string }>> {
    const response = await api.post(`/api/workflows/${id}/execute`)
    return response.data
  },

  // 获取执行记录
  async getExecutions(id: string): Promise<ApiResponse<Execution[]>> {
    const response = await api.get(`/api/workflows/${id}/executions`)
    return response.data
  },

  // 添加节点
  async addNode(workflowId: string, node: any): Promise<ApiResponse<any>> {
    const response = await api.post(`/api/workflows/${workflowId}/nodes`, node)
    return response.data
  },

  // 更新节点
  async updateNode(nodeId: string, data: any): Promise<ApiResponse<any>> {
    const response = await api.put(`/api/nodes/${nodeId}`, data)
    return response.data
  },

  // 删除节点
  async deleteNode(nodeId: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/api/nodes/${nodeId}`)
    return response.data
  },

  // 添加连接
  async addConnection(workflowId: string, connection: any): Promise<ApiResponse<any>> {
    const response = await api.post(`/api/workflows/${workflowId}/connections`, connection)
    return response.data
  },

  // 删除连接
  async deleteConnection(connectionId: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/api/connections/${connectionId}`)
    return response.data
  }
}
