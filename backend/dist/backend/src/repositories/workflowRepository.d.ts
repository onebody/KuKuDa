import { Workflow } from '@prisma/client';
/**
 * 工作流数据访问层
 * 封装所有工作流相关的数据库操作
 */
/**
 * 创建工作流
 * @param data - 工作流数据
 * @returns 创建的工作流
 */
export declare const createWorkflow: (data: {
    name: string;
    description?: string;
    userId: string;
    isTemplate?: boolean;
}) => Promise<Workflow>;
/**
 * 根据 ID 查找工作流
 * @param id - 工作流 ID
 * @returns 工作流对象或 null
 */
export declare const findWorkflowById: (id: string) => Promise<Workflow | null>;
/**
 * 获取用户的工作流列表
 * @param userId - 用户 ID
 * @param page - 页码
 * @param pageSize - 每页数量
 * @returns 工作流列表和总数
 */
export declare const findWorkflowsByUserId: (userId: string, page?: number, pageSize?: number) => Promise<{
    workflows: Workflow[];
    total: number;
}>;
/**
 * 获取模板列表
 * @param page - 页码
 * @param pageSize - 每页数量
 * @returns 模板列表和总数
 */
export declare const findTemplates: (page?: number, pageSize?: number) => Promise<{
    workflows: Workflow[];
    total: number;
}>;
/**
 * 更新工作流
 * @param id - 工作流 ID
 * @param data - 要更新的数据
 * @returns 更新后的工作流
 */
export declare const updateWorkflow: (id: string, data: {
    name?: string;
    description?: string;
    nodes?: any;
    connections?: any;
    isTemplate?: boolean;
    isPublic?: boolean;
    lastExecutedAt?: Date;
}) => Promise<Workflow>;
/**
 * 删除工作流
 * @param id - 工作流 ID
 */
export declare const deleteWorkflow: (id: string) => Promise<void>;
/**
 * 复制工作流
 * @param id - 源工作流 ID
 * @param userId - 新用户 ID
 * @returns 新的工作流
 */
export declare const duplicateWorkflow: (id: string, userId: string) => Promise<Workflow>;
/**
 * 获取工作流执行记录
 * @param workflowId - 工作流 ID
 * @param page - 页码
 * @param pageSize - 每页数量
 * @returns 执行记录列表和总数
 */
export declare const findWorkflowExecutions: (workflowId: string, page?: number, pageSize?: number) => Promise<{
    executions: any[];
    total: number;
}>;
//# sourceMappingURL=workflowRepository.d.ts.map