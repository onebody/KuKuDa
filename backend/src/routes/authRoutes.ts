import { Router } from 'express'
import { authController } from '../controllers/authController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// 注册
router.post('/register', authController.register as any)

// 登录
router.post('/login', authController.login as any)

// 登出
router.post('/logout', authController.logout as any)

// 获取当前用户信息 (需要认证)
router.get('/me', authMiddleware as any, authController.getMe as any)

export default router
