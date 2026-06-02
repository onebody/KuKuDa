import { prisma } from '../config/database';
import { Workflow, Node, NodeConnection } from '@prisma/client';

/**
 * 工作流数据访问层
 * 封装所有工作流相关的数据库操作
 */

/**
 * 创建工作流
 * @param data - 工作流数据
 * @returns 创建的工作流
 */
export const createWorkflow = async (data: {
  name: string;
  description?: string;
  userId: string;
  isTemplate?: boolean;
}): Promise<Workflow> => {
  return await prisma.workflow.create({
    data: {
      name: data.name,
      description: data.description,
      userId: data.userId,
      isTemplate: data.isTemplate || false,
    },
  });
};

/**
 * 根据 ID 查找工作流
 * @param id - 工作流 ID
 * @returns 工作流对象或 null
 */
export const findWorkflowById = async (id: string): Promise<Workflow | null> => {
  return await prisma.workflow.findUnique({
    where: { id },
    include: {
      nodes: true,
      connections: true,
    },
  });
};

/**
 * 获取用户的工作流列表
 * @param userId - 用户 ID
 * @param page - 页码
 * @param pageSize - 每页数量
 * @returns 工作流列表和总数
 */
export const findWorkflowsByUserId = async (
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ workflows: Workflow[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const [workflows, total] = await Promise.all([
    prisma.workflow.findMany({
      where: {
        userId,
        isTemplate: false,
      },
      skip,
      take: pageSize,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            nodes: true,
            executions: true,
          },
        },
      },
    }),
    prisma.workflow.count({
      where: {
        userId,
        isTemplate: false,
      },
    }),
  ]);

  return { workflows, total };
};

/**
 * 获取模板列表
 * @param page - 页码
 * @param pageSize - 每页数量
 * @returns 模板列表和总数
 */
export const findTemplates = async (
  page: number = 1,
  pageSize: number = 20
): Promise<{ workflows: Workflow[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const [workflows, total] = await Promise.all([
    prisma.workflow.findMany({
      where: {
        isTemplate: true,
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    }),
    prisma.workflow.count({
      where: {
        isTemplate: true,
      },
    }),
  ]);

  return { workflows, total };
};

/**
 * 更新工作流
 * @param id - 工作流 ID
 * @param data - 要更新的数据
 * @returns 更新后的工作流
 */
export const updateWorkflow = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    nodes?: any;
    connections?: any;
    isTemplate?: boolean;
    isPublic?: boolean;
    lastExecutedAt?: Date;
  }
): Promise<Workflow> => {
  return await prisma.workflow.update({
    where: { id },
    data,
  });
};

/**
 * 删除工作流
 * @param id - 工作流 ID
 */
export const deleteWorkflow = async (id: string): Promise<void> => {
  await prisma.workflow.delete({
    where: { id },
  });
};

/**
 * 复制工作流
 * @param id - 源工作流 ID
 * @param userId - 新用户 ID
 * @returns 新的工作流
 */
export const duplicateWorkflow = async (
  id: string,
  userId: string
): Promise<Workflow> => {
  const source = await prisma.workflow.findUnique({
    where: { id },
    include: {
      nodes: true,
      connections: true,
    },
  });

  if (!source) {
    throw new Error('工作流不存在');
  }

  // 创建新工作流
  const newWorkflow = await prisma.workflow.create({
    data: {
      name: `${source.name} (副本)`,
      description: source.description,
      userId,
      isTemplate: false,
      nodes: {
        create: source.nodes.map((node) => ({
          type: node.type,
          label: node.label,
          positionX: node.positionX,
          positionY: node.positionY,
          data: node.data,
          config: node.config,
        })),
      },
      connections: {
        create: source.connections.map((conn) => ({
          sourceNodeId: conn.sourceNodeId,
          sourceHandle: conn.sourceHandle,
          targetNodeId: conn.targetNodeId,
          targetHandle: conn.targetHandle,
        })),
      },
    },
    include: {
      nodes: true,
      connections: true,
    },
  });

  return newWorkflow;
};

/**
 * 获取工作流执行记录
 * @param workflowId - 工作流 ID
 * @param page - 页码
 * @param pageSize - 每页数量
 * @returns 执行记录列表和总数
 */
export const findWorkflowExecutions = async (
  workflowId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ executions: any[]; total: number }> => {
  const skip = (page - 1) * pageSize;

  const [executions, total] = await Promise.all([
    prisma.execution.findMany({
      where: { workflowId },
      skip,
      take: pageSize,
      orderBy: { startedAt: 'desc' },
    }),
    prisma.execution.count({
      where: { workflowId },
    }),
  ]);

  return { executions, total };
};
