/**
 * API 类型定义
 */

/**
 * 统一 API 响应格式
 */
export interface ApiResponse<T> {
  code: number;
  data: T | null;
  message: string;
}

/**
 * 分页响应格式
 */
export interface PaginatedResponse<T> {
  code: number;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  };
  message: string;
}

/**
 * 错误码枚举
 */
export enum ErrorCode {
  // 成功
  SUCCESS = 0,

  // 客户端错误 (40001-40099)
  BAD_REQUEST = 40000,
  INVALID_EMAIL = 40001,
  INVALID_PASSWORD = 40002,
  EMAIL_EXISTS = 40003,
  VALIDATION_ERROR = 40004,

  // 认证错误 (40101-40199)
  UNAUTHORIZED = 40100,
  INVALID_TOKEN = 40101,
  TOKEN_EXPIRED = 40102,
  INVALID_CREDENTIALS = 40103,

  // 权限错误 (40301-40399)
  FORBIDDEN = 40300,
  NO_PERMISSION = 40301,

  // 资源不存在 (40401-40499)
  NOT_FOUND = 40400,
  USER_NOT_FOUND = 40401,
  WORKFLOW_NOT_FOUND = 40402,
  NODE_NOT_FOUND = 40403,
  CONNECTION_NOT_FOUND = 40404,

  // 服务器错误 (50001-50099)
  INTERNAL_ERROR = 50000,
  DATABASE_ERROR = 50001,
  AI_SERVICE_ERROR = 50002,
  EXECUTION_ERROR = 50003,
}

/**
 * JWT Payload 扩展
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
