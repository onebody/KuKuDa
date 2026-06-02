import { BaseAIAdapter, NodeResult } from './ai/baseAdapter';
export declare const executionService: {
    /**
     * 执行工作流
     */
    executeWorkflow(workflowId: string, userId: string): Promise<{
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
    }>;
    /**
     * 运行执行（核心执行引擎）
     */
    runExecution(executionId: string, nodes: any[], connections: any[]): Promise<void>;
    /**
     * 执行单个节点
     */
    executeNode(node: any, previousResults: Record<string, NodeResult>): Promise<NodeResult>;
    /**
     * 获取AI适配器
     */
    getAdapter(nodeType: string): BaseAIAdapter | null;
    /**
     * 获取节点输入（从上游节点结果）
     */
    getNodeInput(nodeId: string, previousResults: Record<string, NodeResult>): any;
};
//# sourceMappingURL=executionService.d.ts.map