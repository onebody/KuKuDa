"use strict";
/**
 * 工作流相关类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionStatus = exports.NodeStatus = exports.NodeType = void 0;
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
//# sourceMappingURL=workflow.js.map