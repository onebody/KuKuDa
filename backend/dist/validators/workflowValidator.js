"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionIdSchema = exports.nodeIdSchema = exports.workflowIdSchema = exports.createConnectionSchema = exports.updateNodeSchema = exports.createNodeSchema = exports.updateWorkflowSchema = exports.createWorkflowSchema = void 0;
const zod_1 = require("zod");
/**
 * 创建工作流验证 Schema
 */
exports.createWorkflowSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, '工作流名称不能为空')
            .max(100, '工作流名称不能超过 100 个字符'),
        description: zod_1.z.string().max(500, '描述不能超过 500 个字符').optional(),
        isTemplate: zod_1.z.boolean().optional(),
    }),
});
/**
 * 更新工作流验证 Schema
 */
exports.updateWorkflowSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, '工作流名称不能为空')
            .max(100, '工作流名称不能超过 100 个字符')
            .optional(),
        description: zod_1.z.string().max(500, '描述不能超过 500 个字符').optional(),
        nodes: zod_1.z.array(zod_1.z.any()).optional(),
        connections: zod_1.z.array(zod_1.z.any()).optional(),
        isTemplate: zod_1.z.boolean().optional(),
        isPublic: zod_1.z.boolean().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('无效的工作流 ID'),
    }),
});
/**
 * 添加节点验证 Schema
 */
exports.createNodeSchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum([
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
        label: zod_1.z.string().min(1, '节点标签不能为空'),
        positionX: zod_1.z.number(),
        positionY: zod_1.z.number(),
        data: zod_1.z.any().optional(),
        config: zod_1.z.any().optional(),
    }),
    params: zod_1.z.object({
        workflowId: zod_1.z.string().uuid('无效的工作流 ID'),
    }),
});
/**
 * 更新节点验证 Schema
 */
exports.updateNodeSchema = zod_1.z.object({
    body: zod_1.z.object({
        label: zod_1.z.string().min(1, '节点标签不能为空').optional(),
        positionX: zod_1.z.number().optional(),
        positionY: zod_1.z.number().optional(),
        data: zod_1.z.any().optional(),
        config: zod_1.z.any().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('无效的节点 ID'),
    }),
});
/**
 * 创建连接验证 Schema
 */
exports.createConnectionSchema = zod_1.z.object({
    body: zod_1.z.object({
        sourceNodeId: zod_1.z.string().uuid('无效的源节点 ID'),
        sourceHandle: zod_1.z.string().min(1, '源句柄不能为空'),
        targetNodeId: zod_1.z.string().uuid('无效的目标节点 ID'),
        targetHandle: zod_1.z.string().min(1, '目标句柄不能为空'),
    }),
    params: zod_1.z.object({
        workflowId: zod_1.z.string().uuid('无效的工作流 ID'),
    }),
});
/**
 * 工作流 ID 参数验证 Schema
 */
exports.workflowIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('无效的工作流 ID'),
    }),
});
/**
 * 节点 ID 参数验证 Schema
 */
exports.nodeIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('无效的节点 ID'),
    }),
});
/**
 * 连接 ID 参数验证 Schema
 */
exports.connectionIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('无效的连接 ID'),
    }),
});
//# sourceMappingURL=workflowValidator.js.map