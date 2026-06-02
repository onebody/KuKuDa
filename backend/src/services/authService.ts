import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { generateToken, generateRefreshToken, JwtPayload } from '../utils/jwt'
import { registerSchema, loginSchema } from '../validators/authValidator'

const prisma = new PrismaClient()

export const authService = {
  // 注册
  async register(data: { phone: string; password: string; name: string }) {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { phone: data.phone }
    })

    if (existingUser) {
      throw new Error('手机号已被注册')
    }

    // 密码哈希
    const passwordHash = await bcrypt.hash(data.password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        passwordHash,
        name: data.name
      }
    })

    // 生成Token
    const payload: JwtPayload = {
      userId: user.id,
      phone: user.phone,
      role: user.role
    }

    const token = generateToken(payload)
    const refreshToken = generateRefreshToken(payload)

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role
      },
      token,
      refreshToken
    }
  },

  // 登录
  async login(data: { phone: string; password: string }) {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { phone: data.phone }
    })

    if (!user) {
      throw new Error('手机号或密码错误')
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash)
    if (!isPasswordValid) {
      throw new Error('手机号或密码错误')
    }

    // 生成Token
    const payload: JwtPayload = {
      userId: user.id,
      phone: user.phone,
      role: user.role
    }

    const token = generateToken(payload)
    const refreshToken = generateRefreshToken(payload)

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role
      },
      token,
      refreshToken
    }
  },

  // 获取用户信息
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }
  }
}
