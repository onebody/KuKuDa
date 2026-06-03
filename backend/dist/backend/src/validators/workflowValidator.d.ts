import { z } from 'zod';
/**
 * 创建工作流验证 Schema
 */
export declare const createWorkflowSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        isTemplate: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    }, {
        name: string;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    };
}, {
    body: {
        name: string;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    };
}>;
/**
 * 更新工作流验证 Schema
 */
export declare const updateWorkflowSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        nodes: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        connections: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        isTemplate: z.ZodOptional<z.ZodBoolean>;
        isPublic: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
        isPublic?: boolean | undefined;
        nodes?: any[] | undefined;
        connections?: any[] | undefined;
    }, {
        name?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
        isPublic?: boolean | undefined;
        nodes?: any[] | undefined;
        connections?: any[] | undefined;
    }>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        name?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
        isPublic?: boolean | undefined;
        nodes?: any[] | undefined;
        connections?: any[] | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        name?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
        isPublic?: boolean | undefined;
        nodes?: any[] | undefined;
        connections?: any[] | undefined;
    };
}>;
/**
 * 添加节点验证 Schema
 */
export declare const createNodeSchema: z.ZodObject<{
    body: z.ZodObject<{
        type: z.ZodEnum<["TEXT_INPUT", "TEXT_OUTPUT", "LLM_CALL", "IMAGE_GENERATION", "AI_IMAGE", "IMAGE_INPUT", "FILE_INPUT", "CODE", "CONDITION", "LOOP"]>;
        label: z.ZodString;
        positionX: z.ZodNumber;
        positionY: z.ZodNumber;
        data: z.ZodOptional<z.ZodAny>;
        config: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        type: "TEXT_INPUT" | "TEXT_OUTPUT" | "LLM_CALL" | "IMAGE_GENERATION" | "AI_IMAGE" | "IMAGE_INPUT" | "FILE_INPUT" | "CODE" | "CONDITION" | "LOOP";
        label: string;
        positionX: number;
        positionY: number;
        data?: any;
        config?: any;
    }, {
        type: "TEXT_INPUT" | "TEXT_OUTPUT" | "LLM_CALL" | "IMAGE_GENERATION" | "AI_IMAGE" | "IMAGE_INPUT" | "FILE_INPUT" | "CODE" | "CONDITION" | "LOOP";
        label: string;
        positionX: number;
        positionY: number;
        data?: any;
        config?: any;
    }>;
    params: z.ZodObject<{
        workflowId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        workflowId: string;
    }, {
        workflowId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        workflowId: string;
    };
    body: {
        type: "TEXT_INPUT" | "TEXT_OUTPUT" | "LLM_CALL" | "IMAGE_GENERATION" | "AI_IMAGE" | "IMAGE_INPUT" | "FILE_INPUT" | "CODE" | "CONDITION" | "LOOP";
        label: string;
        positionX: number;
        positionY: number;
        data?: any;
        config?: any;
    };
}, {
    params: {
        workflowId: string;
    };
    body: {
        type: "TEXT_INPUT" | "TEXT_OUTPUT" | "LLM_CALL" | "IMAGE_GENERATION" | "AI_IMAGE" | "IMAGE_INPUT" | "FILE_INPUT" | "CODE" | "CONDITION" | "LOOP";
        label: string;
        positionX: number;
        positionY: number;
        data?: any;
        config?: any;
    };
}>;
/**
 * 更新节点验证 Schema
 */
export declare const updateNodeSchema: z.ZodObject<{
    body: z.ZodObject<{
        label: z.ZodOptional<z.ZodString>;
        positionX: z.ZodOptional<z.ZodNumber>;
        positionY: z.ZodOptional<z.ZodNumber>;
        data: z.ZodOptional<z.ZodAny>;
        config: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        data?: any;
        label?: string | undefined;
        positionX?: number | undefined;
        positionY?: number | undefined;
        config?: any;
    }, {
        data?: any;
        label?: string | undefined;
        positionX?: number | undefined;
        positionY?: number | undefined;
        config?: any;
    }>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        data?: any;
        label?: string | undefined;
        positionX?: number | undefined;
        positionY?: number | undefined;
        config?: any;
    };
}, {
    params: {
        id: string;
    };
    body: {
        data?: any;
        label?: string | undefined;
        positionX?: number | undefined;
        positionY?: number | undefined;
        config?: any;
    };
}>;
/**
 * 创建连接验证 Schema
 */
export declare const createConnectionSchema: z.ZodObject<{
    body: z.ZodObject<{
        sourceNodeId: z.ZodString;
        sourceHandle: z.ZodString;
        targetNodeId: z.ZodString;
        targetHandle: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sourceNodeId: string;
        sourceHandle: string;
        targetNodeId: string;
        targetHandle: string;
    }, {
        sourceNodeId: string;
        sourceHandle: string;
        targetNodeId: string;
        targetHandle: string;
    }>;
    params: z.ZodObject<{
        workflowId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        workflowId: string;
    }, {
        workflowId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        workflowId: string;
    };
    body: {
        sourceNodeId: string;
        sourceHandle: string;
        targetNodeId: string;
        targetHandle: string;
    };
}, {
    params: {
        workflowId: string;
    };
    body: {
        sourceNodeId: string;
        sourceHandle: string;
        targetNodeId: string;
        targetHandle: string;
    };
}>;
/**
 * 工作流 ID 参数验证 Schema
 */
export declare const workflowIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
/**
 * 节点 ID 参数验证 Schema
 */
export declare const nodeIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
/**
 * 连接 ID 参数验证 Schema
 */
export declare const connectionIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>['body'];
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>['body'];
export type CreateNodeInput = z.infer<typeof createNodeSchema>['body'];
export type UpdateNodeInput = z.infer<typeof updateNodeSchema>['body'];
export type CreateConnectionInput = z.infer<typeof createConnectionSchema>['body'];
//# sourceMappingURL=workflowValidator.d.ts.map