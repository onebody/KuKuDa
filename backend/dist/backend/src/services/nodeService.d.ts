export declare const deleteConnectionsByWorkflowId: (workflowId: string) => Promise<void>;
export declare const deleteNodesByWorkflowId: (workflowId: string) => Promise<void>;
export declare const createManyNodes: (nodes: any[]) => Promise<{
    error: string | null;
    type: import(".prisma/client").$Enums.NodeType;
    status: import(".prisma/client").$Enums.NodeStatus;
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
}[]>;
export declare const createManyConnections: (connections: any[]) => Promise<{
    id: string;
    createdAt: Date;
    workflowId: string;
    sourceNodeId: string;
    sourceHandle: string;
    targetNodeId: string;
    targetHandle: string;
}[]>;
export declare const updateWorkflow: (workflowId: string, userId: string, data: any) => Promise<any>;
/** 添加节点（controller 中叫 addNode） */
export declare const addNode: (workflowId: string, userId: string, data: any) => Promise<{
    error: string | null;
    type: import(".prisma/client").$Enums.NodeType;
    status: import(".prisma/client").$Enums.NodeStatus;
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
}>;
/** 更新节点 */
export declare const updateNode: (nodeId: string, data: any) => Promise<{
    error: string | null;
    type: import(".prisma/client").$Enums.NodeType;
    status: import(".prisma/client").$Enums.NodeStatus;
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
}>;
/** 删除节点 */
export declare const deleteNode: (nodeId: string) => Promise<void>;
/** 获取工作流的所有节点（controller 中叫 getWorkflowNodes） */
export declare const getWorkflowNodes: (workflowId: string, userId: string) => Promise<{
    error: string | null;
    type: import(".prisma/client").$Enums.NodeType;
    status: import(".prisma/client").$Enums.NodeStatus;
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
}[]>;
/** 获取工作流的所有连接（controller 中叫 getWorkflowConnections） */
export declare const getWorkflowConnections: (workflowId: string, userId: string) => Promise<{
    id: string;
    createdAt: Date;
    workflowId: string;
    sourceNodeId: string;
    sourceHandle: string;
    targetNodeId: string;
    targetHandle: string;
}[]>;
/** 添加连接（controller 中叫 addConnection） */
export declare const addConnection: (workflowId: string, userId: string, data: any) => Promise<{
    id: string;
    createdAt: Date;
    workflowId: string;
    sourceNodeId: string;
    sourceHandle: string;
    targetNodeId: string;
    targetHandle: string;
}>;
/** 删除连接（controller 中叫 deleteConnectionService） */
export declare const deleteConnection: (connectionId: string) => Promise<void>;
//# sourceMappingURL=nodeService.d.ts.map