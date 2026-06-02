import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { authService } from '../services/authService'
import { registerSchema, loginSchema } from '../validators/authValidator'

export const authController = {
  // 注册
  async register(req: Request, res: Response) {
    try {
      // 验证输入
      const data = registerSchema.parse(req.body)

      // 调用服务层
      const result = await authService.register(data)

      res.status(201).json({
        code: 0,
        data: result,
        message: '注册成功'
      })
    } catch (error: any) {
      res.status(400).json({
        code: 40001,
        data: null,
        message: error.message || '注册失败'
      })
    }
  },

  // 登录
  async login(req: Request, res: Response) {
    try {
      // 验证输入
      const data = loginSchema.parse(req.body)

      // 调用服务层
      const result = await authService.login(data)

      res.json({
        code: 0,
        data: result,
        message: '登录成功'
      })
    } catch (error: any) {
      res.status(400).json({
        code: 40002,
        data: null,
        message: error.message || '登录失败'
      })
    }
  },

  // 登出
  async logout(req: AuthRequest, res: Response) {
    try {
      // TODO: 将Token加入黑名单或删除Redis中的Session
      res.json({
        code: 0,
        data: null,
        message: '登出成功'
      })
    } catch (error: any) {
      res.status(500).json({
        code: 50001,
        data: null,
        message: error.message || '登出失败'
      })
    }
  },

  // 获取当前用户信息
  async getMe(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({
          code: 40101,
          data: null,
          message: '未认证'
        })
      }

      const user = await authService.getMe(userId)
      res.json({
        code: 0,
        data: user,
        message: 'success'
      })
    } catch (error: any) {
      res.status(500).json({
        code: 50001,
        data: null,
        message: error.message || '获取用户信息失败'
      })
    }
  }
}
