import { Router } from 'express'

const router = Router()

// 获取模板列表
router.get('/', async (req, res) => {
  res.json({ code: 0, data: [], message: 'success' })
})

// 从模板创建工作流
router.post('/:id/use', async (req, res) => {
  res.json({ code: 0, data: { id: 'new-workflow-id' }, message: 'success' })
})

export default router
