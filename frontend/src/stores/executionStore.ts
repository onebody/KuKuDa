import { create } from 'zustand'
import { Execution, ExecutionStatus } from '../types'
import { executionService } from '../services/executionService'

interface ExecutionStore {
  executions: Execution[]
  currentExecution: Execution | null
  isLoading: boolean
  isExecuting: boolean

  executeWorkflow: (workflowId: string, nodeIds?: string[]) => Promise<void>
  fetchExecutions: (workflowId: string) => Promise<void>
  getExecution: (id: string) => Promise<Execution | null>
  cancelExecution: (id: string) => Promise<void>
}

export const useExecutionStore = create<ExecutionStore>()(
  (set, get) => ({
    executions: [],
    currentExecution: null,
    isLoading: false,
    isExecuting: false,

    executeWorkflow: async (workflowId: string, nodeIds?: string[]) => {
      set({ isLoading: true })
      try {
        const response = await executionService.execute(workflowId, nodeIds)
        if (response.code === 0 && response.data) {
          set({ currentExecution: response.data, isLoading: false })
        } else {
          throw new Error(response.message)
        }
      } catch (error) {
        set({ isLoading: false })
        throw error
      }
    },

    fetchExecutions: async (workflowId: string) => {
      set({ isLoading: true })
      try {
        const response = await executionService.getByWorkflow(workflowId)
        if (response.code === 0 && response.data) {
          set({ executions: response.data, isLoading: false })
        } else {
          throw new Error(response.message)
        }
      } catch (error) {
        set({ isLoading: false })
        throw error
      }
    },

    getExecution: async (id: string) => {
      try {
        const response = await executionService.getById(id)
        if (response.code === 0 && response.data) {
          return response.data
        }
        return null
      } catch (error) {
        console.error('Failed to get execution:', error)
        return null
      }
    },

    cancelExecution: async (id: string) => {
      try {
        await executionService.cancel(id)
        set((state) => ({
          executions: state.executions.map(e => e.id === id ? { ...e, status: 'cancelled' as ExecutionStatus } : e)
        }))
      } catch (error) {
        console.error('Failed to cancel execution:', error)
      }
    }
  })
)
