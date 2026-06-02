import { Router } from 'express'
import { authController } from '../controllers/authController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// 注册
router.post('/register', authController.register)

// 登录
router.post('/login', authController.login)

// 登出
router.post('/logout', authController.logout)

// 获取当前用户信息 (需要认证)
router.get('/me', authMiddleware, authController.getMe)

export default router
