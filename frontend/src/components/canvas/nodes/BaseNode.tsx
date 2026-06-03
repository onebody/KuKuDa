import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Handle, Position } from 'reactflow'
import { darkThemeColors } from '../../../styles/theme'

export interface BaseNodeProps {
  data?: any
  selected?: boolean
  type?: string
  label?: string
  icon?: string
  inputs?: any[]
  outputs?: any[]
  children?: React.ReactNode
}

/** 尺寸规划（px）- 根据画布 ≈1600×900，最大不超过 1/3 */
const SIZES: Record<string, { minW: number; minH: number; maxW: number; maxH: number; defW: number; defH: number }> = {
  textInput: { minW: 200, minH: 100, maxW: 480, maxH: 360, defW: 240, defH: 140 },
  aiImage:   { minW: 240, minH: 180, maxW: 520, maxH: 450, defW: 280, defH: 300 },
  textOutput:{ minW: 200, minH: 100, maxW: 480, maxH: 320, defW: 240, defH: 120 },
  default:   { minW: 180, minH: 60,  maxW: 400, maxH: 320, defW: 220, defH: 80 },
}

function getSize(type: string) {
  return SIZES[type] || SIZES.default
}

const BaseNode: React.FC<BaseNodeProps> = (props) => {
  const {
    data = {},
    selected = false,
    type = '',
    label = '',
    icon = '',
    inputs = [],
    outputs = [],
    children,
  } = props

  const [isHovered, setIsHovered] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(!!data?.collapsed)
  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const [labelValue, setLabelValue] = useState(data?.label || label || '')
  const labelInputRef = useRef<HTMLInputElement>(null)

  // 用 ref 保存最新 data，避免闭包陷阱
  const dataRef = useRef<any>({})
  dataRef.current = data || {}

  // 当前尺寸配置
  const sc = getSize(type || '')

  // scale 计算
  const scale = (() => {
    const w = typeof dataRef.current?.width === 'number' ? dataRef.current.width : sc.defW
    return Math.max(0.8, Math.min(1.5, w / sc.defW))
  })()

  // 同步 collapsed 状态
  useEffect(() => {
    if (data?.collapsed !== undefined && data.collapsed !== isCollapsed) {
      setIsCollapsed(!!data.collapsed)
    }
  }, [data?.collapsed])

  // 聚焦 label 输入框
  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus()
      labelInputRef.current.select()
    }
  }, [isEditingLabel])

  // ── 回调 ──────────────────────────────

  const commitLabel = useCallback(() => {
    setIsEditingLabel(false)
    const currentLabel = dataRef.current?.label || label || ''
    if (labelValue !== currentLabel) {
      dataRef.current?.onChange?.('label', labelValue)
    }
  }, [labelValue, label])

  const handleToggleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const newVal = !isCollapsed
    setIsCollapsed(newVal)
    dataRef.current?.onChange?.('collapsed', newVal)
  }, [isCollapsed])

  const handleLabelDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditingLabel(true)
  }, [])

  const handleLabelBlur = useCallback(() => {
    commitLabel()
  }, [commitLabel])

  const handleLabelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitLabel()
    if (e.key === 'Escape') {
      setIsEditingLabel(false)
      setLabelValue(dataRef.current?.label || label || '')
    }
  }, [commitLabel, label])

  // ── 拖拽调整大小 ──────────────────────
  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const scfg = getSize(type || '')
    const startW = typeof dataRef.current?.width === 'number' ? dataRef.current.width : scfg.defW
    const startH = typeof dataRef.current?.height === 'number' ? dataRef.current.height : (isCollapsed ? 40 : scfg.defH)

    const onMove = (ev: PointerEvent) => {
      ev.preventDefault()
      const newW = Math.max(scfg.minW, Math.min(scfg.maxW, startW + (ev.clientX - startX)))
      const newH = Math.max(
        isCollapsed ? 40 : scfg.minH,
        Math.min(scfg.maxH, startH + (ev.clientY - startY)),
      )
      dataRef.current?.onChange?.('width', newW)
      dataRef.current?.onChange?.('height', newH)
    }
    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  // ── 样式 ──────────────────────────────

  const nodeStyle: React.CSSProperties = {
    backgroundColor: selected
      ? `${darkThemeColors.accentBlue}08`
      : darkThemeColors.bgSecondary,
    border: selected
      ? `2px solid ${darkThemeColors.accentBlue}`
      : `1px solid ${isHovered ? darkThemeColors.border + '99' : darkThemeColors.border}`,
    borderRadius: '8px',
    // 关键：width/height 必须是 'XXXpx' 字符串，不能是数字
    width:  typeof dataRef.current?.width === 'number' ? `${dataRef.current.width}px` : `${sc.defW}px`,
    height: typeof dataRef.current?.height === 'number' ? `${dataRef.current.height}px` : 'auto',
    minWidth: `${sc.minW}px`,
    maxWidth: `${sc.maxW}px`,
    minHeight: isCollapsed ? '40px' : `${sc.minH}px`,
    maxHeight: `${sc.maxH}px`,
    boxShadow: selected
      ? `0 0 0 3px ${darkThemeColors.accentBlue}30, 0 0 20px ${darkThemeColors.accentBlue}25, 0 8px 24px rgba(0,0,0,0.6)`
      : isHovered
        ? '0 4px 12px rgba(0,0,0,0.3)'
        : '0 2px 8px rgba(0,0,0,0.2)',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
    overflow: 'hidden',
    position: 'relative',
  }

  const headerStyle: React.CSSProperties = {
    backgroundColor: darkThemeColors.bgTertiary,
    padding: `${Math.round(8 * scale)}px ${Math.round(12 * scale)}px`,
    display: 'flex',
    alignItems: 'center',
    gap: `${Math.round(8 * scale)}px`,
    borderBottom: `1px solid ${darkThemeColors.border}`,
    borderRadius: '8px 8px 0 0',
    flexShrink: 0,
  }

  const contentStyle: React.CSSProperties = {
    padding: `${Math.round(10 * scale)}px`,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    minHeight: 0,
  }

  return (
    <div
      style={nodeStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 输入句柄 */}
      {inputs.map((input: any, idx: number) => (
        <Handle
          key={`in-${input.id || idx}`}
          type="target"
          position={Position.Left}
          id={input.id || `input-${idx}`}
          style={{
            background: darkThemeColors.accentBlue,
            width: `${Math.round(10 * scale)}px`,
            height: `${Math.round(10 * scale)}px`,
            border: `2px solid ${darkThemeColors.bgSecondary}`,
            left: `${Math.round(-5 * scale)}px`,
          }}
        />
      ))}

      {/* 节点头部 */}
      <div style={headerStyle}>
        <span style={{ fontSize: `${Math.round(14 * scale)}px` }}>{icon}</span>
        {isEditingLabel ? (
          <input
            ref={labelInputRef}
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={handleLabelBlur}
            onKeyDown={handleLabelKeyDown}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${darkThemeColors.accentBlue}`,
              color: darkThemeColors.textPrimary,
              fontSize: `${Math.round(13 * scale)}px`,
              fontWeight: 600,
              outline: 'none',
              flex: 1,
              padding: '2px 0',
            }}
          />
        ) : (
          <span
            onDoubleClick={handleLabelDoubleClick}
            style={{
              color: darkThemeColors.textPrimary,
              fontSize: `${Math.round(13 * scale)}px`,
              fontWeight: 600,
              flex: 1,
              cursor: 'text',
              userSelect: 'none',
            }}
          >
            {data?.label || label}
          </span>
        )}
        <span
          onClick={handleToggleCollapse}
          style={{
            cursor: 'pointer',
            fontSize: `${Math.round(12 * scale)}px`,
            color: darkThemeColors.textSecondary,
            userSelect: 'none',
          }}
        >
          {isCollapsed ? '▶' : '▼'}
        </span>
      </div>

      {/* 节点内容 */}
      {!isCollapsed && (
        <div style={contentStyle}>
          {children}
        </div>
      )}

      {/* 输出句柄 */}
      {outputs.map((output: any, idx: number) => (
        <Handle
          key={`out-${output.id || idx}`}
          type="source"
          position={Position.Right}
          id={output.id || `output-${idx}`}
          style={{
            background: darkThemeColors.accentGreen,
            width: `${Math.round(10 * scale)}px`,
            height: `${Math.round(10 * scale)}px`,
            border: `2px solid ${darkThemeColors.bgSecondary}`,
            right: `${Math.round(-5 * scale)}px`,
          }}
        />
      ))}

      {/* 右下角拖拽调整大小手柄 */}
      <div
        onPointerDown={handleResizeStart}
        style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: '16px',
          height: '16px',
          cursor: 'nwse-resize',
          background: `linear-gradient(135deg, transparent 50%, ${isHovered ? darkThemeColors.accentBlue : darkThemeColors.border} 50%)`,
          borderRadius: '0 0 8px 0',
          zIndex: 10,
        }}
      />
    </div>
  )
}

export default BaseNode
