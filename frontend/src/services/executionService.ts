import api from './api'
import { ApiResponse, Execution } from '../types'

export const executionService = {
  execute: async (workflowId: string, nodeIds?: string[]): Promise<ApiResponse<Execution>> => {
    const response = await api.post(`/api/workflows/${workflowId}/execute`, { nodeIds })
    return response.data
  },

  getByWorkflow: async (workflowId: string): Promise<ApiResponse<Execution[]>> => {
    const response = await api.get(`/api/workflows/${workflowId}/executions`)
    return response.data
  },

  getById: async (id: string): Promise<ApiResponse<Execution | null>> => {
    const response = await api.get(`/api/executions/${id}`)
    return response.data
  },

  cancel: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/api/executions/${id}/cancel`)
    return response.data
  }
}
