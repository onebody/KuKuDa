import { Router } from 'express'

const router = Router()

// 获取执行记录列表
router.get('/workflow/:workflowId', async (req, res) => {
  res.json({ code: 0, data: [], message: 'success' })
})

// 获取执行记录详情
router.get('/:id', async (req, res) => {
  res.json({ code: 0, data: null, message: 'success' })
})

// 取消执行
router.post('/:id/cancel', async (req, res) => {
  res.json({ code: 0, data: null, message: '已取消' })
})

export default router
