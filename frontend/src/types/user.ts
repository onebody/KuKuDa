/**
 * 用户相关类型定义
 */

/**
 * 用户角色枚举
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  TEAM_ADMIN = 'TEAM_ADMIN',
}

/**
 * 用户基本信息
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * 登录请求
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 更新用户请求
 */
export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
}

/**
 * 认证响应（包含 Token）
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * API 统一响应格式
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
