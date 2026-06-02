import React, { useState, useCallback, useEffect, useRef } from 'react'
import { ReactFlowProvider } from 'reactflow'
import { useParams, useNavigate } from 'react-router-dom'
import Canvas from '../components/canvas/Canvas'
import TopToolbar from '../components/canvas/TopToolbar'
import NodeLibrary from '../components/canvas/NodeLibrary'
import BottomBar from '../components/canvas/BottomBar'
import ApiSettingsModal from '../components/canvas/ApiSettingsModal'
import { workflowService } from '../services/workflowService'
import { useNodeStore } from '../stores/nodeStore'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'react-hot-toast'
import { debounce } from 'lodash'

function WorkflowEditorContent({ workflowId }: { workflowId: string }) {
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [workflowName, setWorkflowName] = useState('未命名项目')
  const [isSavingName, setIsSavingName] = useState(false)
  const [apiSettingsOpen, setApiSettingsOpen] = useState(false)
  const canvasControlsRef = useRef<any>(null)
  const { syncWithBackend, deleteNode, resetStore } = useNodeStore()
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const isNewWorkflow = workflowId === 'new'

  // Debounced workflow name save — stable ref, no useMemo needed
  const debouncedSaveName = useRef<ReturnType<typeof debounce> | null>(null)

  useEffect(() => {
    debouncedSaveName.current = debounce(async (id: string, name: string) => {
      setIsSavingName(true)
      try {
        await workflowService.updateWorkflow(id, { name })
        toast.success('工作流名称已保存')
      } catch (err: any) {
        toast.error(err?.response?.data?.message || '保存名称失败')
      } finally {
        setIsSavingName(false)
      }
    }, 2000)
    return () => {
      debouncedSaveName.current?.cancel()
    }
  }, [])

  const handleProjectNameChange = useCallback(
    (name: string) => {
      setWorkflowName(name)
      if (!isNewWorkflow && workflowId && debouncedSaveName.current) {
        debouncedSaveName.current(workflowId, name)
      }
    },
    [isNewWorkflow, workflowId]
  )

  const handleSave = useCallback(async () => {
    await syncWithBackend()
  }, [syncWithBackend])

  const handleClearCanvas = useCallback(() => {
    if (!confirm('确定要清空画布吗？所有节点和连线将被删除。')) return
    resetStore()
    toast.success('画布已清空')
  }, [resetStore])

  const handleLogout = useCallback(() => {
    logout()
    toast.success('已退出登录')
    navigate('/login')
  }, [logout, navigate])

  // Load workflow data
  useEffect(() => {
    if (!workflowId || workflowId === 'new') return
    workflowService.getWorkflow(workflowId).then(res => {
      if (res.code === 0 && res.data) {
        setWorkflowName(res.data.name || '未命名项目')
      }
    }).catch(err => console.error('加载工作流失败:', err))
  }, [workflowId])

  // Find and store canvas controls reference
  useEffect(() => {
    const canvasEl = document.querySelector(`[data-canvas-id="${workflowId}"]`) as HTMLElement
    if (canvasEl && (canvasEl as any).__canvasControls) {
      canvasControlsRef.current = (canvasEl as any).__canvasControls
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(`[data-canvas-id="${workflowId}"]`) as HTMLElement
      if (el && (el as any).__canvasControls) {
        canvasControlsRef.current = (el as any).__canvasControls
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [workflowId])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  const handleDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <TopToolbar
        projectName={workflowName}
        onProjectNameChange={handleProjectNameChange}
        isSavingName={isSavingName}
        zoomLevel={canvasControlsRef.current?.getZoomLevel() || 1}
        onZoomIn={() => canvasControlsRef.current?.handleZoomIn()}
        onZoomOut={() => canvasControlsRef.current?.handleZoomOut()}
        onFitView={() => canvasControlsRef.current?.handleFitView()}
        onArrange={(type) => canvasControlsRef.current?.handleArrange(type)}
        showGrid={true}
        onToggleGrid={() => canvasControlsRef.current?.handleToggleGrid()}
        onDownload={() => canvasControlsRef.current?.handleDownload()}
        onSave={handleSave}
        onClearCanvas={handleClearCanvas}
        onLogout={handleLogout}
        onBack={() => navigate('/')}
        onOpenApiSettings={() => setApiSettingsOpen(true)}
      />
      <div style={{ display: 'flex', flex: 1, width: '100%', minHeight: 0 }}>
        {activePanel === 'nodes' && (
          <NodeLibrary
            isOpen={activePanel === 'nodes'}
            onClose={() => setActivePanel(null)}
            onDragStart={handleDragStart}
          />
        )}
        <div style={{ flex: 1, position: 'relative', minWidth: 0, minHeight: 0 }}>
          <Canvas workflowId={workflowId} />
        </div>
      </div>
      <BottomBar
        onSave={handleSave}
        onDelete={() => canvasControlsRef.current?.deleteSelected()}
        onZoomIn={() => canvasControlsRef.current?.handleZoomIn()}
        onZoomOut={() => canvasControlsRef.current?.handleZoomOut()}
        onFitView={() => canvasControlsRef.current?.handleFitView()}
        onAutoLayout={() => canvasControlsRef.current?.handleAutoLayout()}
        onToggleGrid={() => canvasControlsRef.current?.handleToggleGrid()}
        onDownload={() => canvasControlsRef.current?.handleDownload()}
      />
      <ApiSettingsModal
        open={apiSettingsOpen}
        onClose={() => setApiSettingsOpen(false)}
      />
    </div>
  )
}

export default function WorkflowEditorPage() {
  const { id } = useParams()
  const workflowId = id || 'new'

  return (
    <ReactFlowProvider>
      <WorkflowEditorContent workflowId={workflowId} />
    </ReactFlowProvider>
  )
}
