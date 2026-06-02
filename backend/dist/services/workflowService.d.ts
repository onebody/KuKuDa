export declare const workflowService: {
    getWorkflows(userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        userId: string;
        isTemplate: boolean;
        isPublic: boolean;
        thumbnail: string | null;
        lastExecutedAt: Date | null;
    }[]>;
    createWorkflow(userId: string, data: {
        name: string;
        description?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        userId: string;
        isTemplate: boolean;
        isPublic: boolean;
        thumbnail: string | null;
        lastExecutedAt: Date | null;
    }>;
    getWorkflow(userId: string, workflowId: string): Promise<{
        nodes: {
            type: import(".prisma/client").$Enums.NodeType;
            status: import(".prisma/client").$Enums.NodeStatus;
            error: string | null;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            result: import("@prisma/client/runtime/library").JsonValue | null;
            workflowId: string;
            label: string;
            positionX: number;
            positionY: number;
            config: import("@prisma/client/runtime/library").JsonValue | null;
            executedAt: Date | null;
        }[];
        connections: {
            id: string;
            createdAt: Date;
            workflowId: string;
            sourceNodeId: string;
            sourceHandle: string;
            targetNodeId: string;
            targetHandle: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        userId: string;
        isTemplate: boolean;
        isPublic: boolean;
        thumbnail: string | null;
        lastExecutedAt: Date | null;
    }>;
    updateWorkflow(userId: string, workflowId: string, data: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        userId: string;
        isTemplate: boolean;
        isPublic: boolean;
        thumbnail: string | null;
        lastExecutedAt: Date | null;
    }>;
    deleteWorkflow(userId: string, workflowId: string): Promise<void>;
    executeWorkflow(userId: string, workflowId: string): Promise<{
        executionId: string;
        status: import(".prisma/client").$Enums.ExecutionStatus;
    }>;
    getExecutions(userId: string, workflowId: string): Promise<{
        status: import(".prisma/client").$Enums.ExecutionStatus;
        error: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        triggeredBy: string;
        startedAt: Date;
        completedAt: Date | null;
        nodeResults: import("@prisma/client/runtime/library").JsonValue | null;
        workflowId: string;
    }[]>;
};
//# sourceMappingURL=workflowService.d.ts.map