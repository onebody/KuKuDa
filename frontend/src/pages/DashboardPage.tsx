import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { workflowService } from '../services/workflowService'
import { Workflow } from '../types'
import { toast } from 'react-hot-toast'

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
      console.error('创建工作流失败:', error)
    }
  }

  // 删除工作流
  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm('确定要删除这个工作流吗？')) return

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

  if (isLoading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>加载中...</div>
  }

  return (
    <div style={{ padding: 30, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1 style={{ margin: 0 }}>我的工作流</h1>
        <button
          onClick={handleCreateWorkflow}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          + 新建工作流
        </button>
      </div>

      {workflows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, color: '#999' }}>
          <p>还没有工作流</p>
          <p>点击"新建工作流"开始创建</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              style={{
                padding: 20,
                border: '1px solid #ddd',
                borderRadius: 8,
                backgroundColor: 'white',
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={() => {
                if (editingId !== workflow.id) navigate(`/workflow/${workflow.id}`)
              }}
            >
              {/* Title: editable */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {editingId === workflow.id ? (
                  <input
                    ref={editInputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSaveName(workflow.id)}
                    onKeyDown={(e) => handleEditKeyDown(e, workflow.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      fontSize: 16,
                      fontWeight: 600,
                      border: '1px solid #1976d2',
                      borderRadius: 4,
                      padding: '4px 8px',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <h3
                    style={{ marginTop: 0, marginBottom: 8, flex: 1 }}
                    onDoubleClick={(e) => handleStartEdit(e, workflow)}
                    title="双击编辑名称"
                  >
                    {workflow.name}
                  </h3>
                )}

                {/* Edit button */}
                {editingId !== workflow.id && (
                  <button
                    onClick={(e) => handleStartEdit(e, workflow)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                      color: '#999',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                    title="编辑名称"
                  >
                    ✎
                  </button>
                )}
              </div>

              {workflow.description && (
                <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{workflow.description}</p>
              )}
              <div style={{ fontSize: 12, color: '#999', marginTop: 10 }}>
                更新于 {new Date(workflow.updatedAt).toLocaleDateString()}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteWorkflow(workflow.id)
                }}
                style={{
                  marginTop: 10,
                  padding: '5px 10px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: 3,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
