import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { workflowService } from '../services/workflowService'
import { Workflow } from '../types'
import { toast } from 'react-hot-toast'
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, AccountTree as WorkflowIcon, Hub as NodeIcon, Timeline as EdgeIcon, AccessTime as TimeIcon } from '@mui/icons-material'

// ── 暗色主题配色（与项目保持一致）──────────────────────────
const colors = {
  bgPage: '#0d0d1a',
  bgCard: '#1a1a2e',
  bgCardHover: '#222240',
  border: '#2d2d44',
  borderHover: '#3d3d5c',
  textPrimary: '#ffffff',
  textSecondary: '#8b8b9a',
  textMuted: '#5a5a6e',
  accentBlue: '#4a9eff',
  accentBlueLight: '#6bb3ff',
  accentGreen: '#22c55e',
  accentRed: '#ef4444',
  accentOrange: '#f59e0b',
}

export default function DashboardPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // 加载工作流列表
  useEffect(() => {
    loadWorkflows()
  }, [])

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const loadWorkflows = async () => {
    try {
      const response = await workflowService.getWorkflows()
      if (response.code === 0 && response.data) {
        setWorkflows(response.data)
      }
    } catch (error) {
      console.error('加载工作流失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 创建工作流
  const handleCreateWorkflow = async () => {
    try {
      const response = await workflowService.createWorkflow({
        name: '新建工作流'
      })
      if (response.code === 0 && response.data) {
        navigate(`/workflow/${response.data.id}`)
      }
    } catch (error) {
      toast.error('创建工作流失败')
      console.error('创建工作流失败:', error)
    }
  }

  // 删除工作流
  const handleDeleteWorkflow = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!window.confirm('确定要删除这个工作流吗？')) return

    try {
      await workflowService.deleteWorkflow(id)
      toast.success('删除成功')
      loadWorkflows()
    } catch (error) {
      toast.error('删除失败')
      console.error('删除工作流失败:', error)
    }
  }

  // 进入编辑模式
  const handleStartEdit = useCallback((e: React.MouseEvent, workflow: Workflow) => {
    e.stopPropagation()
    setEditingId(workflow.id)
    setEditValue(workflow.name)
  }, [])

  // 保存名称
  const handleSaveName = useCallback(async (id: string) => {
    if (!editValue.trim()) return
    try {
      await workflowService.updateWorkflow(id, { name: editValue.trim() })
      toast.success('名称已保存')
      setEditingId(null)
      loadWorkflows()
    } catch (error) {
      toast.error('保存失败')
      console.error('更新工作流名称失败:', error)
    }
  }, [editValue])

  // 编辑框按键
  const handleEditKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveName(id)
    }
    if (e.key === 'Escape') {
      setEditingId(null)
    }
  }, [handleSaveName])

  // 格式化时间
  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // 获取节点类型统计
  const getNodeTypeStats = (workflow: Workflow): string[] => {
    if (!workflow.nodes || workflow.nodes.length === 0) return []
    const typeLabels: Record<string, string> = {
      TEXT_INPUT: '文本输入',
      IMAGE_INPUT_SINGLE: '单图输入',
      IMAGE_INPUT_MULTI: '多图输入',
      FILE_INPUT_SINGLE: '单文件',
      FILE_INPUT_MULTI: '多文件',
      AI_IMAGE: 'AI绘图',
      TEXT_OUTPUT: '文本输出',
      SKILL: '技能',
    }
    const types = workflow.nodes.map((n) => typeLabels[n.type] || n.type)
    const unique = [...new Set(types)]
    return unique.slice(0, 4)
  }

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: colors.textMuted, backgroundColor: colors.bgPage, minHeight: '100vh' }}>
        加载中...
      </div>
    )
  }

  return (
    <div style={{ padding: 30, maxWidth: 1400, margin: '0 auto', backgroundColor: colors.bgPage, minHeight: '100vh' }}>
      {/* ── 页面头部 ─────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ margin: 0, color: colors.textPrimary, fontWeight: 600, fontSize: '1.5rem' }}>我的工作流</h1>
          <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: 14 }}>共 {workflows.length} 个工作流</p>
        </div>
        <button
          onClick={handleCreateWorkflow}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: colors.accentBlue,
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = colors.accentBlueLight }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = colors.accentBlue }}
        >
          <AddIcon fontSize="small" />
          新建工作流
        </button>
      </div>

      {workflows.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: colors.bgCard,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            border: `1px dashed ${colors.border}`,
          }}>
            <WorkflowIcon style={{ fontSize: 36, color: colors.textMuted }} />
          </div>
          <p style={{ color: colors.textSecondary, marginBottom: 8 }}>还没有工作流</p>
          <p style={{ color: colors.textMuted, fontSize: 14, marginBottom: 24 }}>创建工作流，让 AI 帮你自动化处理任务</p>
          <button
            onClick={handleCreateWorkflow}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: colors.accentBlue,
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = colors.accentBlueLight }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = colors.accentBlue }}
          >
            <AddIcon fontSize="small" />
            创建第一个工作流
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {workflows.map((workflow) => {
            const nodeStats = getNodeTypeStats(workflow)
            const nodeCount = workflow.nodes?.length || 0
            const edgeCount = workflow.connections?.length || 0

            return (
              <div
                key={workflow.id}
                style={{
                  position: 'relative',
                  backgroundColor: colors.bgCard,
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  padding: 24,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                onClick={() => {
                  if (editingId !== workflow.id) navigate(`/workflow/${workflow.id}`)
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = colors.bgCardHover
                  ;(e.currentTarget as HTMLElement).style.borderColor = colors.borderHover
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = colors.bgCard
                  ;(e.currentTarget as HTMLElement).style.borderColor = colors.border
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                {/* ── 卡片顶部：图标 + 标题 + 操作按钮 ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                  {/* 图标 */}
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    backgroundColor: `${colors.accentBlue}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <WorkflowIcon style={{ fontSize: 24, color: colors.accentBlue }} />
                  </div>

                  {/* 标题和描述 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* 可编辑标题 */}
                    {editingId === workflow.id ? (
                      <input
                        ref={editInputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSaveName(workflow.id)}
                        onKeyDown={(e) => handleEditKeyDown(e, workflow.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          fontSize: 16,
                          fontWeight: 600,
                          border: `1px solid ${colors.accentBlue}`,
                          borderRadius: 4,
                          padding: '4px 8px',
                          outline: 'none',
                          backgroundColor: colors.bgCardHover,
                          color: colors.textPrimary,
                          marginBottom: 4,
                          boxSizing: 'border-box',
                        }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: colors.textPrimary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          onDoubleClick={(e) => handleStartEdit(e, workflow)}
                          title="双击编辑名称"
                        >
                          {workflow.name}
                        </h3>
                        <button
                          onClick={(e) => handleStartEdit(e, workflow)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 14,
                            color: colors.textMuted,
                            padding: '2px 6px',
                            borderRadius: 4,
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = `${colors.accentBlue}15` }}
                          onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = 'transparent' }}
                          title="编辑名称"
                        >
                          ✎
                        </button>
                      </div>
                    )}

                    <p style={{
                      margin: '4px 0 0',
                      color: colors.textSecondary,
                      fontSize: 13,
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '2.2em',
                    }}>
                      {workflow.description || '暂无描述'}
                    </p>
                  </div>

                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => handleDeleteWorkflow(e, workflow.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 18,
                      color: colors.textMuted,
                      padding: '4px 8px',
                      borderRadius: 6,
                      flexShrink: 0,
                      opacity: 0.6,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.opacity = '1'
                      ;(e.target as HTMLElement).style.backgroundColor = `${colors.accentRed}15`
                      ;(e.target as HTMLElement).style.color = colors.accentRed
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.opacity = '0.6'
                      ;(e.target as HTMLElement).style.backgroundColor = 'transparent'
                      ;(e.target as HTMLElement).style.color = colors.textMuted
                    }}
                    title="删除"
                  >
                    ✕
                  </button>
                </div>

                {/* ── 节点类型标签 ── */}
                {nodeStats.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {nodeStats.map((label, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: 6,
                          backgroundColor: `${colors.accentBlue}10`,
                          border: `1px solid ${colors.accentBlue}25`,
                          color: colors.accentBlueLight,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}

                {/* ── 底部统计信息 ── */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  borderTop: `1px solid ${colors.border}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: colors.textMuted, fontSize: 13 }}>
                      <NodeIcon style={{ fontSize: 14 }} />
                      {nodeCount}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: colors.textMuted, fontSize: 13 }}>
                      <EdgeIcon style={{ fontSize: 14 }} />
                      {edgeCount}
                    </span>
                  </div>

                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: colors.textMuted, fontSize: 13 }}>
                    <TimeIcon style={{ fontSize: 13 }} />
                    {formatTime(workflow.updatedAt)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
