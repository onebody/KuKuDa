import { create } from 'zustand'
import { Workflow } from '../types'
import { workflowService } from '../services/workflowService'
import { toast } from 'react-hot-toast'

interface WorkflowListItem {
  id: string
  name: string
  status: string
  updatedAt: string
}

interface WorkflowStore {
  workflows: WorkflowListItem[]
  currentWorkflow: Workflow | null
  isLoading: boolean
  total: number
  currentPage: number
  pageSize: number
  fetchWorkflows: (page?: number, pageSize?: number) => Promise<void>
  createWorkflow: (name: string, description?: string) => Promise<Workflow>
  getWorkflowDetail: (id: string) => Promise<void>
  updateWorkflow: (id: string, data: Partial<Workflow>) => Promise<void>
  deleteWorkflow: (id: string) => Promise<void>
  duplicateWorkflow: (id: string) => Promise<Workflow>
  saveWorkflow: (id: string) => Promise<void>
  executeWorkflow: (id: string) => Promise<void>
  setCurrentWorkflow: (workflow: Workflow | null) => void
  resetStore: () => void
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  isLoading: false,
  total: 0,
  currentPage: 1,
  pageSize: 20,

  fetchWorkflows: async (page = 1, pageSize = 20) => {
    set({ isLoading: true })
    try {

      const response = await workflowService.getWorkflows()
      if (response.code === 0 && response.data) {
        const workflows = response.data as any[]
        set({
          workflows: workflows.map((w: any) => ({
            id: w.id,
            name: w.name,
            status: w.status || 'DRAFT',
            updatedAt: w.updatedAt || '',
          })),
          total: workflows.length,
          currentPage: page,
          pageSize,
          isLoading: false,
        })
      } else {
        throw new Error(response.message)
      }
    } catch (error: any) {
      set({ isLoading: false })
      toast.error(error.message || '获取工作流列表失败')
      throw error
    }
  },

  createWorkflow: async (name: string, description?: string) => {
    set({ isLoading: true })
    try {
      const response = await workflowService.createWorkflow({ name, description })
      if (response.code === 0 && response.data) {
        set({ isLoading: false })
        toast.success('工作流创建成功')
        return response.data
      }
      throw new Error(response.message)
    } catch (error: any) {
      set({ isLoading: false })
      toast.error(error.message || '创建工作流失败')
      throw error
    }
  },

  getWorkflowDetail: async (id: string) => {
    set({ isLoading: true })
    try {
      const response = await workflowService.getWorkflow(id)
      if (response.code === 0 && response.data) {
        set({ currentWorkflow: response.data, isLoading: false })
      } else {
        throw new Error(response.message)
      }
    } catch (error: any) {
      set({ isLoading: false })
      toast.error(error.message || '获取工作流详情失败')
      throw error
    }
  },

  updateWorkflow: async (id: string, data: Partial<Workflow>) => {
    set({ isLoading: true })
    try {
      const response = await workflowService.updateWorkflow(id, data)
      if (response.code === 0 && response.data) {
        set({ currentWorkflow: response.data, isLoading: false })
        toast.success('工作流更新成功')
      } else {
        throw new Error(response.message)
      }
    } catch (error: any) {
      set({ isLoading: false })
      toast.error(error.message || '更新工作流失败')
      throw error
    }
  },

  deleteWorkflow: async (id: string) => {
    set({ isLoading: true })
    try {
      const response = await workflowService.deleteWorkflow(id)
      if (response.code === 0) {
        set((state) => ({
          workflows: state.workflows.filter((wf) => wf.id !== id),
          isLoading: false,
        }))
        toast.success('工作流删除成功')
      } else {
        throw new Error(response.message)
      }
    } catch (error: any) {
      set({ isLoading: false })
      toast.error(error.message || '删除工作流失败')
      throw error
    }
  },

  duplicateWorkflow: async (id: string) => {
    set({ isLoading: true })
    try {
      const response = await workflowService.getWorkflow(id)
      if (response.code === 0 && response.data) {
        const workflow = response.data
        const newWorkflow = await workflowService.createWorkflow({
          name: `${workflow.name} (副本)`,
          description: workflow.description,
        })
        set({ isLoading: false })
        toast.success('工作流复制成功')
        return newWorkflow.data!
      }
      throw new Error(response.message)
    } catch (error: any) {
      set({ isLoading: false })
      toast.error(error.message || '复制工作流失败')
      throw error
    }
  },

  saveWorkflow: async (id: string) => {
    set({ isLoading: true })
    try {
      const response = await workflowService.updateWorkflow(id, {})
      if (response.code === 0) {
        set({ isLoading: false })
        toast.success('工作流保存成功')
      } else {
        throw new Error(response.message)
      }
    } catch (error: any) {
      set({ isLoading: false })
      toast.error(error.message || '保存工作流失败')
      throw error
    }
  },

  executeWorkflow: async (id: string) => {
    set({ isLoading: true })
    try {
      const response = await workflowService.executeWorkflow(id)
      if (response.code === 0) {
        set({ isLoading: false })
        toast.success('工作流执行成功')
      } else {
        throw new Error(response.message)
      }
    } catch (error: any) {
      set({ isLoading: false })
      toast.error(error.message || '执行工作流失败')
      throw error
    }
  },

  setCurrentWorkflow: (workflow: Workflow | null) => {
    set({ currentWorkflow: workflow })
  },

  resetStore: () => {
    set({
      workflows: [],
      currentWorkflow: null,
      isLoading: false,
      total: 0,
      currentPage: 1,
      pageSize: 20,
    })
  },
}))
