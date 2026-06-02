/**
 * 节点类型常量
 */
/**
 * 节点类型枚举
 */
export declare enum NodeType {
    TEXT_INPUT = "TEXT_INPUT",
    TEXT_OUTPUT = "TEXT_OUTPUT",
    LLM_CALL = "LLM_CALL",
    IMAGE_GENERATION = "IMAGE_GENERATION",
    AI_IMAGE = "AI_IMAGE",
    IMAGE_INPUT = "IMAGE_INPUT",
    FILE_INPUT = "FILE_INPUT",
    CODE = "CODE",
    CONDITION = "CONDITION",
    LOOP = "LOOP"
}
/**
 * 节点状态枚举
 */
export declare enum NodeStatus {
    IDLE = "IDLE",
    RUNNING = "RUNNING",
    SUCCESS = "SUCCESS",
    ERROR = "ERROR"
}
/**
 * 执行状态枚举
 */
export declare enum ExecutionStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
/**
 * 节点类型颜色映射
 */
export declare const NODE_TYPE_COLORS: Record<NodeType, string>;
/**
 * 节点类型标签映射
 */
export declare const NODE_TYPE_LABELS: Record<NodeType, string>;
//# sourceMappingURL=nodeTypes.d.ts.map