import { NodeType } from '@prisma/client';
/**
 * 节点服务层
 * 处理节点和连接相关的业务逻辑
 */
/**
 * 添加节点到工作流
 * @param workflowId - 工作流 ID
 * @param userId - 用户 ID（用于权限检查）
 * @param data - 节点数据
 * @returns 创建的节点
 */
export declare const addNode: (workflowId: string, userId: string, data: {
    type: NodeType;
    label: string;
    positionX: number;
    positionY: number;
    data?: any;
    config?: any;
}) => Promise<{
    id: string;
    type: import(".prisma/client").$Enums.NodeType;
    label: string;
    positionX: number;
    positionY: number;
    data: import("@prisma/client/runtime/library").JsonValue;
    config: import("@prisma/client/runtime/library").JsonValue;
    status: import(".prisma/client").$Enums.NodeStatus;
    createdAt: Date;
}>;
/**
 * 更新节点
 * @param nodeId - 节点 ID
 * @param userId - 用户 ID（用于权限检查）
 * @param data - 要更新的数据
 * @returns 更新后的节点
 */
export declare const updateNodeService: (nodeId: string, userId: string, data: {
    label?: string;
    positionX?: number;
    positionY?: number;
    data?: any;
    config?: any;
}) => Promise<{
    id: string;
    type: import(".prisma/client").$Enums.NodeType;
    label: string;
    positionX: number;
    positionY: number;
    data: import("@prisma/client/runtime/library").JsonValue;
    config: import("@prisma/client/runtime/library").JsonValue;
    status: import(".prisma/client").$Enums.NodeStatus;
    updatedAt: Date;
}>;
/**
 * 删除节点
 * @param nodeId - 节点 ID
 * @param userId - 用户 ID（用于权限检查）
 */
export declare const deleteNodeService: (nodeId: string, userId: string) => Promise<void>;
/**
 * 添加连接到工作流
 * @param workflowId - 工作流 ID
 * @param userId - 用户 ID（用于权限检查）
 * @param data - 连接数据
 * @returns 创建的连接
 */
export declare const addConnection: (workflowId: string, userId: string, data: {
    sourceNodeId: string;
    sourceHandle: string;
    targetNodeId: string;
    targetHandle: string;
}) => Promise<{
    id: string;
    sourceNodeId: string;
    sourceHandle: string;
    targetNodeId: string;
    targetHandle: string;
    createdAt: Date;
}>;
/**
 * 删除连接
 * @param connectionId - 连接 ID
 * @param userId - 用户 ID（用于权限检查）
 */
export declare const deleteConnectionService: (connectionId: string, userId: string) => Promise<void>;
/**
 * 获取工作流的所有节点
 * @param workflowId - 工作流 ID
 * @param userId - 用户 ID（用于权限检查）
 * @returns 节点列表
 */
export declare const getWorkflowNodes: (workflowId: string, userId?: string) => Promise<{
    id: string;
    type: import(".prisma/client").$Enums.NodeType;
    label: string;
    positionX: number;
    positionY: number;
    data: import("@prisma/client/runtime/library").JsonValue;
    config: import("@prisma/client/runtime/library").JsonValue;
    status: import(".prisma/client").$Enums.NodeStatus;
    result: import("@prisma/client/runtime/library").JsonValue;
    error: string | null;
    executedAt: Date | null;
}[]>;
/**
 * 获取工作流的所有连接
 * @param workflowId - 工作流 ID
 * @param userId - 用户 ID（用于权限检查）
 * @returns 连接列表
 */
export declare const getWorkflowConnections: (workflowId: string, userId?: string) => Promise<{
    id: string;
    sourceNodeId: string;
    sourceHandle: string;
    targetNodeId: string;
    targetHandle: string;
}[]>;
/**
 * 更新整个工作流（包括节点和连接）
 * @param workflowId - 工作流 ID
 * @param userId - 用户 ID（用于权限检查）
 * @param data - 包含 nodes 和 connections 的数据
 * @returns 更新结果
 */
export declare const updateWorkflow: (workflowId: string, userId: string, data: {
    nodes?: Array<{
        id?: string;
        type: NodeType;
        label: string;
        positionX: number;
        positionY: number;
        data?: any;
        config?: any;
    }>;
    connections?: Array<{
        id?: string;
        sourceNodeId: string;
        sourceHandle: string;
        targetNodeId: string;
        targetHandle: string;
    }>;
}) => Promise<{
    nodes?: any[];
    connections?: any[];
}>;
//# sourceMappingURL=nodeService.d.ts.map