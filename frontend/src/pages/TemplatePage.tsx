import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { workflowService } from '../services/workflowService'
import { Workflow } from '../types'
import { Button, Card, Typography } from '@mui/material'

const TemplatePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [templates, setTemplates] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateFromTemplate = async (templateId: string) => {
    setIsLoading(true)
    try {
      // TODO: 从模板创建工作流
      console.log('Create from template:', templateId)
      alert('模板功能开发中...')
    } catch (error) {
      console.error('创建失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h4" gutterBottom>
        工作流模板
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        从模板快速创建工作流
      </Typography>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {/* 示例模板 */}
        <Card style={{ padding: 16 }}>
          <Typography variant="h6">文本生成模板</Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            输入文本提示，调用LLM生成内容
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleCreateFromTemplate('text-gen')}
            disabled={isLoading}
          >
            使用此模板
          </Button>
        </Card>

        <Card style={{ padding: 16 }}>
          <Typography variant="h6">图片生成模板</Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            输入提示词，生成AI图片
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleCreateFromTemplate('image-gen')}
            disabled={isLoading}
          >
            使用此模板
          </Button>
        </Card>
      </div>
    </div>
  )
}

export default TemplatePage
