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
export declare const createConnection: (data: {
    workflowId: string;
    sourceNodeId: string;
    sourceHandle: string;
    targetNodeId: string;
    targetHandle: string;
}) => Promise<NodeConnection>;
/**
 * 根据 ID 查找连接
 * @param id - 连接 ID
 * @returns 连接对象或 null
 */
export declare const findConnectionById: (id: string) => Promise<NodeConnection | null>;
/**
 * 获取工作流的所有连接
 * @param workflowId - 工作流 ID
 * @returns 连接列表
 */
export declare const findConnectionsByWorkflowId: (workflowId: string) => Promise<NodeConnection[]>;
/**
 * 删除连接
 * @param id - 连接 ID
 */
export declare const deleteConnection: (id: string) => Promise<void>;
/**
 * 批量创建连接
 * @param connections - 连接数据数组
 * @returns 创建的连接列表
 */
export declare const createManyConnections: (connections: Array<{
    workflowId: string;
    sourceNodeId: string;
    sourceHandle: string;
    targetNodeId: string;
    targetHandle: string;
}>) => Promise<NodeConnection[]>;
/**
 * 删除工作流的所有连接
 * @param workflowId - 工作流 ID
 */
export declare const deleteConnectionsByWorkflowId: (workflowId: string) => Promise<void>;
/**
 * 删除节点的所有相关连接（作为源或目标）
 * @param nodeId - 节点 ID
 */
export declare const deleteConnectionsByNodeId: (nodeId: string) => Promise<void>;
//# sourceMappingURL=connectionRepository.d.ts.map