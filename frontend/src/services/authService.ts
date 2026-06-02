import api from './api'
import { ApiResponse, LoginRequest, RegisterRequest, AuthResponse, User } from '../types'

export const authService = {
  // 注册
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post('/api/auth/register', data)
    return response.data
  },

  // 登录
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post('/api/auth/login', data)
    return response.data
  },

  // 登出
  async logout(): Promise<ApiResponse<null>> {
    const response = await api.post('/api/auth/logout')
    return response.data
  },

  // 获取当前用户信息
  async getMe(): Promise<ApiResponse<User>> {
    const response = await api.get('/api/auth/me')
    return response.data
  },

  // 刷新Token
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    const response = await api.post('/api/auth/refresh', { refreshToken })
    return response.data
  }
}
