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
export declare const createNode: (data: {
    workflowId: string;
    type: NodeType;
    label: string;
    positionX: number;
    positionY: number;
    data?: any;
    config?: any;
}) => Promise<Node>;
/**
 * 根据 ID 查找节点
 * @param id - 节点 ID
 * @returns 节点对象或 null
 */
export declare const findNodeById: (id: string) => Promise<Node | null>;
/**
 * 获取工作流的所有节点
 * @param workflowId - 工作流 ID
 * @returns 节点列表
 */
export declare const findNodesByWorkflowId: (workflowId: string) => Promise<Node[]>;
/**
 * 更新节点
 * @param id - 节点 ID
 * @param data - 要更新的数据
 * @returns 更新后的节点
 */
export declare const updateNode: (id: string, data: {
    label?: string;
    positionX?: number;
    positionY?: number;
    data?: any;
    config?: any;
    status?: NodeStatus;
    result?: any;
    error?: string;
}) => Promise<Node>;
/**
 * 删除节点
 * @param id - 节点 ID
 */
export declare const deleteNode: (id: string) => Promise<void>;
/**
 * 批量创建节点
 * @param nodes - 节点数据数组
 * @returns 创建的节点列表
 */
export declare const createManyNodes: (nodes: Array<{
    id?: string;
    workflowId: string;
    type: NodeType;
    label: string;
    positionX: number;
    positionY: number;
    data?: any;
    config?: any;
}>) => Promise<Node[]>;
/**
 * 批量更新节点状态
 * @param nodeIds - 节点 ID 数组
 * @param status - 新状态
 */
export declare const updateNodesStatus: (nodeIds: string[], status: NodeStatus) => Promise<void>;
/**
 * 更新节点执行结果
 * @param id - 节点 ID
 * @param result - 执行结果
 * @param status - 节点状态
 * @param error - 错误信息
 */
export declare const updateNodeResult: (id: string, result: any, status: NodeStatus, error?: string) => Promise<Node>;
/**
 * 删除工作流的所有节点
 * @param workflowId - 工作流 ID
 */
export declare const deleteNodesByWorkflowId: (workflowId: string) => Promise<void>;
//# sourceMappingURL=nodeRepository.d.ts.map