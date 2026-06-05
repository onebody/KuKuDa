import { Request, Response } from 'express';
import {
  createNodeSchema,
  updateNodeSchema,
  createConnectionSchema,
  nodeIdSchema,
  connectionIdSchema,
} from '../validators/workflowValidator';
import {
  addNode,
  updateNode,
  deleteNode,
  addConnection,
  deleteConnection,
  getWorkflowNodes,
  getWorkflowConnections,
  updateWorkflow,
} from '../services/nodeService';
import { validateRequest } from '../middleware/validator';
import { authenticateToken } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

/**
 * 节点控制器
 * 处理节点和连接相关的 HTTP 请求
 */

/**
 * 添加节点到工作流
 * POST /api/workflows/:workflowId/nodes
 */
export const addNodeController = [
  authenticateToken as any,
  validateRequest(createNodeSchema) as any,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const workflowId = req.params.workflowId;
      const userId = req.user!.userId;
      const { type, label, positionX, positionY, data, config } = req.body;

      const result = await addNode(workflowId, userId, {
        type,
        label,
        positionX,
        positionY,
        data,
        config,
      });

      logger.info('节点添加成功:', { nodeId: result.id, workflowId });

      res.status(201).json({
        code: 0,
        data: result,
        message: '节点添加成功',
      });
    } catch (error: any) {
      logger.error('节点添加失败:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          code: error.code,
          data: null,
          message: error.message,
        });
      } else {
        res.status(500).json({
          code: 50001,
          data: null,
          message: '服务器内部错误',
        });
      }
    }
  },
];

/**
 * 获取工作流的所有节点
 * GET /api/workflows/:workflowId/nodes
 */
export const getWorkflowNodesController = [
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const workflowId = req.params.workflowId;
      const userId = req.user!.userId;

      const result = await getWorkflowNodes(workflowId, userId);

      res.status(200).json({
        code: 0,
        data: result,
        message: 'success',
      });
    } catch (error: any) {
      logger.error('获取节点列表失败:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          code: error.code,
          data: null,
          message: error.message,
        });
      } else {
        res.status(500).json({
          code: 50001,
          data: null,
          message: '服务器内部错误',
        });
      }
    }
  },
];

/**
 * 更新节点
 * PUT /api/nodes/:id
 */
export const updateNodeController = [
  authenticateToken,
  validateRequest(updateNodeSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const nodeId = req.params.id;
      const userId = req.user!.userId;
      const { label, positionX, positionY, data, config } = req.body;

      const result = await updateNode(nodeId, {
        label,
        positionX,
        positionY,
        data,
        config,
      });

      logger.info('节点更新成功:', { nodeId, userId });

      res.status(200).json({
        code: 0,
        data: result,
        message: '节点更新成功',
      });
    } catch (error: any) {
      logger.error('节点更新失败:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          code: error.code,
          data: null,
          message: error.message,
        });
      } else {
        res.status(500).json({
          code: 50001,
          data: null,
          message: '服务器内部错误',
        });
      }
    }
  },
];

/**
 * 删除节点
 * DELETE /api/nodes/:id
 */
export const deleteNodeController = [
  authenticateToken,
  validateRequest(nodeIdSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const nodeId = req.params.id;
      const userId = req.user!.userId;

      await deleteNode(nodeId);

      logger.info('节点删除成功:', { nodeId, userId });

      res.status(200).json({
        code: 0,
        data: null,
        message: '节点删除成功',
      });
    } catch (error: any) {
      logger.error('节点删除失败:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          code: error.code,
          data: null,
          message: error.message,
        });
      } else {
        res.status(500).json({
          code: 50001,
          data: null,
          message: '服务器内部错误',
        });
      }
    }
  },
];

/**
 * 添加连接到工作流
 * POST /api/workflows/:workflowId/connections
 */
export const addConnectionController = [
  authenticateToken,
  validateRequest(createConnectionSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const workflowId = req.params.workflowId;
      const userId = req.user!.userId;
      const {
        sourceNodeId,
        sourceHandle,
        targetNodeId,
        targetHandle,
      } = req.body;

      const result = await addConnection(workflowId, userId, {
        sourceNodeId,
        sourceHandle,
        targetNodeId,
        targetHandle,
      });

      logger.info('连接添加成功:', { connectionId: result.id, workflowId });

      res.status(201).json({
        code: 0,
        data: result,
        message: '连接添加成功',
      });
    } catch (error: any) {
      logger.error('连接添加失败:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          code: error.code,
          data: null,
          message: error.message,
        });
      } else {
        res.status(500).json({
          code: 50001,
          data: null,
          message: '服务器内部错误',
        });
      }
    }
  },
];

/**
 * 获取工作流的所有连接
 * GET /api/workflows/:workflowId/connections
 */
export const getWorkflowConnectionsController = [
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const workflowId = req.params.workflowId;
      const userId = req.user!.userId;

      const result = await getWorkflowConnections(workflowId, userId);

      res.status(200).json({
        code: 0,
        data: result,
        message: 'success',
      });
    } catch (error: any) {
      logger.error('获取连接列表失败:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          code: error.code,
          data: null,
          message: error.message,
        });
      } else {
        res.status(500).json({
          code: 50001,
          data: null,
          message: '服务器内部错误',
        });
      }
    }
  },
];

/**
 * 删除连接
 * DELETE /api/connections/:id
 */
export const deleteConnectionController = [
  authenticateToken,
  validateRequest(connectionIdSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const connectionId = req.params.id;
      const userId = req.user!.userId;

      await deleteConnection(connectionId);

      logger.info('连接删除成功:', { connectionId, userId });

      res.status(200).json({
        code: 0,
        data: null,
        message: '连接删除成功',
      });
    } catch (error: any) {
      logger.error('连接删除失败:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          code: error.code,
          data: null,
          message: error.message,
        });
      } else {
        res.status(500).json({
          code: 50001,
          data: null,
          message: '服务器内部错误',
        });
      }
    }
  },
];

/**
 * 更新整个工作流（包含节点和连接）
 * PUT /api/workflows/:workflowId/save
 */
export const updateWorkflowController = [
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const workflowId = req.params.workflowId;
      const userId = req.user!.userId;
      const { nodes, connections } = req.body;

      const result = await updateWorkflow(workflowId, userId, {
        nodes,
        connections,
      });

      logger.info('工作流保存成功', { workflowId });

      res.json({
        code: 0,
        data: result,
        message: '保存成功',
      });
    } catch (error: any) {
      logger.error('保存工作流失败:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          code: error.code,
          data: null,
          message: error.message,
        });
      } else {
        res.status(500).json({
          code: 50001,
          data: null,
          message: '服务器内部错误',
        });
      }
    }
  },
];
