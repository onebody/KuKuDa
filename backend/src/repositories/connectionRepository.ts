import { prisma } from '../config/database';
import { NodeConnection } from '@prisma/client';

/**
 * 节点连接数据访问层
 * 封装所有节点连接相关的数据库操作
 */

/**
 * 创建连接
 * @param data - 连接数据
 * @returns 创建的连接
 */
export const createConnection = async (data: {
  workflowId: string;
  sourceNodeId: string;
  sourceHandle: string;
  targetNodeId: string;
  targetHandle: string;
}): Promise<NodeConnection> => {
  return await prisma.nodeConnection.create({
    data: {
      workflowId: data.workflowId,
      sourceNodeId: data.sourceNodeId,
      sourceHandle: data.sourceHandle,
      targetNodeId: data.targetNodeId,
      targetHandle: data.targetHandle,
    },
  });
};

/**
 * 根据 ID 查找连接
 * @param id - 连接 ID
 * @returns 连接对象或 null
 */
export const findConnectionById = async (id: string): Promise<NodeConnection | null> => {
  return await prisma.nodeConnection.findUnique({
    where: { id },
  });
};

/**
 * 获取工作流的所有连接
 * @param workflowId - 工作流 ID
 * @returns 连接列表
 */
export const findConnectionsByWorkflowId = async (
  workflowId: string
): Promise<NodeConnection[]> => {
  return await prisma.nodeConnection.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'asc' },
  });
};

/**
 * 删除连接
 * @param id - 连接 ID
 */
export const deleteConnection = async (id: string): Promise<void> => {
  await prisma.nodeConnection.delete({
    where: { id },
  });
};

/**
 * 批量创建连接
 * @param connections - 连接数据数组
 * @returns 创建的连接列表
 */
export const createManyConnections = async (
  connections: Array<{
    workflowId: string;
    sourceNodeId: string;
    sourceHandle: string;
    targetNodeId: string;
    targetHandle: string;
  }>
): Promise<NodeConnection[]> => {
  const createdConnections: NodeConnection[] = [];

  for (const connData of connections) {
    const conn = await prisma.nodeConnection.create({
      data: connData,
    });
    createdConnections.push(conn);
  }

  return createdConnections;
};

/**
 * 删除工作流的所有连接
 * @param workflowId - 工作流 ID
 */
export const deleteConnectionsByWorkflowId = async (workflowId: string): Promise<void> => {
  await prisma.nodeConnection.deleteMany({
    where: { workflowId },
  });
};

/**
 * 删除节点的所有相关连接（作为源或目标）
 * @param nodeId - 节点 ID
 */
export const deleteConnectionsByNodeId = async (nodeId: string): Promise<void> => {
  await prisma.nodeConnection.deleteMany({
    where: {
      OR: [
        { sourceNodeId: nodeId },
        { targetNodeId: nodeId },
      ],
    },
  });
};
