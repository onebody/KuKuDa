import { BaseNodeAdapter } from './ai/nodeAdapters/BaseNodeAdapter';
import { NodeInput, NodeOutput } from '../../../shared/types/node';
import { ExecutionContext, NodeExecutionResult, WorkflowExecutionResult } from '../types/node';
/**
 * 执行服务（重构版）
 * 使用新的节点适配器架构
 */
export declare const executionService: {
    /**
     * 执行工作流
     * @param workflowId 工作流ID
     * @param userId 用户ID
     * @returns 执行记录
     */
    executeWorkflow(workflowId: string, userId: string): Promise<{
        error: string | null;
        status: import(".prisma/client").$Enums.ExecutionStatus;
        id: string;
        createdAt: Date;
        userId: string;
        triggeredBy: string;
        startedAt: Date;
        completedAt: Date | null;
        nodeResults: import("@prisma/client/runtime/library").JsonValue | null;
        workflowId: string;
    }>;
    /**
     * 运行执行（核心执行引擎 - 重构版）
     * @param executionId 执行ID
     * @param nodes 节点数组
     * @param connections 连接数组
     * @param userId 用户ID
     */
    runExecution(executionId: string, nodes: any[], connections: any[], userId: string): Promise<void>;
    /**
     * 执行单个节点（重构版）
     * @param node 节点数据
     * @param previousResults 上游节点执行结果
     * @param context 执行上下文
     * @returns 节点执行结果
     */
    executeNode(node: any, previousResults: Record<string, NodeOutput>, context: ExecutionContext): Promise<NodeOutput>;
    /**
     * 获取节点适配器
     * @param nodeType 节点类型
     * @returns 适配器实例
     */
    getAdapter(nodeType: string): BaseNodeAdapter | null;
    /**
     * 获取节点输入（从上游节点结果）
     * @param nodeId 当前节点ID
     * @param previousResults 所有上游节点结果
     * @param inputPorts 输入端口定义（可选）
     * @returns 节点输入
     */
    getNodeInput(nodeId: string, previousResults: Record<string, NodeOutput>, inputPorts?: any[]): NodeInput;
    /**
     * 变量插值解析
     * @param text 包含变量的文本
     * @param nodeResults 节点执行结果
     * @returns 解析后的文本
     */
    resolveVariables(text: string, nodeResults: Record<string, NodeOutput>): string;
};
/**
 * 向后兼容：导出类型
 */
export type { ExecutionContext, NodeExecutionResult, WorkflowExecutionResult };
//# sourceMappingURL=executionService.d.ts.map