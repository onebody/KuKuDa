"use strict";
/**
 * API 类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
/**
 * 错误码枚举
 */
var ErrorCode;
(function (ErrorCode) {
    // 成功
    ErrorCode[ErrorCode["SUCCESS"] = 0] = "SUCCESS";
    // 客户端错误 (40001-40099)
    ErrorCode[ErrorCode["BAD_REQUEST"] = 40000] = "BAD_REQUEST";
    ErrorCode[ErrorCode["INVALID_EMAIL"] = 40001] = "INVALID_EMAIL";
    ErrorCode[ErrorCode["INVALID_PASSWORD"] = 40002] = "INVALID_PASSWORD";
    ErrorCode[ErrorCode["EMAIL_EXISTS"] = 40003] = "EMAIL_EXISTS";
    ErrorCode[ErrorCode["VALIDATION_ERROR"] = 40004] = "VALIDATION_ERROR";
    // 认证错误 (40101-40199)
    ErrorCode[ErrorCode["UNAUTHORIZED"] = 40100] = "UNAUTHORIZED";
    ErrorCode[ErrorCode["INVALID_TOKEN"] = 40101] = "INVALID_TOKEN";
    ErrorCode[ErrorCode["TOKEN_EXPIRED"] = 40102] = "TOKEN_EXPIRED";
    ErrorCode[ErrorCode["INVALID_CREDENTIALS"] = 40103] = "INVALID_CREDENTIALS";
    // 权限错误 (40301-40399)
    ErrorCode[ErrorCode["FORBIDDEN"] = 40300] = "FORBIDDEN";
    ErrorCode[ErrorCode["NO_PERMISSION"] = 40301] = "NO_PERMISSION";
    // 资源不存在 (40401-40499)
    ErrorCode[ErrorCode["NOT_FOUND"] = 40400] = "NOT_FOUND";
    ErrorCode[ErrorCode["USER_NOT_FOUND"] = 40401] = "USER_NOT_FOUND";
    ErrorCode[ErrorCode["WORKFLOW_NOT_FOUND"] = 40402] = "WORKFLOW_NOT_FOUND";
    ErrorCode[ErrorCode["NODE_NOT_FOUND"] = 40403] = "NODE_NOT_FOUND";
    ErrorCode[ErrorCode["CONNECTION_NOT_FOUND"] = 40404] = "CONNECTION_NOT_FOUND";
    // 服务器错误 (50001-50099)
    ErrorCode[ErrorCode["INTERNAL_ERROR"] = 50000] = "INTERNAL_ERROR";
    ErrorCode[ErrorCode["DATABASE_ERROR"] = 50001] = "DATABASE_ERROR";
    ErrorCode[ErrorCode["AI_SERVICE_ERROR"] = 50002] = "AI_SERVICE_ERROR";
    ErrorCode[ErrorCode["EXECUTION_ERROR"] = 50003] = "EXECUTION_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
//# sourceMappingURL=api.js.map