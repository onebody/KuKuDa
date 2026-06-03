import React, { useState, useCallback, useRef, useEffect } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
  ReactFlowInstance,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { toast } from 'react-hot-toast';
import * as dagre from 'dagre';

import { useNodeStore } from '../../stores/nodeStore'
import { darkThemeColors } from '../../styles/theme'
// NodeType from workflow types (used for menu consistency)

// Import custom node components
import TextInputNode from './nodes/TextInputNode'
import AIImageNode from './nodes/AIImageNode'

// Import custom edge components
import GradientEdge from './edges/GradientEdge'

// Node categories for context menu and connection menu
const nodeCategories = [
  {
    name: '输入节点',
    nodes: [
      { type: 'TEXT_INPUT', label: '文本输入', icon: '📝' },
      { type: 'IMAGE_INPUT', label: '图片输入', icon: '🖼️' },
      { type: 'FILE_INPUT', label: '文件输入', icon: '📁' },
    ],
  },
  {
    name: 'AI 模型',
    nodes: [
      { type: 'AI_IMAGE', label: 'AI绘图', icon: '🎨' },
    ],
  },
]

interface CanvasProps {
  workflowId: string
  onNodeSelect?: (node: ReactFlowNode | null) => void
  selectedNodes?: string[]
  setSelectedNodes?: (nodes: string[]) => void
  selectedEdges?: string[]
  setSelectedEdges?: (edges: string[]) => void
}

// Custom edge style for dark theme
const defaultEdgeOptions = {
  type: 'gradient',
  animated: true,
  style: {
    strokeWidth: 2,
  },
  markerEnd: {
    type: 'arrowclosed' as any,
    color: '#7B61FF',
  },
}

// Map from NodeType enum to reactflow node type key
const nodeTypeMap: Record<string, string> = {
  'TEXT_INPUT': 'textInput',
  'IMAGE_INPUT': 'imageInput',
  'FILE_INPUT': 'fileInput',
  'AI_IMAGE': 'aiImage',
}

// Reverse map: reactflow node type key -> NodeType enum
// Stable node types reference (module-level const to prevent re-mount / focus loss)
const nodeTypes = {
  textInput: TextInputNode,
  aiImage: AIImageNode,
}

// Stable edge types reference
const edgeTypes = {
  gradient: GradientEdge,
}

const reactflowTypeToNodeType: Record<string, string> = {
  'textInput': 'TEXT_INPUT',
  'imageInput': 'IMAGE_INPUT',
  'fileInput': 'FILE_INPUT',
  'aiImage': 'AI_IMAGE',
}

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
}

interface ConnectionMenuState {
  visible: boolean
  x: number
  y: number
  sourceNodeId: string
  sourceHandle: string | null
}

