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

        // 执行节点（传入 connections 用于获取上游输入）
        const result = await this.executeNode(
          node,
          nodeResults,
          connections,
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
   * @param connections 连接数组（用于获取上游输入）
   * @param context 执行上下文
   * @returns 节点执行结果
   */
  async executeNode(
    node: any,
    previousResults: Record<string, NodeOutput>,
    connections: any[],
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
    const input = this.getNodeInput(
      node.id,
      connections,
      previousResults,
      node.data?.inputs
    )

    // 合并节点数据和配置：data 中包含用户输入的内容（如 text、imageUrl 等）
    // config 中包含节点参数配置（如 model、temperature 等）
    const mergedConfig = {
      ...(node.data || {}),
      ...(node.config || {}),
    }

    // 验证配置
    const validation = adapter.validate(input, mergedConfig)
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
      const executionPromise = adapter.execute(input, mergedConfig, context)

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
   * 根据连接关系精确映射上游输出到当前节点的输入句柄
   * @param nodeId 当前节点ID
   * @param connections 连接数组
   * @param previousResults 所有上游节点结果
   * @param inputPorts 输入端口定义（可选）
   * @returns 节点输入
   */
  getNodeInput(
    nodeId: string,
    connections: any[],
    previousResults: Record<string, NodeOutput>,
    inputPorts?: any[]
  ): NodeInput {
    const input: NodeInput = {}

    // 获取所有入边（连接到当前节点的边）
    const incomingConnections = connections.filter(
      (conn: any) => conn.targetNodeId === nodeId
    )

    if (incomingConnections.length === 0) {
      // 没有上游节点，返回空输入
      return input
    }

    // 根据连接关系精确映射（支持多上游叠加）
    for (const conn of incomingConnections) {
      const sourceNodeId = conn.sourceNodeId
      const targetHandle = conn.targetHandle || 'default'
      const sourceResult = previousResults[sourceNodeId]

      if (sourceResult && sourceResult.data !== undefined) {
        // 叠加逻辑：如果已有值，根据类型合并
        if (input[targetHandle] !== undefined) {
          input[targetHandle] = this.mergeValues(input[targetHandle], sourceResult.data)
        } else {
          // 第一个上游节点：直接赋值
          input[targetHandle] = sourceResult.data
        }
      }
    }

    return input
  },

  /**
   * 叠加两个值（用于合并多个上游节点的输出）
   * 规则：
   * 1. 字符串 + 字符串 → 用"，"拼接
   * 2. 对象 + 对象 → 合并（后者覆盖前者同名属性）
   * 3. 数组 + 数组 → 拼接
   * 4. 其他情况 → 转换为字符串后拼接
   */
  mergeValues(existing: any, newVal: any): any {
    // 都是字符串：用 "，" 拼接
    if (typeof existing === 'string' && typeof newVal === 'string') {
      return `${existing}，${newVal}`
    }

    // 都是对象（非数组）：合并
    if (typeof existing === 'object' && existing !== null &&
        typeof newVal === 'object' && newVal !== null &&
        !Array.isArray(existing) && !Array.isArray(newVal)) {
      return { ...existing, ...newVal }
    }

    // 都是数组：拼接
    if (Array.isArray(existing) && Array.isArray(newVal)) {
      return [...existing, ...newVal]
    }

    // 其他情况：转换为字符串后拼接
    return `${String(existing)}，${String(newVal)}`
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
