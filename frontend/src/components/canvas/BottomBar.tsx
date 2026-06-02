import React from 'react'
import { darkThemeColors } from '../../styles/theme'

interface BottomBarProps {
  shortcuts?: Array<{
    keys: string
    description: string
  }>
  onSave?: () => Promise<void>
  onDelete?: () => void
  onUndo?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFitView?: () => void
  onAutoLayout?: () => void
  onToggleGrid?: () => void
  onDownload?: () => void
}

const defaultShortcuts = [
  { keys: '双击', description: '添加节点' },
  { keys: 'Ctrl+Z', description: '撤销' },
  { keys: 'Ctrl+S', description: '保存' },
  { keys: 'Delete', description: '删除' },
  { keys: '滚轮', description: '缩放' },
  { keys: '空格+拖拽', description: '平移' },
  { keys: 'Shift+点击', description: '多选' },
]

const BottomBar: React.FC<BottomBarProps> = ({ 
  shortcuts = defaultShortcuts,
  onSave,
  onDelete,
  onUndo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onAutoLayout,
  onToggleGrid,
  onDownload,
}) => {
  const bottomBarStyle: React.CSSProperties = {
    height: '32px',
    backgroundColor: darkThemeColors.bgSecondary,
    borderTop: `1px solid ${darkThemeColors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 16px',
    position: 'relative',
    zIndex: 10,
  }

  const shortcutStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: darkThemeColors.textSecondary,
    padding: '2px 6px',
    borderRadius: '3px',
    cursor: 'default',
    transition: 'background-color 0.15s ease',
  }

  const keyBadgeStyle: React.CSSProperties = {
    backgroundColor: darkThemeColors.bgTertiary,
    color: darkThemeColors.textPrimary,
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '10px',
    fontFamily: 'monospace',
    fontWeight: 600,
  }

  const separatorStyle: React.CSSProperties = {
    color: darkThemeColors.border,
    margin: '0 8px',
    fontSize: '10px',
  }

  // Helper: get onClick handler for a shortcut
  const getShortcutHandler = (description: string) => {
    if (description === '保存' && onSave) return onSave
    if (description === '删除' && onDelete) return onDelete
    if (description === '撤销' && onUndo) return onUndo
    if (description === '缩放') {
      // 缩放需要通过按钮触发，这里可以提供放大/缩小
      // 但快捷键提示是"滚轮"，点击时可以触发放大
      if (onZoomIn) return onZoomIn
    }
    return undefined
  }

  return (
    <div style={bottomBarStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        {shortcuts.map((shortcut, index) => {
          const handler = getShortcutHandler(shortcut.description)
          const isClickable = !!handler
          
          return (
            <React.Fragment key={shortcut.keys}>
              <div 
                style={{
                  ...shortcutStyle,
                  cursor: isClickable ? 'pointer' : 'default',
                  ...(isClickable ? {
                    ':hover': {
                      backgroundColor: darkThemeColors.bgTertiary,
                    }
                  } : {})
                }}
                onClick={handler}
                onMouseEnter={(e) => {
                  if (isClickable) {
                    e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
                  }
                }}
                onMouseLeave={(e) => {
                  if (isClickable) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <span style={keyBadgeStyle}>{shortcut.keys}</span>
                <span>{shortcut.description}</span>
              </div>
              {index < shortcuts.length - 1 && (
                <span style={separatorStyle}>|</span>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default BottomBar
