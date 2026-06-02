import { z } from 'zod';

/**
 * 创建工作流验证 Schema
 */
export const createWorkflowSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, '工作流名称不能为空')
      .max(100, '工作流名称不能超过 100 个字符'),
    description: z.string().max(500, '描述不能超过 500 个字符').optional(),
    isTemplate: z.boolean().optional(),
  }),
});

/**
 * 更新工作流验证 Schema
 */
export const updateWorkflowSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, '工作流名称不能为空')
      .max(100, '工作流名称不能超过 100 个字符')
      .optional(),
    description: z.string().max(500, '描述不能超过 500 个字符').optional(),
    nodes: z.array(z.any()).optional(),
    connections: z.array(z.any()).optional(),
    isTemplate: z.boolean().optional(),
    isPublic: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid('无效的工作流 ID'),
  }),
});

/**
 * 添加节点验证 Schema
 */
export const createNodeSchema = z.object({
  body: z.object({
    type: z.enum([
      'TEXT_INPUT',
      'TEXT_OUTPUT',
      'LLM_CALL',
      'IMAGE_GENERATION',
      'AI_IMAGE',
      'IMAGE_INPUT',
      'FILE_INPUT',
      'CODE',
      'CONDITION',
      'LOOP',
    ]),
    label: z.string().min(1, '节点标签不能为空'),
    positionX: z.number(),
    positionY: z.number(),
    data: z.any().optional(),
    config: z.any().optional(),
  }),
  params: z.object({
    workflowId: z.string().uuid('无效的工作流 ID'),
  }),
});

/**
 * 更新节点验证 Schema
 */
export const updateNodeSchema = z.object({
  body: z.object({
    label: z.string().min(1, '节点标签不能为空').optional(),
    positionX: z.number().optional(),
    positionY: z.number().optional(),
    data: z.any().optional(),
    config: z.any().optional(),
  }),
  params: z.object({
    id: z.string().uuid('无效的节点 ID'),
  }),
});

/**
 * 创建连接验证 Schema
 */
export const createConnectionSchema = z.object({
  body: z.object({
    sourceNodeId: z.string().uuid('无效的源节点 ID'),
    sourceHandle: z.string().min(1, '源句柄不能为空'),
    targetNodeId: z.string().uuid('无效的目标节点 ID'),
    targetHandle: z.string().min(1, '目标句柄不能为空'),
  }),
  params: z.object({
    workflowId: z.string().uuid('无效的工作流 ID'),
  }),
});

/**
 * 工作流 ID 参数验证 Schema
 */
export const workflowIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('无效的工作流 ID'),
  }),
});

/**
 * 节点 ID 参数验证 Schema
 */
export const nodeIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('无效的节点 ID'),
  }),
});

/**
 * 连接 ID 参数验证 Schema
 */
export const connectionIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('无效的连接 ID'),
  }),
});

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>['body'];
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>['body'];
export type CreateNodeInput = z.infer<typeof createNodeSchema>['body'];
export type UpdateNodeInput = z.infer<typeof updateNodeSchema>['body'];
export type CreateConnectionInput = z.infer<typeof createConnectionSchema>['body'];
