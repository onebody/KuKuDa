import React, { useState } from 'react'
import { NodeType } from '../../types/workflow'
import { darkThemeColors } from '../../styles/theme'

interface NodeLibraryProps {
  isOpen: boolean
  onClose: () => void
  onDragStart: (event: React.DragEvent, nodeType: string) => void
}

interface NodeItem {
  type: string
  label: string
  icon: string
  description?: string
}

interface NodeCategory {
  name: string
  nodes: NodeItem[]
}

const nodeCategories: NodeCategory[] = [
  {
    name: '输入节点',
    nodes: [
      { type: 'TEXT_INPUT', label: '文本输入', icon: '📝', description: '输入文本内容' },
      { type: 'IMAGE_INPUT', label: '图片输入', icon: '🖼️', description: '输入图片' },
      { type: 'FILE_INPUT', label: '文件输入', icon: '📁', description: '上传文件' },
    ],
  },
  {
    name: 'AI 模型',
    nodes: [
      { type: 'AI_IMAGE', label: 'AI绘图', icon: '🎨', description: 'AI生成图片，支持多种模型和参数配置' },
    ],
  },
]

const NodeLibrary: React.FC<NodeLibraryProps> = ({ isOpen, onClose, onDragStart }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(nodeCategories.map((cat) => cat.name))
  )

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryName)) {
        next.delete(categoryName)
      } else {
        next.add(categoryName)
      }
      return next
    })
  }

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
    onDragStart(event, nodeType)
  }

  const filteredCategories = searchQuery
    ? nodeCategories
        .map((category) => ({
          ...category,
          nodes: category.nodes.filter(
            (node) =>
              node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              node.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (node.description && node.description.includes(searchQuery))
          ),
        }))
        .filter((category) => category.nodes.length > 0)
    : nodeCategories

  if (!isOpen) return null

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    left: '56px',
    top: 0,
    width: '280px',
    height: '100%',
    backgroundColor: darkThemeColors.bgSecondary,
    borderRight: `1px solid ${darkThemeColors.border}`,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 20,
    boxShadow: '4px 0 12px rgba(0,0,0,0.3)',
  }

  const headerStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: `1px solid ${darkThemeColors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const searchInputStyle: React.CSSProperties = {
    margin: '12px 16px',
    padding: '8px 12px',
    backgroundColor: darkThemeColors.bgTertiary,
    border: `1px solid ${darkThemeColors.border}`,
    borderRadius: '6px',
    color: darkThemeColors.textPrimary,
    fontSize: '13px',
    outline: 'none',
    width: 'calc(100% - 32px)',
    boxSizing: 'border-box',
  }

  const nodeItemStyle: React.CSSProperties = {
    padding: '10px 16px',
    margin: '4px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: darkThemeColors.textPrimary,
    fontSize: '13px',
    transition: 'all 0.2s ease',
  }

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: darkThemeColors.textPrimary }}>
          节点库
        </span>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: darkThemeColors.textSecondary,
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
            e.currentTarget.style.color = darkThemeColors.textPrimary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = darkThemeColors.textSecondary
          }}
        >
          ✕
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="搜索节点..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={searchInputStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = darkThemeColors.accentBlue
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = darkThemeColors.border
        }}
      />

      {/* Node Categories */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {filteredCategories.map((category) => (
          <div key={category.name} style={{ marginBottom: '8px' }}>
            {/* Category Header */}
            <div
              onClick={() => toggleCategory(category.name)}
              style={{
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: 600,
                color: darkThemeColors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{
                transition: 'transform 0.2s ease',
                display: 'inline-block',
                transform: expandedCategories.has(category.name) ? 'rotate(90deg)' : 'rotate(0deg)',
              }}>
                ▶
              </span>
              {category.name}
            </div>

            {/* Category Nodes */}
            {expandedCategories.has(category.name) && (
              <div>
                {category.nodes.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type)}
                    style={nodeItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    title={node.description}
                  >
                    <span style={{ fontSize: '20px' }}>{node.icon}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px' }}>{node.label}</span>
                      {node.description && (
                        <span style={{ fontSize: '11px', color: darkThemeColors.textSecondary }}>
                          {node.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default NodeLibrary
