import { z } from 'zod'

// 注册验证Schema
export const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  password: z.string().min(6, '密码长度至少6位'),
  name: z.string().min(2, '用户名至少2个字符')
})

// 登录验证Schema（支持手机号登录）
export const loginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  password: z.string().min(1, '请输入密码')
})

// 刷新Token验证Schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh Token不能为空')
})
