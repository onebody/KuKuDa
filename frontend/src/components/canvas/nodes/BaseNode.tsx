import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position } from 'reactflow'
import { NodeResizer, NodeResizeControl, ResizeControlVariant } from '@reactflow/node-resizer'
import { darkThemeColors } from '../../../styles/theme'
import '@reactflow/node-resizer/dist/style.css'

export interface BaseNodeProps {
  data: any
  selected?: boolean
  type: string
  label: string
  icon: string
  inputs?: Array<{
    id: string
    label: string
    type?: string
  }>
  outputs?: Array<{
    id: string
    label: string
    type?: string
  }>
  children?: React.ReactNode
}

const BaseNode: React.FC<BaseNodeProps> = ({
  data,
  selected = false,
  type,
  label,
  icon,
  inputs = [],
  outputs = [],
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(data.collapsed || false)
  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const [labelValue, setLabelValue] = useState(data.label || label)
  const labelInputRef = useRef<HTMLInputElement>(null)

  // Sync collapsed state from data
  useEffect(() => {
    if (data.collapsed !== undefined && data.collapsed !== isCollapsed) {
      setIsCollapsed(data.collapsed)
    }
  }, [data.collapsed])

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus()
      labelInputRef.current.select()
    }
  }, [isEditingLabel])

  const handleToggleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    if (data.onChange) {
      data.onChange('collapsed', newCollapsed)
    }
  }, [isCollapsed, data])

  const handleLabelDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditingLabel(true)
  }, [])

  const handleLabelBlur = useCallback(() => {
    setIsEditingLabel(false)
    if (data.onChange && labelValue !== (data.label || label)) {
      data.onChange('label', labelValue)
    }
  }, [labelValue, data, label])

  const handleLabelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingLabel(false)
      if (data.onChange && labelValue !== (data.label || label)) {
        data.onChange('label', labelValue)
      }
    }
    if (e.key === 'Escape') {
      setIsEditingLabel(false)
      setLabelValue(data.label || label)
    }
  }, [labelValue, data, label])

  const nodeStyle: React.CSSProperties = {
    backgroundColor: selected
      ? `${darkThemeColors.accentBlue}08`
      : darkThemeColors.bgSecondary,
    border: selected
      ? `2px solid ${darkThemeColors.accentBlue}`
      : `1px solid ${isHovered ? darkThemeColors.border + '99' : darkThemeColors.border}`,
    borderRadius: '8px',
    minWidth: '200px',
    maxWidth: '600px',
    minHeight: isCollapsed ? '40px' : '60px',
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
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: isCollapsed ? 'none' : `1px solid ${darkThemeColors.border}`,
    cursor: 'move',
    userSelect: 'none',
  }

  const contentStyle: React.CSSProperties = {
    padding: '12px',
  }

  const portStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 0',
    fontSize: '12px',
    color: darkThemeColors.textSecondary,
  }

  const collapseBtnStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: 'none',
    color: darkThemeColors.textSecondary,
    cursor: 'pointer',
    fontSize: '10px',
    padding: '2px 4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    lineHeight: 1,
  }

  return (
    <div
      style={nodeStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="base-node"
    >
      {/* Node Resizer - visible when selected */}
      <NodeResizer
        minWidth={200}
        minHeight={isCollapsed ? 40 : 60}
        maxWidth={600}
        maxHeight={800}
        isVisible={selected}
        lineStyle={{
          borderColor: darkThemeColors.accentBlue,
          borderWidth: 2,
          borderStyle: 'solid',
          opacity: 0.8,
        }}
        handleStyle={{
          width: 14,
          height: 14,
          backgroundColor: darkThemeColors.accentBlue,
          border: `3px solid ${darkThemeColors.bgSecondary}`,
          borderRadius: 3,
          boxShadow: `0 0 0 1px ${darkThemeColors.accentBlue}, 0 0 10px ${darkThemeColors.accentBlue}80`,
        }}
        onResizeEnd={(_event, params) => {
          if (data.onChange) {
            data.onChange('width', params.width)
            data.onChange('height', params.height)
          }
        }}
      />

      {/* Edge Resize Handles — top, bottom, left, right */}
      {selected && (
        <>
          <NodeResizeControl
            position="top"
            variant={ResizeControlVariant.Handle}
            minWidth={200}
            minHeight={isCollapsed ? 40 : 60}
            maxWidth={600}
            maxHeight={800}
            style={{
              width: 14,
              height: 14,
              backgroundColor: darkThemeColors.accentBlue,
              border: `3px solid ${darkThemeColors.bgSecondary}`,
              borderRadius: 3,
              boxShadow: `0 0 0 1px ${darkThemeColors.accentBlue}, 0 0 10px ${darkThemeColors.accentBlue}80`,
            }}
            onResizeEnd={(_event: any, params: any) => {
              if (data.onChange) {
                data.onChange('width', params.width)
                data.onChange('height', params.height)
              }
            }}
          />
          <NodeResizeControl
            position="bottom"
            variant={ResizeControlVariant.Handle}
            minWidth={200}
            minHeight={isCollapsed ? 40 : 60}
            maxWidth={600}
            maxHeight={800}
            style={{
              width: 14,
              height: 14,
              backgroundColor: darkThemeColors.accentBlue,
              border: `3px solid ${darkThemeColors.bgSecondary}`,
              borderRadius: 3,
              boxShadow: `0 0 0 1px ${darkThemeColors.accentBlue}, 0 0 10px ${darkThemeColors.accentBlue}80`,
            }}
            onResizeEnd={(_event: any, params: any) => {
              if (data.onChange) {
                data.onChange('width', params.width)
                data.onChange('height', params.height)
              }
            }}
          />
          <NodeResizeControl
            position="left"
            variant={ResizeControlVariant.Handle}
            minWidth={200}
            minHeight={isCollapsed ? 40 : 60}
            maxWidth={600}
            maxHeight={800}
            style={{
              width: 14,
              height: 14,
              backgroundColor: darkThemeColors.accentBlue,
              border: `3px solid ${darkThemeColors.bgSecondary}`,
              borderRadius: 3,
              boxShadow: `0 0 0 1px ${darkThemeColors.accentBlue}, 0 0 10px ${darkThemeColors.accentBlue}80`,
            }}
            onResizeEnd={(_event: any, params: any) => {
              if (data.onChange) {
                data.onChange('width', params.width)
                data.onChange('height', params.height)
              }
            }}
          />
          <NodeResizeControl
            position="right"
            variant={ResizeControlVariant.Handle}
            minWidth={200}
            minHeight={isCollapsed ? 40 : 60}
            maxWidth={600}
            maxHeight={800}
            style={{
              width: 14,
              height: 14,
              backgroundColor: darkThemeColors.accentBlue,
              border: `3px solid ${darkThemeColors.bgSecondary}`,
              borderRadius: 3,
              boxShadow: `0 0 0 1px ${darkThemeColors.accentBlue}, 0 0 10px ${darkThemeColors.accentBlue}80`,
            }}
            onResizeEnd={(_event: any, params: any) => {
              if (data.onChange) {
                data.onChange('width', params.width)
                data.onChange('height', params.height)
              }
            }}
          />
        </>
      )}

      {/* Header */}
      <div style={headerStyle}>
        <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>

        {/* Collapse/Expand Button */}
        <button
          style={collapseBtnStyle}
          onClick={handleToggleCollapse}
          title={isCollapsed ? '展开' : '收缩'}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = darkThemeColors.bgSecondary
            e.currentTarget.style.color = darkThemeColors.textPrimary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = darkThemeColors.textSecondary
          }}
        >
          {isCollapsed ? '▶' : '▼'}
        </button>

        {/* Editable Label */}
        {isEditingLabel ? (
          <input
            ref={labelInputRef}
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={handleLabelBlur}
            onKeyDown={handleLabelKeyDown}
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              fontSize: '13px',
              fontWeight: 600,
              color: darkThemeColors.textPrimary,
              backgroundColor: darkThemeColors.bgSecondary,
              border: `1px solid ${darkThemeColors.accentBlue}`,
              borderRadius: '4px',
              padding: '2px 6px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            className="nodrag"
          />
        ) : (
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: darkThemeColors.textPrimary,
              flex: 1,
              cursor: 'text',
              userSelect: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            onDoubleClick={handleLabelDoubleClick}
            title="双击编辑节点名称"
          >
            {data.label || label}
          </span>
        )}

        {selected && (
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: darkThemeColors.accentBlue,
            flexShrink: 0,
          }} />
        )}
      </div>

      {/* Body - hidden when collapsed */}
      {!isCollapsed && (
        <>
          {/* Input Ports */}
          {inputs.length > 0 && (
            <div style={{ ...contentStyle, paddingBottom: '4px' }}>
              {inputs.map((input) => (
                <div key={input.id} style={portStyle}>
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={input.id}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: darkThemeColors.accentBlue,
                      border: '2px solid ' + darkThemeColors.bgSecondary,
                      left: '-5px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                  <span style={{ marginLeft: '12px' }}>{input.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Content / Parameters */}
          {children && (
            <div style={{ ...contentStyle, paddingTop: '8px', paddingBottom: '8px' }} className="nodrag nowheel">
              {children}
            </div>
          )}

          {/* Output Ports */}
          {outputs.length > 0 && (
            <div style={{ ...contentStyle, paddingTop: '4px' }}>
              {outputs.map((output) => (
                <div key={output.id} style={{ ...portStyle, justifyContent: 'flex-end' }}>
                  <span style={{ marginRight: '12px' }}>{output.label}</span>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={output.id}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: darkThemeColors.accentBlue,
                      border: '2px solid ' + darkThemeColors.bgSecondary,
                      right: '-5px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default BaseNode
