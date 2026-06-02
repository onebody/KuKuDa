import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { NodeType, NodeStatus } from '../types/workflow';
import { AppError } from '../middleware/errorHandler';

// ============ 批量操作（供 updateWorkflow 内部使用）============

export const deleteConnectionsByWorkflowId = async (workflowId: string) => {
  await prisma.nodeConnection.deleteMany({ where: { workflowId } });
};

export const deleteNodesByWorkflowId = async (workflowId: string) => {
  await prisma.node.deleteMany({ where: { workflowId } });
};

export const createManyNodes = async (nodes: any[]) => {
  const createdNodes = [];
  for (const nodeData of nodes) {
    const { id, ...rest } = nodeData;
    const node = await prisma.node.create({
      data: { ...(id ? { id } : {}), ...rest, status: NodeStatus.IDLE },
    });
    createdNodes.push(node);
  }
  return createdNodes;
};

export const createManyConnections = async (connections: any[]) => {
  const createdConnections = [];
  for (const connData of connections) {
    const conn = await prisma.nodeConnection.create({ data: connData });
    createdConnections.push(conn);
  }
  return createdConnections;
};

// ============ 工作流保存（覆盖式）============

export const updateWorkflow = async (workflowId: string, userId: string, data: any) => {
  const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!workflow) throw new AppError('工作流不存在', 40402, 404);
  if (workflow.userId !== userId) throw new AppError('无权限修改此工作流', 40301, 403);

  const result: any = {};

  if (data.nodes !== undefined) {
    await deleteConnectionsByWorkflowId(workflowId);
    await deleteNodesByWorkflowId(workflowId);
    if (data.nodes.length > 0) {
      const nodes = await createManyNodes(
        data.nodes.map((node: any) => ({
          id: node.id,
          workflowId,
          type: node.type,
          label: node.label,
          positionX: node.positionX ?? node.data?.position?.x ?? 0,
          positionY: node.positionY ?? node.data?.position?.y ?? 0,
          data: node.data ?? {},
          config: node.config ?? {},
        }))
      );
      result.nodes = nodes;
    }
  }

  if (data.connections !== undefined) {
    if (data.connections.length > 0) {
      const connections = await createManyConnections(
        data.connections.map((conn: any) => ({
          workflowId,
          sourceNodeId: conn.sourceNodeId ?? conn.source,
          sourceHandle: conn.sourceHandle ?? null,
          targetNodeId: conn.targetNodeId ?? conn.target,
          targetHandle: conn.targetHandle ?? null,
        }))
      );
      result.connections = connections;
    }
  }

  // 保存 viewport
  if (data.viewport !== undefined) {
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { viewport: JSON.stringify(data.viewport) },
    });
  }

  return result;
};

// ============ 单节点操作（供 controller 使用）============

/** 添加节点（controller 中叫 addNode） */
export const addNode = async (workflowId: string, userId: string, data: any) => {
  const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!workflow) throw new AppError('工作流不存在', 40402, 404);
  if (workflow.userId !== userId) throw new AppError('无权限修改此工作流', 40301, 403);
  return prisma.node.create({
    data: {
      workflowId,
      type: data.type,
      label: data.label,
      positionX: data.positionX ?? 0,
      positionY: data.positionY ?? 0,
      data: data.data ?? {},
      config: data.config ?? {},
      status: NodeStatus.IDLE,
    },
  });
};

/** 更新节点 */
export const updateNode = async (nodeId: string, data: any) => {
  const node = await prisma.node.findUnique({ where: { id: nodeId } });
  if (!node) throw new AppError('节点不存在', 40401, 404);
  return prisma.node.update({
    where: { id: nodeId },
    data: {
      ...(data.label !== undefined && { label: data.label }),
      ...(data.positionX !== undefined && { positionX: data.positionX }),
      ...(data.positionY !== undefined && { positionY: data.positionY }),
      ...(data.data !== undefined && { data: data.data }),
      ...(data.config !== undefined && { config: data.config }),
    },
  });
};

/** 删除节点 */
export const deleteNode = async (nodeId: string) => {
  const node = await prisma.node.findUnique({ where: { id: nodeId } });
  if (!node) throw new AppError('节点不存在', 40401, 404);
  await prisma.node.delete({ where: { id: nodeId } });
};

/** 获取工作流的所有节点（controller 中叫 getWorkflowNodes） */
export const getWorkflowNodes = async (workflowId: string, userId: string) => {
  const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!workflow) throw new AppError('工作流不存在', 40402, 404);
  return prisma.node.findMany({ where: { workflowId }, orderBy: { createdAt: 'asc' } });
};

/** 获取工作流的所有连接（controller 中叫 getWorkflowConnections） */
export const getWorkflowConnections = async (workflowId: string, userId: string) => {
  const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!workflow) throw new AppError('工作流不存在', 40402, 404);
  return prisma.nodeConnection.findMany({ where: { workflowId }, orderBy: { createdAt: 'asc' } });
};

// ============ 连接操作 ============

/** 添加连接（controller 中叫 addConnection） */
export const addConnection = async (workflowId: string, userId: string, data: any) => {
  const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!workflow) throw new AppError('工作流不存在', 40402, 404);
  if (workflow.userId !== userId) throw new AppError('无权限修改此工作流', 40301, 403);
  return prisma.nodeConnection.create({
    data: {
      workflowId,
      sourceNodeId: data.sourceNodeId,
      sourceHandle: data.sourceHandle ?? null,
      targetNodeId: data.targetNodeId,
      targetHandle: data.targetHandle ?? null,
    },
  });
};

/** 删除连接（controller 中叫 deleteConnectionService） */
export const deleteConnection = async (connectionId: string) => {
  const conn = await prisma.nodeConnection.findUnique({ where: { id: connectionId } });
  if (!conn) throw new AppError('连接不存在', 40404, 404);
  await prisma.nodeConnection.delete({ where: { id: connectionId } });
};