const Canvas: React.FC<CanvasProps> = ({ workflowId, onNodeSelect }) => {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    addConnection,
    fetchNodesAndConnections,
    syncWithBackend,
    updateNode,
    updateNodeLocal,
    deleteNode,
    deleteConnection,
    viewport,
    setViewport,
  } = useNodeStore()

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
  })

  // Connection menu state
  const [connectionMenu, setConnectionMenu] = useState<ConnectionMenuState>({
    visible: false,
    x: 0,
    y: 0,
    sourceNodeId: '',
    sourceHandle: null,
  })

  // Connection tracking refs
  const isConnecting = useRef(false)
  const connectingSource = useRef<{ nodeId: string; handle: string | null }>({
    nodeId: '',
    handle: null,
  })

  // ── Stable onChange handlers (FIX focus loss) ──────────────────
  // Previously, a new onChange closure was created for every node on every
  // storeNodes change, causing React Flow to re-mount node children → focus loss.
  // Now: cache updateNodeLocal in a ref, and create one stable onChange
  // closure per nodeId (created once, persisted in a ref Map).
  const updateNodeLocalRef = useRef(updateNodeLocal)
  updateNodeLocalRef.current = updateNodeLocal

  const onChangeCache = useRef<Map<string, (key: string, value: any) => void>>(new Map())

  const getOnChange = useCallback((nodeId: string) => {
    if (!onChangeCache.current.has(nodeId)) {
      onChangeCache.current.set(nodeId, (key: string, value: any) => {
        updateNodeLocalRef.current(nodeId, { [key]: value })
      })
    }
    return onChangeCache.current.get(nodeId)!
  }, [])

  // Clean up cached handlers for deleted nodes
  useEffect(() => {
    const validIds = new Set(storeNodes.map(n => n.id))
    for (const key of onChangeCache.current.keys()) {
      if (!validIds.has(key)) {
        onChangeCache.current.delete(key)
      }
    }
  }, [storeNodes])

  // Sync store -> React Flow state, inject stable onChange + upstreamData.
  // Only update a node object when its position or data actually changed,
  // to avoid unnecessary React Flow re-renders that unmount children.
  useEffect(() => {
    // Build nodeMap for upstream computation
    const nodeMap = new Map<string, typeof storeNodes[0]>()
    storeNodes.forEach(n => nodeMap.set(n.id, n))

    // Compute upstreamData per node
    const upstreamResult = new Map<string, { nodeId: string; nodeLabel: string; text?: string; images?: string[] }[]>()
    storeNodes.forEach(n => {
      const incomingEdges = storeEdges.filter(e => e.target === n.id)
      const upstream: { nodeId: string; nodeLabel: string; text?: string; images?: string[] }[] = []
      incomingEdges.forEach(edge => {
        const src = nodeMap.get(edge.source)
        if (!src) return
        const outText = src.data?.outputText || src.data?.resultText || ''
        const outImages = src.data?.outputImages || src.data?.resultImages || []
        if (outText || (outImages && outImages.length > 0)) {
          upstream.push({
            nodeId: src.id,
            nodeLabel: src.data?.label || src.id,
            text: outText || undefined,
            images: outImages.length > 0 ? outImages : undefined,
          })
        }
      })
      if (upstream.length > 0) {
        upstreamResult.set(n.id, upstream)
      }
    })

    setNodes((currentNodes) => {
      const currentMap = new Map(currentNodes.map(n => [n.id, n]))
      const selectionMap = new Map(currentNodes.map(n => [n.id, n.selected]))

      return storeNodes.map((node) => {
        const current = currentMap.get(node.id)
        const wasSelected = selectionMap.get(node.id)
        const upstream = upstreamResult.get(node.id) || []

        const newData = {
          ...node.data,
          onChange: getOnChange(node.id),
          upstreamData: upstream.length > 0 ? upstream : undefined,
        }

        // Skip update if nothing meaningful changed (prevents re-mount → focus loss)
        if (current) {
          const posSame =
            current.position.x === node.position.x &&
            current.position.y === node.position.y
          const labelSame = (current.data?.label || '') === (node.data?.label || '')
          const upstreamSame = current.data?.upstreamData === newData.upstreamData
          const onChangeSame = current.data?.onChange === newData.onChange
          // Shallow-compare data (key fields that onChange may update)
          const dataSame =
            JSON.stringify({ ...current.data, onChange: 0, upstreamData: 0 }) ===
            JSON.stringify({ ...newData,       onChange: 0, upstreamData: 0 })

          if (posSame && labelSame && dataSame && upstreamSame && onChangeSame) {
            // Truly nothing changed → reuse current node (no remount)
            return current
          }

          if (posSame && labelSame && upstreamSame && onChangeSame && !dataSame) {
            // Only data content changed (e.g. text input) → mutate in place to preserve focus
            current.data = newData
            // Also sync width/height from data to node obj (needed by NodeResizer)
            if (newData.width) current.width = newData.width
            if (newData.height) current.height = newData.height
            return current
          }
        }

        // Node is new or significantly changed → return fresh object
        return {
          ...node,
          selected: wasSelected || false,
          position: current?.position || { x: node.position.x, y: node.position.y },
          width: node.data?.width || undefined,
          height: node.data?.height || undefined,
          data: newData,
        }
      })
    })
  }, [storeNodes, storeEdges, getOnChange])

  useEffect(() => {
    setEdges(storeEdges)
  }, [storeEdges, setEdges])

  // Fetch data on workflowId change
  useEffect(() => {
    if (workflowId && workflowId !== 'new') {
      fetchNodesAndConnections(workflowId)
    }
  }, [workflowId, fetchNodesAndConnections])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close context menu
      if (contextMenu.visible) {
        const menu = document.querySelector('[data-context-menu]')
        if (menu && !menu.contains(event.target as Element)) {
          setContextMenu((prev) => ({ ...prev, visible: false }))
        }
      }

      // Close connection menu
      if (connectionMenu.visible) {
        const menu = document.querySelector('[data-connection-menu]')
        if (menu && !menu.contains(event.target as Element)) {
          setConnectionMenu((prev) => ({ ...prev, visible: false }))
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextMenu.visible, connectionMenu.visible])

  // Initialize ReactFlow instance
  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance
  }, [])

  // Update zoom level display
  const onZoom = useCallback((event: React.WheelEvent) => {
    if (reactFlowInstance.current) {
      const zoom = reactFlowInstance.current.getZoom()
      setZoomLevel(zoom)
    }
  }, [])

  // Handle nodes change (including resize)
  // Note: dimension changes are handled by BaseNode's onResizeEnd callback
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds))
  }, [])

  // Handle edges change
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds))
  }, [])

  // Handle Delete/Backspace to delete selected nodes+edges
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (
      event.key === 'Delete' ||
      event.key === 'Backspace'
    ) {
      // Don't capture if user is typing in an input
      const tag = (event.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const selectedNodes = nodes.filter(n => n.selected);
      const selectedEdges = edges.filter(e => e.selected);

      if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

      event.preventDefault();

      selectedNodes.forEach(n => deleteNode(n.id));
      selectedEdges.forEach(e => deleteConnection(e.id));

      // Also remove edges connected to deleted nodes from local state
      const deletedNodeIds = new Set(selectedNodes.map(n => n.id));
      setEdges((currentEdges) =>
        currentEdges.filter(
          e => !deletedNodeIds.has(e.source) && !deletedNodeIds.has(e.target)
        )
      );

      toast.success(
        `已删除 ${selectedNodes.length} 个节点${selectedEdges.length > 0 ? ` 和 ${selectedEdges.length} 条连线` : ''}`
      );
    }
  }, [nodes, edges, deleteNode, deleteConnection]);

  // Delete selected nodes+edges (called from BottomBar / external)
  const deleteSelected = useCallback(() => {
    const selectedNodes = nodes.filter(n => n.selected);
    const selectedEdges = edges.filter(e => e.selected);

    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      toast.error('请先选中要删除的节点或连线');
      return;
    }

    selectedNodes.forEach(n => deleteNode(n.id));
    selectedEdges.forEach(e => deleteConnection(e.id));

    const deletedNodeIds = new Set(selectedNodes.map(n => n.id));
    setEdges((currentEdges) =>
      currentEdges.filter(
        e => !deletedNodeIds.has(e.source) && !deletedNodeIds.has(e.target)
      )
    );

    toast.success(
      `已删除 ${selectedNodes.length} 个节点${selectedEdges.length > 0 ? ` 和 ${selectedEdges.length} 条连线` : ''}`
    );
  }, [nodes, edges, deleteNode, deleteConnection]);

  // Sync dragged position back to store (debounced via React Flow's internal state)
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode) => {
      updateNode(node.id, {
        positionX: node.position.x,
        positionY: node.position.y,
      })
    },
    [updateNode]
  )


  // Connect nodes
  const onConnect = useCallback(
    async (params: Connection) => {
      isConnecting.current = true
      const newEdge = addEdge({ ...params, ...defaultEdgeOptions }, edges)
      setEdges(newEdge)
      
      // Save to backend
      if (params.source && params.target) {
        try {
          await addConnection({
            source: params.source,
            sourceHandle: params.sourceHandle,
            target: params.target,
            targetHandle: params.targetHandle,
          })
        } catch (error) {
          console.error('Failed to add connection:', error)
        }
      }
      
      // Reset connection tracking
      setTimeout(() => {
        isConnecting.current = false
      }, 100)
    },
    [edges, setEdges, addConnection]
  )

  // Handle connection start (for connection menu)
  const onConnectStart = useCallback((event: React.MouseEvent, params: { nodeId: string; handleId: string | null; handleType: string }) => {
    if (params.handleType === 'source') {
      connectingSource.current = {
        nodeId: params.nodeId,
        handle: params.handleId,
      }
      isConnecting.current = false
    }
  }, [])

  // Handle connection end (show menu if dropped on blank area)
  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // Check if connection was successful
      if (isConnecting.current) {
        // Connection was made, just reset
        connectingSource.current = { nodeId: '', handle: null }
        isConnecting.current = false
        return
      }

      // If we have a source node, show connection menu
      if (connectingSource.current.nodeId && reactFlowInstance.current && reactFlowWrapper.current) {
        const mouseEvent = event as MouseEvent
        const position = reactFlowInstance.current.screenToFlowPosition({
          x: mouseEvent.clientX,
          y: mouseEvent.clientY,
        })

        setConnectionMenu({
          visible: true,
          x: mouseEvent.clientX,
          y: mouseEvent.clientY,
          sourceNodeId: connectingSource.current.nodeId,
          sourceHandle: connectingSource.current.handle,
        })

        connectingSource.current = { nodeId: '', handle: null }
        isConnecting.current = false
      }
    },
    []
  )

  // Handle right-click context menu
  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      
      if (!reactFlowInstance.current) return

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
      })

      // Store position for adding node
      ;(window as any).__contextMenuPosition = position
    },
    []
  )

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode) => {
      // Close menus when clicking on a node
      setContextMenu((prev) => ({ ...prev, visible: false }))
      setConnectionMenu((prev) => ({ ...prev, visible: false }))
      
      if (onNodeSelect) {
        onNodeSelect(node)
      }
    },
    [onNodeSelect]
  )

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }))
    setConnectionMenu((prev) => ({ ...prev, visible: false }))
    
    if (onNodeSelect) {
      onNodeSelect(null)
    }
  }, [onNodeSelect])

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Handle drop for adding nodes
  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')

      if (typeof type === 'undefined' || !type) {
        return
      }

      if (reactFlowInstance.current && reactFlowWrapper.current) {
        const position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })

        // Use the store's addNode method to create and add the node
        await useNodeStore.getState().addNode(type, position)
      }
    },
    []
  )

  // Add node from context menu
  const handleAddNodeFromMenu = useCallback(
    async (nodeType: string) => {
      const position = (window as any).__contextMenuPosition || { x: 100, y: 100 }
      
      // nodeType is already NodeType enum (e.g. 'AI_IMAGE'), pass directly to addNode
      await useNodeStore.getState().addNode(nodeType, position)
      setContextMenu((prev) => ({ ...prev, visible: false }))
    },
    []
  )

  // Add node from connection menu and create connection
  const handleAddNodeFromConnectionMenu = useCallback(
    async (nodeType: string) => {
      if (!reactFlowInstance.current) return

      const flowPosition = reactFlowInstance.current.screenToFlowPosition({
        x: connectionMenu.x,
        y: connectionMenu.y,
      })

      // nodeType is already NodeType enum (e.g. 'AI_IMAGE'), pass directly to addNode
      const newNode = await useNodeStore.getState().addNode(nodeType, flowPosition)
      
      // Create connection from source to new node
      if (newNode && connectionMenu.sourceNodeId) {
        const newEdge = {
          source: connectionMenu.sourceNodeId,
          target: newNode.id || '',
          sourceHandle: connectionMenu.sourceHandle,
          targetHandle: undefined,
        }
        
        const updatedEdges = addEdge({ ...newEdge, ...defaultEdgeOptions }, edges)
        setEdges(updatedEdges)
        
        // Save connection to backend
        try {
          await addConnection({
            source: newEdge.source,
            sourceHandle: newEdge.sourceHandle,
            target: newEdge.target,
            targetHandle: newEdge.targetHandle,
          })
        } catch (error) {
          console.error('Failed to add connection:', error)
        }
      }

      setConnectionMenu((prev) => ({ ...prev, visible: false }))
    },
    [connectionMenu, edges, setEdges, addConnection]
  )

  // Save workflow
  const handleSave = useCallback(async () => {
    if (!reactFlowInstance.current) return;
    const viewport = reactFlowInstance.current.getViewport();
    const viewportStr = JSON.stringify(viewport);
    setIsLoading(true);
    try {
      await syncWithBackend(viewportStr);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [syncWithBackend])

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.zoomIn()
      setZoomLevel(reactFlowInstance.current.getZoom())
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.zoomOut()
      setZoomLevel(reactFlowInstance.current.getZoom())
    }
  }, [])

  const handleFitView = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ padding: 0.2 })
      setZoomLevel(reactFlowInstance.current.getZoom())
    }
  }, [])

  const getNodeSize = useCallback((node: ReactFlowNode) => ({
    width: (node as any).width || node.data?.width || 200,
    height: (node as any).height || node.data?.height || 80,
  }), [])

  const handleAutoLayout = useCallback(() => {
    if (!reactFlowInstance.current) return;
    try {
      const graph = new dagre.graphLib.Graph();
      graph.setDefaultEdgeLabel(() => ({}));

      // Set nodes with dimensions
      nodes.forEach((node) => {
        const size = getNodeSize(node)
        graph.setNode(node.id, { width: size.width, height: size.height });
      });

      // Set edges
      edges.forEach((edge) => {
        graph.setEdge(edge.source, edge.target);
      });

      dagre.layout(graph);

      // Apply layout positions
      const newNodes = nodes.map((node) => {
        const nodeWithPos = graph.node(node.id);
        const size = getNodeSize(node);
        return {
          ...node,
          position: {
            x: nodeWithPos.x - size.width / 2,
            y: nodeWithPos.y - size.height / 2,
          },
        };
      });

      setNodes(newNodes);

      // Sync positions to backend
      newNodes.forEach(node => {
        updateNode(node.id, {
          positionX: node.position.x,
          positionY: node.position.y,
        })
      })

      toast.success('自动布局完成');
    } catch (error) {
      console.error('自动布局失败:', error);
      toast.error('自动布局失败');
    }
  }, [nodes, edges, setNodes, getNodeSize, updateNode])

  type ArrangeType = 'grid' | 'alignLeft' | 'alignTop' | 'alignCenter' | 'distributeHorizontal' | 'distributeVertical'

  const handleArrange = useCallback((type: ArrangeType) => {
    if (nodes.length === 0) return

    const newNodes = nodes.map(n => ({ ...n, position: { ...n.position } }))

    switch (type) {
      case 'grid': {
        const cols = Math.max(1, Math.ceil(Math.sqrt(newNodes.length)))
        const gapX = 260
        const gapY = 160
        const startX = newNodes.length > 0 ? newNodes[0].position.x : 0
        const startY = newNodes.length > 0 ? newNodes[0].position.y : 0
        newNodes.forEach((node, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          node.position = {
            x: startX + col * gapX,
            y: startY + row * gapY,
          }
        })
        break
      }

      case 'alignLeft': {
        const minX = Math.min(...newNodes.map(n => n.position.x))
        newNodes.forEach(node => {
          node.position.x = minX
        })
        break
      }

      case 'alignTop': {
        const minY = Math.min(...newNodes.map(n => n.position.y))
        newNodes.forEach(node => {
          node.position.y = minY
        })
        break
      }

      case 'alignCenter': {
        let totalCX = 0, totalCY = 0
        newNodes.forEach(node => {
          const size = getNodeSize(node)
          totalCX += node.position.x + size.width / 2
          totalCY += node.position.y + size.height / 2
        })
        const avgCX = totalCX / newNodes.length
        const avgCY = totalCY / newNodes.length
        newNodes.forEach(node => {
          const size = getNodeSize(node)
          node.position = {
            x: avgCX - size.width / 2,
            y: avgCY - size.height / 2,
          }
        })
        break
      }

      case 'distributeHorizontal': {
        if (newNodes.length < 2) break
        const sorted = [...newNodes].sort((a, b) => a.position.x - b.position.x)
        const leftmost = sorted[0]
        const rightmost = sorted[sorted.length - 1]
        const leftEdge = leftmost.position.x
        const rightEdge = rightmost.position.x + getNodeSize(rightmost).width
        const totalSpan = rightEdge - leftEdge
        const totalNodeWidth = sorted.reduce((sum, n) => sum + getNodeSize(n).width, 0)
        const gap = sorted.length > 1 ? (totalSpan - totalNodeWidth) / (sorted.length - 1) : 0

        let currentX = leftEdge
        sorted.forEach((node) => {
          node.position.x = currentX
          currentX += getNodeSize(node).width + gap
        })
        break
      }

      case 'distributeVertical': {
        if (newNodes.length < 2) break
        const sorted = [...newNodes].sort((a, b) => a.position.y - b.position.y)
        const topmost = sorted[0]
        const bottommost = sorted[sorted.length - 1]
        const topEdge = topmost.position.y
        const bottomEdge = bottommost.position.y + getNodeSize(bottommost).height
        const totalSpan = bottomEdge - topEdge
        const totalNodeHeight = sorted.reduce((sum, n) => sum + getNodeSize(n).height, 0)
        const gap = sorted.length > 1 ? (totalSpan - totalNodeHeight) / (sorted.length - 1) : 0

        let currentY = topEdge
        sorted.forEach((node) => {
          node.position.y = currentY
          currentY += getNodeSize(node).height + gap
        })
        break
      }
    }

    setNodes(newNodes)

    // Sync positions to backend
    newNodes.forEach(node => {
      updateNode(node.id, {
        positionX: node.position.x,
        positionY: node.position.y,
      })
    })

    toast.success('整理完成')
  }, [nodes, setNodes, getNodeSize, updateNode])

  const handleToggleGrid = useCallback(() => {
    setShowGrid((prev) => !prev)
  }, [])

  const handleDownload = useCallback(() => {
    const data = {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        label: node.data.label,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workflow-${workflowId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [nodes, edges, workflowId])

  // Expose controls via ref callback
  useEffect(() => {
    const canvasEl = document.querySelector('[data-canvas-id="' + workflowId + '"]') as HTMLElement
    if (canvasEl) {
      ;(canvasEl as any).__canvasControls = {
        handleSave,
        handleZoomIn,
        handleZoomOut,
        handleFitView,
        handleAutoLayout,
        handleArrange,
        handleToggleGrid,
        handleDownload,
        deleteSelected,
        getZoomLevel: () => zoomLevel,
      }
    }
  }, [workflowId, zoomLevel, handleSave, handleZoomIn, handleZoomOut, handleFitView, handleAutoLayout, handleArrange, handleToggleGrid, handleDownload, deleteSelected])

  // Menu item style
  const menuItemStyle: React.CSSProperties = {
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    color: darkThemeColors.textPrimary,
    transition: 'background-color 0.15s ease',
    whiteSpace: 'nowrap',
  }

  // Restore viewport from store
  useEffect(() => {
    if (viewport && reactFlowInstance.current) {
      try {
        const viewportObj = JSON.parse(viewport);
        reactFlowInstance.current.setViewport(viewportObj);
        setViewport(null);
      } catch (e) {
        console.error('恢复 viewport 失败:', e);
      }
    }
  }, [viewport]);


  return (
    <div
      ref={reactFlowWrapper}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onContextMenu={onContextMenu}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart as any}
        onConnectEnd={onConnectEnd as any}
        onInit={onInit}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        onWheel={onZoom}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onKeyDown={handleKeyDown}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        connectionLineStyle={{
          stroke: '#7B61FF',
          strokeWidth: 2,
          strokeDasharray: '8 4',
        }}
        style={{
          backgroundColor: darkThemeColors.bgPrimary,
        }}
        className="dark-flow"


        multiSelectionKeyCode="Shift"
        selectionOnDrag={false}
        selectNodesOnDrag={true}
      >
        {/* Custom dark background with dots */}
        {showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={15}
            size={1}
            color={darkThemeColors.border}
            style={{ opacity: 0.5 }}
          />
        )}

        {/* Custom dark controls */}
        <Controls
          style={{
            backgroundColor: darkThemeColors.bgSecondary,
            border: `1px solid ${darkThemeColors.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
          showInteractive={false}
        />

        {/* Custom dark minimap */}
        <MiniMap
          style={{
            backgroundColor: darkThemeColors.bgSecondary,
            border: `1px solid ${darkThemeColors.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
          nodeColor={darkThemeColors.accentBlue}
          maskColor="rgba(0,0,0,0.7)"
        />
      </ReactFlow>

      {/* Context Menu (Right-click) */}
      {contextMenu.visible && (
        <div
          data-context-menu
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: darkThemeColors.bgSecondary,
            border: `1px solid ${darkThemeColors.border}`,
            borderRadius: '8px',
            padding: '4px 0',
            minWidth: '200px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <div style={{
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 600,
            color: darkThemeColors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            添加节点
          </div>
          {nodeCategories.map((category) => (
            <div key={category.name}>
              <div style={{
                padding: '4px 12px',
                fontSize: '10px',
                fontWeight: 600,
                color: darkThemeColors.textSecondary,
                marginTop: '4px',
              }}>
                {category.name}
              </div>
              {category.nodes.map((node) => (
                <div
                  key={node.type}
                  style={menuItemStyle}
                  onClick={() => handleAddNodeFromMenu(node.type)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{node.icon}</span>
                  <span>{node.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Connection Menu (Drag connection to blank area) */}
      {connectionMenu.visible && (
        <div
          data-connection-menu
          style={{
            position: 'fixed',
            left: connectionMenu.x,
            top: connectionMenu.y,
            backgroundColor: darkThemeColors.bgSecondary,
            border: `1px solid ${darkThemeColors.border}`,
            borderRadius: '8px',
            padding: '4px 0',
            minWidth: '220px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <div style={{
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 600,
            color: darkThemeColors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            选择要连接的节点
          </div>
          {nodeCategories.map((category) => (
            <div key={category.name}>
              <div style={{
                padding: '4px 12px',
                fontSize: '10px',
                fontWeight: 600,
                color: darkThemeColors.textSecondary,
                marginTop: '4px',
              }}>
                {category.name}
              </div>
              {category.nodes.map((node) => (
                <div
                  key={node.type}
                  style={menuItemStyle}
                  onClick={() => handleAddNodeFromConnectionMenu(node.type)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{node.icon}</span>
                  <span>{node.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Custom styles for React Flow dark theme */}
      <style>{`
        .dark-flow {
          --xy-selection-box-border: ${darkThemeColors.accentBlue};
          --xy-selection-box-background: ${darkThemeColors.accentBlue}20;
        }

        .dark-flow .react-flow__edge-path {
          stroke: ${darkThemeColors.accentBlue};
          stroke-width: 2;
        }

        .dark-flow .react-flow__edge.selected .react-flow__edge-path {
          stroke: ${darkThemeColors.accentGreen};
        }

        .dark-flow .react-flow__handle {
          background: ${darkThemeColors.accentBlue};
          border: 2px solid ${darkThemeColors.bgSecondary};
          width: 10px;
          height: 10px;
          transition: all 0.2s ease;
        }

        .dark-flow .react-flow__handle:hover {
          background: ${darkThemeColors.accentGreen};
          transform: scale(1.3);
          box-shadow: 0 0 8px ${darkThemeColors.accentBlue};
        }

        .dark-flow .react-flow__controls-button {
          background: ${darkThemeColors.bgSecondary};
          border-bottom: 1px solid ${darkThemeColors.border};
          color: ${darkThemeColors.textPrimary};
          fill: ${darkThemeColors.textPrimary};
          width: 32px;
          height: 32px;
        }

        .dark-flow .react-flow__controls-button:hover {
          background: ${darkThemeColors.bgTertiary};
        }

        .dark-flow .react-flow__controls-button:last-child {
          border-bottom: none;
        }

        .dark-flow .react-flow__minimap {
          background: ${darkThemeColors.bgSecondary};
        }

        .dark-flow .react-flow__attribution {
          background: transparent;
          color: ${darkThemeColors.textSecondary};
          font-size: 10px;
        }

        /* Enhanced resize handles */
        .react-flow__resize-control.handle {
          transition: transform 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
        }

        .react-flow__resize-control.handle:hover {
          transform: translate(-50%, -50%) scale(1.35) !important;
          background-color: ${darkThemeColors.accentGreen} !important;
          box-shadow: 0 0 0 2px ${darkThemeColors.accentGreen}, 0 0 16px ${darkThemeColors.accentGreen} !important;
          cursor: pointer;
        }

        .react-flow__resize-control.line {
          transition: opacity 0.15s ease, border-color 0.15s ease;
        }

        .react-flow__resize-control.line:hover {
          border-color: ${darkThemeColors.accentGreen} !important;
          opacity: 1 !important;
        }

        /* Only show bottom-right resize handle, hide all others */
        .react-flow__resize-control.handle {
          display: none !important;
        }
        .react-flow__resize-control.handle.bottom-right {
          display: block !important;
        }
        .react-flow__resize-control.line {
          display: none !important;
        }

        /* Spin animation for saving indicator */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Canvas
