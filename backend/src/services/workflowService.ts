import { PrismaClient } from '@prisma/client'
import { NodeType, NodeStatus, ExecutionStatus } from '@prisma/client'
import { executionService } from './executionService'

const prisma = new PrismaClient()

export const workflowService = {
  // 获取工作流列表
  async getWorkflows(userId: string) {
    return await prisma.workflow.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    })
  },

  // 创建工作流
  async createWorkflow(userId: string, data: { name: string; description?: string }) {
    return await prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        userId
      }
    })
  },

  // 获取工作流详情（包含节点和连接）
  async getWorkflow(userId: string, workflowId: string) {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        OR: [
          { userId },
          { isPublic: true }
        ]
      },
      include: {
        nodes: true,
        connections: true
      }
    })

    if (!workflow) {
      throw new Error('工作流不存在或无权限访问')
    }

    return workflow
  },

  // 更新工作流
  async updateWorkflow(userId: string, workflowId: string, data: any) {
    // 检查权限
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId }
    })

    if (!workflow) {
      throw new Error('工作流不存在或无权限修改')
    }

    return await prisma.workflow.update({
      where: { id: workflowId },
      data
    })
  },

  // 保存工作流（完整保存 nodes + connections + viewport）
  async saveWorkflow(userId: string, workflowId: string, data: {
    nodes: any[],
    connections: any[],
    viewport?: string
  }) {
    // 1. 检查权限
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId }
    })
    if (!workflow) {
      throw new Error('工作流不存在或无权限')
    }

    // 2. 删除旧的 nodes 和 connections
    await prisma.node.deleteMany({
      where: { workflowId }
    })
    await prisma.connection.deleteMany({
      where: { workflowId }
    })

    // 3. 创建新的 nodes
    for (const node of data.nodes) {
      await prisma.node.create({
        data: {
          id: node.id,
          workflowId,
          type: node.type || node.nodeType,
          label: node.label || '',
          positionX: node.positionX,
          positionY: node.positionY,
          config: node.config || {},
          data: node.data || {},
          status: 'idle',
        }
      })
    }

    // 4. 创建新的 connections
    for (const conn of data.connections) {
      await prisma.connection.create({
        data: {
          workflowId,
          sourceNodeId: conn.sourceNodeId || conn.source,
          sourceHandle: conn.sourceHandle || 'output',
          targetNodeId: conn.targetNodeId || conn.target,
          targetHandle: conn.targetHandle || 'input',
        }
      })
    }

    // 5. 更新 viewport
    if (data.viewport) {
      await prisma.workflow.update({
        where: { id: workflowId },
        data: { viewport: data.viewport }
      })
    }

    return { success: true }
  },

  // 删除工作流
  async deleteWorkflow(userId: string, workflowId: string) {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId }
    })

    if (!workflow) {
      throw new Error('工作流不存在或无权限删除')
    }

    await prisma.workflow.delete({
      where: { id: workflowId }
    })
  },

  // 执行工作流
  async executeWorkflow(userId: string, workflowId: string) {
    // 检查工作流是否存在
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId },
      include: { nodes: true, connections: true }
    })

    if (!workflow) {
      throw new Error('工作流不存在')
    }

    // 调用执行服务（异步执行）
    const execution = await executionService.executeWorkflow(workflowId, userId)

    return {
      executionId: execution.id,
      status: execution.status
    }
  },

  // 获取执行记录
  async getExecutions(userId: string, workflowId: string) {
    return await prisma.execution.findMany({
      where: {
        workflowId,
        userId
      },
      orderBy: { startedAt: 'desc' }
    })
  }
}
