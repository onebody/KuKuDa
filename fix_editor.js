const fs = require('fs');
const path = '/Users/fcj/workspace/AI_SW/KuKuDa/frontend/src/pages/WorkflowEditorPage.tsx';

const content = `import React, { useState, useCallback, useEffect, useRef } from 'react'
import { ReactFlowProvider } from 'reactflow'
import { useParams } from 'react-router-dom'
import Canvas from '../components/canvas/Canvas'
import TopToolbar from '../components/canvas/TopToolbar'
import NodeLibrary from '../components/canvas/NodeLibrary'
import BottomBar from '../components/canvas/BottomBar'
import { workflowService } from '../services/workflowService'
import { useNodeStore } from '../stores/nodeStore'

function WorkflowEditorContent({ workflowId }: { workflowId: string }) {
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [workflowName, setWorkflowName] = useState('未命名项目')
  const canvasControlsRef = useRef<any>(null)
  const { syncWithBackend, deleteNode, deleteConnection } = useNodeStore()
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [selectedEdges, setSelectedEdges] = useState<string[]>([])

  const handleSave = useCallback(async () => {
    if (canvasControlsRef.current?.handleSave) {
      canvasControlsRef.current.handleSave()
    } else {
      await syncWithBackend()
    }
  }, [syncWithBackend])

  useEffect(() => {
    if (!workflowId || workflowId === 'new') return
    workflowService.getWorkflow(workflowId).then(res => {
      if (res.code === 0 && res.data) {
        setWorkflowName(res.data.name || '未命名项目')
      }
    }).catch(err => console.error('加载工作流失败:', err))
  }, [workflowId])

  useEffect(() => {
    const canvasEl = document.querySelector('[data-canvas-id=\"' + workflowId + '\"]') as HTMLElement
    if (canvasEl && (canvasEl as any).__canvasControls) {
      canvasControlsRef.current = (canvasEl as any).__canvasControls
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector('[data-canvas-id=\"' + workflowId + '\"]') as HTMLElement
      if (el && (el as any).__canvasControls) {
        canvasControlsRef.current = (el as any).__canvasControls
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [workflowId])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedNodes.length > 0 || selectedEdges.length > 0)) {
        e.preventDefault()
        handleDelete()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, selectedNodes, selectedEdges])

  const handleDelete = async () => {
    for (const nodeId of selectedNodes) {
      await deleteNode(nodeId)
    }
    for (const edgeId of selectedEdges) {
      await deleteConnection(edgeId)
    }
    setSelectedNodes([])
    setSelectedEdges([])
  }

  const handleDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <TopToolbar
        projectName={workflowName}
        onProjectNameChange={setWorkflowName}
        zoomLevel={canvasControlsRef.current?.getZoomLevel() || 1}
        onZoomIn={() => canvasControlsRef.current?.handleZoomIn()}
        onZoomOut={() => canvasControlsRef.current?.handleZoomOut()}
        onFitView={() => canvasControlsRef.current?.handleFitView()}
        onAutoLayout={() => canvasControlsRef.current?.handleAutoLayout()}
        showGrid={true}
        onToggleGrid={() => canvasControlsRef.current?.handleToggleGrid()}
        onDownload={() => canvasControlsRef.current?.handleDownload()}
        onOpenSettings={() => console.log('open settings')}
        onSave={handleSave}
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
          <Canvas 
            workflowId={workflowId}
            selectedNodes={selectedNodes}
            setSelectedNodes={setSelectedNodes}
            selectedEdges={selectedEdges}
            setSelectedEdges={setSelectedEdges}
          />
        </div>
      </div>
      <BottomBar
        onSave={handleSave}
        onDelete={handleDelete}
        onUndo={() => console.log('undo')}
        onZoomIn={() => canvasControlsRef.current?.handleZoomIn()}
        onZoomOut={() => canvasControlsRef.current?.handleZoomOut()}
        onFitView={() => canvasControlsRef.current?.handleFitView()}
        onAutoLayout={() => canvasControlsRef.current?.handleAutoLayout()}
        onToggleGrid={() => canvasControlsRef.current?.handleToggleGrid()}
        onDownload={() => canvasControlsRef.current?.handleDownload()}
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
`;

fs.writeFileSync(path, content);
console.log('File written successfully');
