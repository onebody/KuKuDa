import React, { useState } from 'react'
import { darkThemeColors } from '../../styles/theme'
import Tooltip from '@mui/material/Tooltip'

interface LeftSidebarProps {
  activePanel: string | null
  onPanelChange: (panel: string | null) => void
}

interface SidebarIcon {
  id: string
  icon: string
  label: string
}

const sidebarIcons: SidebarIcon[] = [
  { id: 'search', icon: '🔍', label: '搜索' },
  { id: 'history', icon: '⏱️', label: '历史' },
  { id: 'nodes', icon: '📦', label: '节点' },
  { id: 'files', icon: '📁', label: '文件' },
  { id: 'ai', icon: '🤖', label: 'AI' },
  { id: 'upload', icon: '📤', label: '上传' },
  { id: 'view', icon: '👁️', label: '视图' },
]

const LeftSidebar: React.FC<LeftSidebarProps> = ({ activePanel, onPanelChange }) => {
  const sidebarStyle: React.CSSProperties = {
    width: '56px',
    backgroundColor: darkThemeColors.bgSecondary,
    borderRight: `1px solid ${darkThemeColors.border}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 0',
    gap: '4px',
    position: 'relative',
    zIndex: 10,
  }

  const iconButtonStyle = (isActive: boolean): React.CSSProperties => ({
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: isActive ? darkThemeColors.bgTertiary : 'transparent',
    color: isActive ? darkThemeColors.textPrimary : darkThemeColors.textSecondary,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    transition: 'all 0.2s ease',
    position: 'relative',
  })

  const handleIconClick = (iconId: string) => {
    if (activePanel === iconId) {
      onPanelChange(null) // Toggle off
    } else {
      onPanelChange(iconId)
    }
  }

  return (
    <div style={sidebarStyle}>
      {sidebarIcons.map((item) => {
        const isActive = activePanel === item.id
        
        return (
          <Tooltip
            key={item.id}
            title={item.label}
            placement="right"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: darkThemeColors.bgTertiary,
                  color: darkThemeColors.textPrimary,
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  '& .MuiTooltip-arrow': {
                    color: darkThemeColors.bgTertiary,
                  },
                },
              },
            }}
          >
            <button
              data-test-id={item.id}
              style={iconButtonStyle(isActive)}
              onClick={() => handleIconClick(item.id)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
                  e.currentTarget.style.color = darkThemeColors.textPrimary
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = darkThemeColors.textSecondary
                }
              }}
            >
              {item.icon}
            </button>
          </Tooltip>
        )
      })}

      {/* Bottom spacer to push content to top */}
      <div style={{ flex: 1 }} />

      {/* Settings at bottom */}
      <Tooltip
        title="设置"
        placement="right"
        arrow
        componentsProps={{
          tooltip: {
            sx: {
              backgroundColor: darkThemeColors.bgTertiary,
              color: darkThemeColors.textPrimary,
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              '& .MuiTooltip-arrow': {
                color: darkThemeColors.bgTertiary,
              },
            },
          },
        }}
      >
        <button
          style={iconButtonStyle(false)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
            e.currentTarget.style.color = darkThemeColors.textPrimary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = darkThemeColors.textSecondary
          }}
        >
          ⚙️
        </button>
      </Tooltip>
    </div>
  )
}

export default LeftSidebar
