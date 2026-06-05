import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/authMiddleware'
import { executionService } from '../services/executionService'
import { adapterRegistry } from '../services/ai/nodeAdapters/index'

const router = Router()

// ============ 节点执行 API ============

// 执行单个节点
// POST /api/nodes/execute
router.post('/execute', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const { nodeId, nodeType, config, input, context } = req.body

    if (!nodeType) {
      res.status(400).json({ code: 400, message: '缺少 nodeType 参数', data: null })
      return
    }

    // 构造临时节点对象
    const node = {
      id: nodeId || `temp_${Date.now()}`,
      type: nodeType,
      data: input || {},
      config: config || {},
    }

    // 执行节点
    const result = await executionService.executeNode(
      node,
      context?.previousResults || {},
      context?.connections || [],
      {
        executionId: context?.executionId || `exec_${Date.now()}`,
        userId: (req as any).user?.userId || 'anonymous',
        workflowId: context?.workflowId || 'temp',
        variables: context?.variables || {},
      }
    )

    res.json({ code: 0, data: result, message: 'success' })
  } catch (error: any) {
    console.error('[Nodes API] 节点执行失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '节点执行失败',
      data: {
        status: 'ERROR',
        error: {
          code: 'NODE_EXECUTION_FAILED',
          message: error.message || '节点执行失败',
        }
      }
    })
  }
})

// 验证节点配置
// POST /api/nodes/validate
router.post('/validate', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const { nodeType, config } = req.body

    if (!nodeType) {
      res.status(400).json({ code: 400, message: '缺少 nodeType 参数', data: null })
      return
    }

    const adapter = adapterRegistry.get(nodeType)
    if (!adapter) {
      res.status(400).json({
        code: 400,
        message: `未找到节点类型 ${nodeType} 的适配器`,
        data: { valid: false, errors: [{ field: 'nodeType', code: 'ADAPTER_NOT_FOUND', message: `未找到节点类型 ${nodeType}` }] }
      })
      return
    }

    const validation = adapter.validate(config || {}, config || {})
    res.json({ code: 0, data: validation, message: 'success' })
  } catch (error: any) {
    console.error('[Nodes API] 配置验证失败:', error)
    res.status(500).json({ code: 500, message: error.message || '配置验证失败', data: null })
  }
})

// 获取节点类型定义
// GET /api/nodes/types/:nodeType
router.get('/types/:nodeType', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const { nodeType } = req.params

    const adapter = adapterRegistry.get(nodeType)
    if (!adapter) {
      res.status(404).json({ code: 404, message: `未找到节点类型 ${nodeType}`, data: null })
      return
    }

    const definition = {
      type: nodeType,
      name: adapter.constructor.name.replace('Adapter', ''),
      configSchema: adapter.configSchema,
      inputPorts: adapter.inputPorts,
      outputPorts: adapter.outputPorts,
      description: `${nodeType} 节点适配器`,
    }

    res.json({ code: 0, data: definition, message: 'success' })
  } catch (error: any) {
    console.error('[Nodes API] 获取节点类型定义失败:', error)
    res.status(500).json({ code: 500, message: error.message || '获取节点类型定义失败', data: null })
  }
})

// 获取所有已注册的节点类型
// GET /api/nodes/types
router.get('/types', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const types = adapterRegistry.getRegisteredTypes()
    res.json({ code: 0, data: types, message: 'success' })
  } catch (error: any) {
    console.error('[Nodes API] 获取节点类型列表失败:', error)
    res.status(500).json({ code: 500, message: error.message || '获取节点类型列表失败', data: [] })
  }
})

// 批量执行节点
// POST /api/nodes/execute-batch
router.post('/execute-batch', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const { nodes } = req.body

    if (!Array.isArray(nodes) || nodes.length === 0) {
      res.status(400).json({ code: 400, message: 'nodes 必须是非空数组', data: null })
      return
    }

    const results = await Promise.all(
      nodes.map(async (nodeReq: any) => {
        try {
          const node = {
            id: nodeReq.nodeId || `temp_${Date.now()}`,
            type: nodeReq.nodeType,
            data: nodeReq.input || {},
            config: nodeReq.config || {},
          }

          return await executionService.executeNode(
            node,
            nodeReq.context?.previousResults || {},
            nodeReq.context?.connections || [],
            {
              executionId: nodeReq.context?.executionId || `exec_${Date.now()}`,
              userId: (req as any).user?.userId || 'anonymous',
              workflowId: nodeReq.context?.workflowId || 'temp',
              variables: nodeReq.context?.variables || {},
            }
          )
        } catch (error: any) {
          return {
            status: 'ERROR' as const,
            error: {
              code: 'BATCH_NODE_FAILED',
              message: error.message || '节点执行失败',
            }
          }
        }
      })
    )

    res.json({ code: 0, data: results, message: 'success' })
  } catch (error: any) {
    console.error('[Nodes API] 批量执行失败:', error)
    res.status(500).json({ code: 500, message: error.message || '批量执行失败', data: null })
  }
})

export default router
