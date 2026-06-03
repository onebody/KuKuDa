"use strict";
/**
 * 后端节点类型定义
 * 定义后端节点相关的类型和接口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.NodeCategory = exports.DataType = exports.NodeType = void 0;
const node_1 = require("../../../shared/types/node");
Object.defineProperty(exports, "NodeType", { enumerable: true, get: function () { return node_1.NodeType; } });
Object.defineProperty(exports, "DataType", { enumerable: true, get: function () { return node_1.DataType; } });
Object.defineProperty(exports, "NodeCategory", { enumerable: true, get: function () { return node_1.NodeCategory; } });
/**
 * 日志级别
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
//# sourceMappingURL=node.js.map