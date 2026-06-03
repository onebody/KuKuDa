import { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
/**
 * 节点控制器
 * 处理节点和连接相关的 HTTP 请求
 */
/**
 * 添加节点到工作流
 * POST /api/workflows/:workflowId/nodes
 */
export declare const addNodeController: (typeof authMiddleware | ((req: Request, res: Response, next: import("express").NextFunction) => Promise<void>))[];
/**
 * 获取工作流的所有节点
 * GET /api/workflows/:workflowId/nodes
 */
export declare const getWorkflowNodesController: (typeof authMiddleware | ((req: Request, res: Response) => Promise<void>))[];
/**
 * 更新节点
 * PUT /api/nodes/:id
 */
export declare const updateNodeController: (typeof authMiddleware | ((req: Request, res: Response, next: import("express").NextFunction) => Promise<void>))[];
/**
 * 删除节点
 * DELETE /api/nodes/:id
 */
export declare const deleteNodeController: (typeof authMiddleware | ((req: Request, res: Response, next: import("express").NextFunction) => Promise<void>))[];
/**
 * 添加连接到工作流
 * POST /api/workflows/:workflowId/connections
 */
export declare const addConnectionController: (typeof authMiddleware | ((req: Request, res: Response, next: import("express").NextFunction) => Promise<void>))[];
/**
 * 获取工作流的所有连接
 * GET /api/workflows/:workflowId/connections
 */
export declare const getWorkflowConnectionsController: (typeof authMiddleware | ((req: Request, res: Response) => Promise<void>))[];
/**
 * 删除连接
 * DELETE /api/connections/:id
 */
export declare const deleteConnectionController: (typeof authMiddleware | ((req: Request, res: Response, next: import("express").NextFunction) => Promise<void>))[];
/**
 * 更新整个工作流（包含节点和连接）
 * PUT /api/workflows/:workflowId/save
 */
export declare const updateWorkflowController: (typeof authMiddleware | ((req: Request, res: Response) => Promise<void>))[];
//# sourceMappingURL=nodeController.d.ts.map