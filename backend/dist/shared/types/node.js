"use strict";
/**
 * 前后端共享类型定义
 * 这些类型在前后端之间共享，确保类型一致性
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeCategory = exports.DataType = exports.NodeType = void 0;
/**
 * 节点类型枚举
 */
var NodeType;
(function (NodeType) {
    NodeType["TEXT_INPUT"] = "TEXT_INPUT";
    NodeType["TEXT_OUTPUT"] = "TEXT_OUTPUT";
    NodeType["AI_IMAGE"] = "AI_IMAGE";
    NodeType["IMAGE_INPUT"] = "IMAGE_INPUT";
    NodeType["FILE_INPUT"] = "FILE_INPUT";
    NodeType["PROMPT_OPTIMIZE"] = "PROMPT_OPTIMIZE";
    NodeType["SKILL"] = "SKILL";
    NodeType["LLM_CALL"] = "LLM_CALL";
    NodeType["IMAGE_GENERATION"] = "IMAGE_GENERATION";
    NodeType["IMAGE_OUTPUT"] = "IMAGE_OUTPUT";
    NodeType["CODE"] = "CODE";
    NodeType["CONDITION"] = "CONDITION";
    NodeType["LOOP"] = "LOOP";
})(NodeType || (exports.NodeType = NodeType = {}));
/**
 * 数据类型枚举
 */
var DataType;
(function (DataType) {
    DataType["TEXT"] = "TEXT";
    DataType["IMAGE"] = "IMAGE";
    DataType["FILE"] = "FILE";
    DataType["JSON"] = "JSON";
    DataType["BINARY"] = "BINARY";
    DataType["ANY"] = "ANY";
})(DataType || (exports.DataType = DataType = {}));
/**
 * 节点分类枚举
 */
var NodeCategory;
(function (NodeCategory) {
    NodeCategory["INPUT"] = "INPUT";
    NodeCategory["OUTPUT"] = "OUTPUT";
    NodeCategory["PROCESSING"] = "PROCESSING";
    NodeCategory["AI"] = "AI";
    NodeCategory["LOGIC"] = "LOGIC";
})(NodeCategory || (exports.NodeCategory = NodeCategory = {}));
//# sourceMappingURL=node.js.map