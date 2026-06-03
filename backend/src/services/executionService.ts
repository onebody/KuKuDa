import { PrismaClient, ExecutionStatus } from '@prisma/client'
import { BaseNodeAdapter } from './ai/nodeAdapters/BaseNodeAdapter'
import { adapterRegistry } from './ai/nodeAdapters'
import { NodeInput, NodeOutput } from '../../../shared/types/node'
import { ExecutionContext, NodeExecutionResult, WorkflowExecutionResult } from '../types/node'

const prisma = new PrismaClient()

/**
 * 执行服务（重构版）
 * 使用新的节点适配器架构
 */
export const executionService = {
  /**
   * 执行工作流
   * @param workflowId 工作流ID
   * @param userId 用户ID
   * @returns 执行记录
   */
  async executeWorkflow(workflowId: string, userId: string) {
    // 获取工作流详情
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId },
      include: { nodes: true, connections: true },
    })

    if (!workflow) {
      throw new Error('工作流不存在')
    }

    // 创建执行记录
    const execution = await prisma.execution.create({
      data: {
        workflowId,
        userId,
        status: 'RUNNING',
        triggeredBy: userId,
      },
    })

      // 异步执行工作流
      executionService.runExecution(execution.id, workflow.nodes, workflow.connections, userId).catch(
        console.error
      )

    return execution
  },

  /**
   * 运行执行（核心执行引擎 - 重构版）
   * @param executionId 执行ID
   * @param nodes 节点数组
   * @param connections 连接数组
   * @param userId 用户ID
   */
  async runExecution(
    executionId: string,
    nodes: any[],
    connections: any[],
    userId: string
  ) {
    const startTime = Date.now()

    try {
      // 构建节点映射
      const nodeMap = new Map(nodes.map((node) => [node.id, node]))

      // 构建邻接表（用于拓扑排序）
      const graph = new Map<string, string[]>()
      const inDegree = new Map<string, number>()

      nodes.forEach((node) => {
        graph.set(node.id, [])
        inDegree.set(node.id, 0)
      })

      connections.forEach((conn) => {
        const targets = graph.get(conn.sourceNodeId) || []
        targets.push(conn.targetNodeId)
        graph.set(conn.sourceNodeId, targets)
        inDegree.set(
          conn.targetNodeId,
          (inDegree.get(conn.targetNodeId) || 0) + 1
        )
      })

      // 拓扑排序（BFS）
      const queue: string[] = []
      inDegree.forEach((degree, nodeId) => {
        if (degree === 0) queue.push(nodeId)
      })

      const nodeResults: Record<string, NodeOutput> = {}
      const executionContext: ExecutionContext = {
        executionId,
        userId,
        workflowId: nodes[0]?.workflowId || '',
        variables: {},
        timeout: 30000, // 默认30秒超时
      }

      while (queue.length > 0) {
        const nodeId = queue.shift()!
        const node = nodeMap.get(nodeId)!

        // 执行节点
        const result = await this.executeNode(
          node,
          nodeResults,
          executionContext
        )
        nodeResults[nodeId] = result

        // 更新节点状态
        await prisma.node.update({
          where: { id: nodeId },
          data: {
            status: result.status === 'SUCCESS' ? 'SUCCESS' : 'ERROR',
            result: result as any,
            error: result.error?.message,
            executedAt: new Date(),
          },
        })

        // 处理下游节点
        const targets = graph.get(nodeId) || []
        for (const targetId of targets) {
          inDegree.set(targetId, inDegree.get(targetId)! - 1)
          if (inDegree.get(targetId) === 0) {
            queue.push(targetId)
          }
        }
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // 更新执行记录
      await prisma.execution.update({
        where: { id: executionId },
        data: {
          status: 'SUCCESS',
          completedAt: new Date(),
          nodeResults: nodeResults as any,
        },
      })

      console.log(`[Execution] 工作流执行完成，耗时: ${duration}ms`)
    } catch (error: any) {
      const endTime = Date.now()
      const duration = endTime - startTime

      // 更新执行记录为失败
      await prisma.execution.update({
        where: { id: executionId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: error.message,
        },
      })

      console.error('[Execution] 工作流执行失败:', error)
    }
  },

  /**
   * 执行单个节点（重构版）
   * @param node 节点数据
   * @param previousResults 上游节点执行结果
   * @param context 执行上下文
   * @returns 节点执行结果
   */
  async executeNode(
    node: any,
    previousResults: Record<string, NodeOutput>,
    context: ExecutionContext
  ): Promise<NodeOutput> {
    // 获取适配器
    const adapter = this.getAdapter(node.type)
    if (!adapter) {
      return {
        status: 'ERROR',
        error: {
          code: 'ADAPTER_NOT_FOUND',
          message: `未找到节点类型 ${node.type} 的适配器`,
        },
      }
    }

    // 准备输入数据（从上游节点获取）
    const input = this.getNodeInput(node.id, previousResults, node.data?.inputs)

    // 验证配置
    const validation = adapter.validate(input, node.config || {})
    if (!validation.valid) {
      return {
        status: 'ERROR',
        error: {
          code: 'VALIDATION_FAILED',
          message: `配置验证失败: ${validation.errors.map((e: any) => e.message).join(', ')}`,
          details: validation.errors,
        },
      }
    }

    try {
      // 执行节点（带超时控制）
      const timeout = context.timeout || 30000
      const executionPromise = adapter.execute(input, node.config || {}, context)

      // 创建超时Promise
      const timeoutPromise = new Promise<NodeOutput>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`节点执行超时 (${timeout}ms)`))
        }, timeout)
      })

      // 竞态执行
      const result = (await Promise.race([
        executionPromise,
        timeoutPromise,
      ])) as NodeOutput

      return result
    } catch (error: any) {
      return {
        status: 'ERROR',
        error: {
          code: 'EXECUTION_FAILED',
          message: error.message || '节点执行失败',
          details: error.stack,
        },
      }
    }
  },

  /**
   * 获取节点适配器
   * @param nodeType 节点类型
   * @returns 适配器实例
   */
  getAdapter(nodeType: string): BaseNodeAdapter | null {
    // 从适配器注册表创建实例
    const instance = adapterRegistry.createInstance(nodeType)
    return instance
  },

  /**
   * 获取节点输入（从上游节点结果）
   * @param nodeId 当前节点ID
   * @param previousResults 所有上游节点结果
   * @param inputPorts 输入端口定义（可选）
   * @returns 节点输入
   */
  getNodeInput(
    nodeId: string,
    previousResults: Record<string, NodeOutput>,
    inputPorts?: any[]
  ): NodeInput {
    const input: NodeInput = {}

    // 简化实现：将所有上游节点的输出映射到输入
    // 实际应用中应该根据连接关系精确映射

    // 如果没有定义输入端口，返回所有上游结果的合并
    if (!inputPorts || inputPorts.length === 0) {
      // 返回第一个上游节点的输出（简化实现）
      const firstResult = Object.values(previousResults)[0]
      if (firstResult?.data) {
        input['default'] = firstResult.data
      }
      return input
    }

    // 根据输入端口定义构建输入
    for (const port of inputPorts) {
      // 这里应该根据连接关系找到对应的上游节点输出
      // 简化实现：使用第一个上游节点的输出
      const firstResult = Object.values(previousResults)[0]
      if (firstResult?.data) {
        input[port.id] = firstResult.data
      }
    }

    return input
  },

  /**
   * 变量插值解析
   * @param text 包含变量的文本
   * @param nodeResults 节点执行结果
   * @returns 解析后的文本
   */
  resolveVariables(text: string, nodeResults: Record<string, NodeOutput>): string {
    if (!text || typeof text !== 'string') {
      return text
    }

    // 匹配 {{nodeId.handleId}} 模式
    return text.replace(/\{\{(\w+)\.(\w+)\}\}/g, (match, nodeId, handleId) => {
      const nodeResult = nodeResults[nodeId]
      if (!nodeResult) {
        console.warn(`[Variable] 未找到节点 ${nodeId} 的输出`)
        return match
      }

      // 从输出中提取数据
      if (nodeResult.data) {
        if (handleId === 'text' && nodeResult.data.text) {
          return nodeResult.data.text
        }
        if (handleId === 'imageUrls' && nodeResult.data.imageUrls) {
          return nodeResult.data.imageUrls.join(',')
        }
        if (handleId in nodeResult.data) {
          return String((nodeResult.data as any)[handleId])
        }
      }

      console.warn(`[Variable] 未找到节点 ${nodeId} 的句柄 ${handleId}`)
      return match
    })
  },
}

/**
 * 向后兼容：导出类型
 */
export type { ExecutionContext, NodeExecutionResult, WorkflowExecutionResult }
