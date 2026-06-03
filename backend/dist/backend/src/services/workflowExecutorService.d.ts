/**
 * 工作流执行引擎服务
 * 实现拓扑排序（Kahn's Algorithm）、并行执行、错误传播
 */
import { WorkflowExecutionResult } from '../types/node';
/**
 * 工作流执行引擎类
 * 负责工作流的拓扑排序、节点执行、错误传播
 */
export declare class WorkflowExecutorService {
    private executionId;
    private workflowId;
    private userId;
    private nodeResults;
    private executionStatus;
    private startTime;
    constructor(executionId: string, workflowId: string, userId: string);
    /**
     * 执行工作流（主入口）
     */
    execute(nodes: any[], connections: any[]): Promise<WorkflowExecutionResult>;
    /**
     * 拓扑排序（Kahn's Algorithm）
     */
    private topologicalSort;
    /**
     * 执行单个节点
     */
    private executeNode;
    private getNodeAdapter;
    private getNodeInput;
    private getUpstreamNodeIds;
    private buildVariables;
    private propagateError;
    private getDownstreamNodes;
    private updateNodeStatus;
    private updateExecutionRecord;
}
/**
 * 创建并运行工作流执行
 */
export declare function executeWorkflow(executionId: string, workflowId: string, userId: string, nodes: any[], connections: any[]): Promise<WorkflowExecutionResult>;
//# sourceMappingURL=workflowExecutorService.d.ts.map