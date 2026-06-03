import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import workflowRoutes from './routes/workflowRoutes'
import { nodeRouter as nodeRoutes } from './routes/nodeRoutes'
import executionRoutes from './routes/executionRoutes'
import templateRoutes from './routes/templateRoutes'
import skillRoutes from './routes/skillRoutes'
import aiRoutes from './routes/aiRoutes'
import { initializeSkills } from './services/skills'

dotenv.config()

const app: Express = express()

// 初始化技能注册表
initializeSkills()

// 安全中间件
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// 限流（开发环境放宽限制，生产环境可收紧）
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 500, // 最多500次请求
  message: { code: 429, message: '请求过于频繁，请稍后重试', data: null },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// 日志和压缩
app.use(morgan('dev'))
app.use(compression())

// 解析JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 健康检查（同时支持 /health 和 /api/health）
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/workflows', workflowRoutes)
app.use('/api', nodeRoutes)
app.use('/api/executions', executionRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/skills', skillRoutes)
app.use('/api/ai', aiRoutes)

// 错误处理
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message)
  res.status(500).json({
    code: 50001,
    data: null,
    message: err.message || 'Internal Server Error'
  })
})

// 404
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    code: 404,
    data: null,
    message: 'Route not found'
  })
})

export default app
