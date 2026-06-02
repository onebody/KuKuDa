import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { workflowService } from '../services/workflowService'

export const workflowController = {
  // 获取工作流列表
  async getWorkflows(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const workflows = await workflowService.getWorkflows(userId)
      res.json({
        code: 0,
        data: workflows,
        message: 'success'
      })
    } catch (error: any) {
      res.status(500).json({
        code: 50001,
        data: null,
        message: error.message
      })
    }
  },

  // 创建工作流
  async createWorkflow(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const { name, description } = req.body
      const workflow = await workflowService.createWorkflow(userId, { name, description })
      res.status(201).json({
        code: 0,
        data: workflow,
        message: '创建成功'
      })
    } catch (error: any) {
      res.status(400).json({
        code: 40001,
        data: null,
        message: error.message
      })
    }
  },

  // 获取工作流详情
  async getWorkflow(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const workflowId = req.params.id
      const workflow = await workflowService.getWorkflow(userId, workflowId)
      res.json({
        code: 0,
        data: workflow,
        message: 'success'
      })
    } catch (error: any) {
      res.status(404).json({
        code: 40401,
        data: null,
        message: error.message
      })
    }
  },

  // 更新工作流
  async updateWorkflow(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const workflowId = req.params.id
      const data = req.body
      const workflow = await workflowService.updateWorkflow(userId, workflowId, data)
      res.json({
        code: 0,
        data: workflow,
        message: '更新成功'
      })
    } catch (error: any) {
      res.status(400).json({
        code: 40001,
        data: null,
        message: error.message
      })
    }
  },

  // 删除工作流
  async deleteWorkflow(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const workflowId = req.params.id
      await workflowService.deleteWorkflow(userId, workflowId)
      res.json({
        code: 0,
        data: null,
        message: '删除成功'
      })
    } catch (error: any) {
      res.status(400).json({
        code: 40001,
        data: null,
        message: error.message
      })
    }
  },

  // 执行工作流
  async executeWorkflow(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const workflowId = req.params.id
      const execution = await workflowService.executeWorkflow(userId, workflowId)
      res.json({
        code: 0,
        data: execution,
        message: '执行已启动'
      })
    } catch (error: any) {
      res.status(500).json({
        code: 50001,
        data: null,
        message: error.message
      })
    }
  },

  // 获取执行记录
  async getExecutions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId
      const workflowId = req.params.id
      const executions = await workflowService.getExecutions(userId, workflowId)
      res.json({
        code: 0,
        data: executions,
        message: 'success'
      })
    } catch (error: any) {
      res.status(500).json({
        code: 50001,
        data: null,
        message: error.message
      })
    }
  }
}
