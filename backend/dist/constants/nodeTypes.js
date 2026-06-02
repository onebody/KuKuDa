"use strict";
/**
 * 节点类型常量
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_TYPE_LABELS = exports.NODE_TYPE_COLORS = exports.ExecutionStatus = exports.NodeStatus = exports.NodeType = void 0;
/**
 * 节点类型枚举
 */
var NodeType;
(function (NodeType) {
    NodeType["TEXT_INPUT"] = "TEXT_INPUT";
    NodeType["TEXT_OUTPUT"] = "TEXT_OUTPUT";
    NodeType["LLM_CALL"] = "LLM_CALL";
    NodeType["IMAGE_GENERATION"] = "IMAGE_GENERATION";
    NodeType["AI_IMAGE"] = "AI_IMAGE";
    NodeType["IMAGE_INPUT"] = "IMAGE_INPUT";
    NodeType["FILE_INPUT"] = "FILE_INPUT";
    NodeType["CODE"] = "CODE";
    NodeType["CONDITION"] = "CONDITION";
    NodeType["LOOP"] = "LOOP";
})(NodeType || (exports.NodeType = NodeType = {}));
/**
 * 节点状态枚举
 */
var NodeStatus;
(function (NodeStatus) {
    NodeStatus["IDLE"] = "IDLE";
    NodeStatus["RUNNING"] = "RUNNING";
    NodeStatus["SUCCESS"] = "SUCCESS";
    NodeStatus["ERROR"] = "ERROR";
})(NodeStatus || (exports.NodeStatus = NodeStatus = {}));
/**
 * 执行状态枚举
 */
var ExecutionStatus;
(function (ExecutionStatus) {
    ExecutionStatus["PENDING"] = "PENDING";
    ExecutionStatus["RUNNING"] = "RUNNING";
    ExecutionStatus["SUCCESS"] = "SUCCESS";
    ExecutionStatus["FAILED"] = "FAILED";
    ExecutionStatus["CANCELLED"] = "CANCELLED";
})(ExecutionStatus || (exports.ExecutionStatus = ExecutionStatus = {}));
/**
 * 节点类型颜色映射
 */
exports.NODE_TYPE_COLORS = {
    [NodeType.TEXT_INPUT]: '#2196F3',
    [NodeType.TEXT_OUTPUT]: '#4CAF50',
    [NodeType.LLM_CALL]: '#9C27B0',
    [NodeType.IMAGE_GENERATION]: '#FF9800',
    [NodeType.AI_IMAGE]: '#FF9800',
    [NodeType.IMAGE_INPUT]: '#2196F3',
    [NodeType.FILE_INPUT]: '#2196F3',
    [NodeType.CODE]: '#FF5722',
    [NodeType.CONDITION]: '#FFC107',
    [NodeType.LOOP]: '#009688',
};
/**
 * 节点类型标签映射
 */
exports.NODE_TYPE_LABELS = {
    [NodeType.TEXT_INPUT]: '文本输入',
    [NodeType.TEXT_OUTPUT]: '文本输出',
    [NodeType.LLM_CALL]: 'LLM 调用',
    [NodeType.IMAGE_GENERATION]: '图片生成',
    [NodeType.AI_IMAGE]: 'AI绘图',
    [NodeType.IMAGE_INPUT]: '图片输入',
    [NodeType.FILE_INPUT]: '文件输入',
    [NodeType.CODE]: '代码',
    [NodeType.CONDITION]: '条件',
    [NodeType.LOOP]: '循环',
};
//# sourceMappingURL=nodeTypes.js.map