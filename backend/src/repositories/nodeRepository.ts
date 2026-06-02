import { prisma } from '../config/database';
import { Node, NodeStatus, NodeType } from '@prisma/client';

/**
 * 节点数据访问层
 * 封装所有节点相关的数据库操作
 */

/**
 * 创建节点
 * @param data - 节点数据
 * @returns 创建的节点
 */
export const createNode = async (data: {
  workflowId: string;
  type: NodeType;
  label: string;
  positionX: number;
  positionY: number;
  data?: any;
  config?: any;
}): Promise<Node> => {
  return await prisma.node.create({
    data: {
      workflowId: data.workflowId,
      type: data.type,
      label: data.label,
      positionX: data.positionX,
      positionY: data.positionY,
      data: data.data,
      config: data.config,
      status: NodeStatus.IDLE,
    },
  });
};

/**
 * 根据 ID 查找节点
 * @param id - 节点 ID
 * @returns 节点对象或 null
 */
export const findNodeById = async (id: string): Promise<Node | null> => {
  return await prisma.node.findUnique({
    where: { id },
  });
};

/**
 * 获取工作流的所有节点
 * @param workflowId - 工作流 ID
 * @returns 节点列表
 */
export const findNodesByWorkflowId = async (workflowId: string): Promise<Node[]> => {
  return await prisma.node.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'asc' },
  });
};

/**
 * 更新节点
 * @param id - 节点 ID
 * @param data - 要更新的数据
 * @returns 更新后的节点
 */
export const updateNode = async (
  id: string,
  data: {
    label?: string;
    positionX?: number;
    positionY?: number;
    data?: any;
    config?: any;
    status?: NodeStatus;
    result?: any;
    error?: string;
  }
): Promise<Node> => {
  return await prisma.node.update({
    where: { id },
    data,
  });
};

/**
 * 删除节点
 * @param id - 节点 ID
 */
export const deleteNode = async (id: string): Promise<void> => {
  await prisma.node.delete({
    where: { id },
  });
};

/**
 * 批量创建节点
 * @param nodes - 节点数据数组
 * @returns 创建的节点列表
 */
export const createManyNodes = async (
  nodes: Array<{
    id?: string;
    workflowId: string;
    type: NodeType;
    label: string;
    positionX: number;
    positionY: number;
    data?: any;
    config?: any;
  }>
): Promise<Node[]> => {
  const createdNodes: Node[] = [];

  for (const nodeData of nodes) {
    const { id, ...rest } = nodeData;
    const node = await prisma.node.create({
      data: {
        ...(id ? { id } : {}),
        ...rest,
        status: NodeStatus.IDLE,
      },
    });
    createdNodes.push(node);
  }

  return createdNodes;
};

/**
 * 批量更新节点状态
 * @param nodeIds - 节点 ID 数组
 * @param status - 新状态
 */
export const updateNodesStatus = async (
  nodeIds: string[],
  status: NodeStatus
): Promise<void> => {
  await prisma.node.updateMany({
    where: {
      id: { in: nodeIds },
    },
    data: { status },
  });
};

/**
 * 更新节点执行结果
 * @param id - 节点 ID
 * @param result - 执行结果
 * @param status - 节点状态
 * @param error - 错误信息
 */
export const updateNodeResult = async (
  id: string,
  result: any,
  status: NodeStatus,
  error?: string
): Promise<Node> => {
  return await prisma.node.update({
    where: { id },
    data: {
      result,
      status,
      error,
      executedAt: new Date(),
    },
  });
};

/**
 * 删除工作流的所有节点
 * @param workflowId - 工作流 ID
 */
export const deleteNodesByWorkflowId = async (workflowId: string): Promise<void> => {
  await prisma.node.deleteMany({
    where: { workflowId },
  });
};
