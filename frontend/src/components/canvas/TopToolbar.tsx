import React, { useState, useEffect, useRef } from 'react'
import { darkThemeColors } from '../../styles/theme'
import Tooltip from '@mui/material/Tooltip'
import { useAuthStore } from '../../stores/authStore'
import { toast } from 'react-hot-toast'

interface TopToolbarProps {
  projectName: string
  onProjectNameChange: (name: string) => void
  isSavingName?: boolean
  zoomLevel: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onArrange: (type: string) => void
  showGrid: boolean
  onToggleGrid: () => void
  onDownload: () => void
  onSave?: () => void
  onClearCanvas?: () => void
  onLogout?: () => void
  onOpenApiSettings?: () => void
  onOpenStorageSettings?: () => void
  onBack?: () => void
}

const TopToolbar: React.FC<TopToolbarProps> = ({
  projectName,
  onProjectNameChange,
  isSavingName,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onFitView,
  onArrange,
  showGrid,
  onToggleGrid,
  onDownload,
  onSave,
  onClearCanvas,
  onLogout,
  onOpenApiSettings,
  onBack,
}) => {
  const [isEditingName, setIsEditingName] = useState(false)
  const [mcpStatus, setMcpStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected')
  const [arrangeMenuOpen, setArrangeMenuOpen] = useState(false)
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)
  const arrangeMenuRef = useRef<HTMLDivElement>(null)
  const settingsMenuRef = useRef<HTMLDivElement>(null)

  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const toolbarStyle: React.CSSProperties = {
    height: '48px',
    backgroundColor: darkThemeColors.bgSecondary,
    borderBottom: `1px solid ${darkThemeColors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    position: 'relative',
    zIndex: 10,
  }

  const leftSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  }

  const centerSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  }

  const rightSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: darkThemeColors.textSecondary,
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'inherit',
  }

  const buttonHoverStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: darkThemeColors.bgTertiary,
    color: darkThemeColors.textPrimary,
  }

  const iconButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: darkThemeColors.textSecondary,
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  }

  const menuItemStyle: React.CSSProperties = {
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: '13px',
    color: darkThemeColors.textPrimary,
    whiteSpace: 'nowrap',
    transition: 'background-color 0.15s ease',
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (arrangeMenuRef.current && !arrangeMenuRef.current.contains(e.target as Node)) {
        setArrangeMenuOpen(false)
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setSettingsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const arrangeItems = [
    { key: 'grid', label: '网格排列' },
    { key: 'alignLeft', label: '左对齐' },
    { key: 'alignTop', label: '顶部对齐' },
    { key: 'alignCenter', label: '居中对齐' },
    { key: 'distributeHorizontal', label: '水平等距' },
    { key: 'distributeVertical', label: '垂直等距' },
  ]

  return (
    <div style={toolbarStyle}>
      {/* Left Section: Back Button + MCP Status + Project Name */}
      <div style={leftSectionStyle}>
        {/* Back to Home */}
        <Tooltip title="返回主页" placement="bottom">
          <button
            style={iconButtonStyle}
            onClick={onBack}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
              e.currentTarget.style.color = darkThemeColors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = darkThemeColors.textSecondary
            }}
          >
            ←
          </button>
        </Tooltip>

        {/* MCP Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: mcpStatus === 'connected' ? darkThemeColors.accentGreen : 
                             mcpStatus === 'connecting' ? darkThemeColors.accentYellow : 
                             darkThemeColors.accentRed,
              boxShadow: mcpStatus === 'connected' ? `0 0 8px ${darkThemeColors.accentGreen}` : 'none',
            }}
          />
          <span style={{ fontSize: '12px', color: darkThemeColors.textSecondary }}>
            MCP {mcpStatus === 'connected' ? '已就绪' : mcpStatus === 'connecting' ? '连接中...' : '未连接'}
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: darkThemeColors.border }} />

        {/* Saving / Success indicator */}
        {isSavingName !== undefined && isSavingName === true && (
          <div
            style={{
              width: '14px',
              height: '14px',
              border: `2px solid ${darkThemeColors.border}`,
              borderTopColor: darkThemeColors.accentBlue,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
            title="正在保存..."
          />
        )}

        {/* Project Name Input */}
        {isEditingName ? (
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setIsEditingName(false)
            }}
            autoFocus
            style={{
              backgroundColor: darkThemeColors.bgTertiary,
              border: `1px solid ${darkThemeColors.accentBlue}`,
              borderRadius: '4px',
              color: darkThemeColors.textPrimary,
              fontSize: '14px',
              padding: '4px 8px',
              outline: 'none',
              width: '200px',
            }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              onClick={() => setIsEditingName(true)}
              style={{
                cursor: 'pointer',
                color: darkThemeColors.textPrimary,
                fontSize: '14px',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {projectName || '未命名项目'}
            </div>
            {/* Saving indicator */}
            {isSavingName && (
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  border: `2px solid ${darkThemeColors.border}`,
                  borderTopColor: darkThemeColors.accentBlue,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Center Section: Template Library, Asset Library, Cloud ComfyUI */}
      <div style={centerSectionStyle}>
        <button
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
            e.currentTarget.style.color = darkThemeColors.textPrimary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = darkThemeColors.textSecondary
          }}
          title="模板库"
        >
          📚 模板库
        </button>

        <button
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
            e.currentTarget.style.color = darkThemeColors.textPrimary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = darkThemeColors.textSecondary
          }}
          title="资产库"
        >
          📦 资产库
        </button>

        <button
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
            e.currentTarget.style.color = darkThemeColors.textPrimary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = darkThemeColors.textSecondary
          }}
          title="云端 ComfyUI"
        >
          ☁️ 云端 ComfyUI
        </button>
      </div>

      {/* Right Section: Zoom, Download, Grid, Navigation, Arrange, Settings */}
      <div style={rightSectionStyle}>
        {/* Save Button */}
        <Tooltip title="保存工作流" placement="bottom">
          <button
            style={{
              ...buttonStyle,
              backgroundColor: darkThemeColors.accentBlue,
              color: 'white',
              padding: '6px 16px',
            }}
            onClick={onSave}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkThemeColors.accentBlue + 'dd'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = darkThemeColors.accentBlue
            }}
          >
            💾 保存
          </button>
        </Tooltip>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: darkThemeColors.border }} />
        {/* Zoom Level Display */}
        <div
          style={{
            color: darkThemeColors.textSecondary,
            fontSize: '12px',
            padding: '4px 8px',
            backgroundColor: darkThemeColors.bgTertiary,
            borderRadius: '4px',
            minWidth: '48px',
            textAlign: 'center',
          }}
        >
          {Math.round(zoomLevel * 100)}%
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: darkThemeColors.border }} />

        {/* Download Button */}
        <Tooltip title="下载工作流" placement="bottom">
          <button
            style={iconButtonStyle}
            onClick={onDownload}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
              e.currentTarget.style.color = darkThemeColors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = darkThemeColors.textSecondary
            }}
          >
            ⬇️
          </button>
        </Tooltip>

        {/* Grid Toggle */}
        <Tooltip title={showGrid ? '隐藏网格' : '显示网格'} placement="bottom">
          <button
            style={{
              ...iconButtonStyle,
              color: showGrid ? darkThemeColors.accentBlue : darkThemeColors.textSecondary,
            }}
            onClick={onToggleGrid}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
              e.currentTarget.style.color = showGrid ? darkThemeColors.accentBlue : darkThemeColors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = showGrid ? darkThemeColors.accentBlue : darkThemeColors.textSecondary
            }}
          >
            ⊞
          </button>
        </Tooltip>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: darkThemeColors.border }} />

        {/* Navigation Buttons */}
        <Tooltip title="适应视图" placement="bottom">
          <button
            style={iconButtonStyle}
            onClick={onFitView}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
              e.currentTarget.style.color = darkThemeColors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = darkThemeColors.textSecondary
            }}
          >
            ⊡
          </button>
        </Tooltip>

        {/* Arrange dropdown */}
        <div style={{ position: 'relative' }} ref={arrangeMenuRef}>
          <Tooltip title="整理布局" placement="bottom">
            <button
              style={{
                ...iconButtonStyle,
                color: arrangeMenuOpen ? darkThemeColors.accentBlue : darkThemeColors.textSecondary,
              }}
              onClick={() => setArrangeMenuOpen(!arrangeMenuOpen)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
                e.currentTarget.style.color = arrangeMenuOpen ? darkThemeColors.accentBlue : darkThemeColors.textPrimary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = arrangeMenuOpen ? darkThemeColors.accentBlue : darkThemeColors.textSecondary
              }}
            >
              ⊟
            </button>
          </Tooltip>

          {arrangeMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                backgroundColor: darkThemeColors.bgSecondary,
                border: `1px solid ${darkThemeColors.border}`,
                borderRadius: '8px',
                padding: '4px 0',
                minWidth: '140px',
                zIndex: 1000,
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              }}
            >
              {arrangeItems.map((item) => (
                <div
                  key={item.key}
                  style={menuItemStyle}
                  onClick={() => {
                    onArrange(item.key)
                    setArrangeMenuOpen(false)
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings Dropdown */}
        <div style={{ position: 'relative' }} ref={settingsMenuRef}>
          <Tooltip title="设置" placement="bottom">
            <button
              style={{
                ...iconButtonStyle,
                color: settingsMenuOpen ? darkThemeColors.accentBlue : darkThemeColors.textSecondary,
              }}
              onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
                e.currentTarget.style.color = settingsMenuOpen ? darkThemeColors.accentBlue : darkThemeColors.textPrimary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = settingsMenuOpen ? darkThemeColors.accentBlue : darkThemeColors.textSecondary
              }}
            >
              ⚙️
            </button>
          </Tooltip>

          {settingsMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                backgroundColor: darkThemeColors.bgSecondary,
                border: `1px solid ${darkThemeColors.border}`,
                borderRadius: '10px',
                padding: '8px 0',
                minWidth: '220px',
                zIndex: 1000,
                boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
              }}
            >
              {/* User Info */}
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: darkThemeColors.accentBlue,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: 'white',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {user?.name?.charAt(0) || user?.phone?.charAt(0) || 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: darkThemeColors.textPrimary }}>
                    {isAuthenticated && user?.phone
                      ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
                      : '未登录'}
                  </div>
                  <div style={{ fontSize: '11px', color: darkThemeColors.accentGreen, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: darkThemeColors.accentGreen }} />
                    永久会员
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: darkThemeColors.border, margin: '6px 12px' }} />

              {/* Settings items */}
              <div
                style={menuItemStyle}
                onClick={() => { setSettingsMenuOpen(false); toast('切换亮色功能开发中...') }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span style={{ marginRight: '10px', fontSize: '15px' }}>☀️</span>
                切换亮色
              </div>
              <div
                style={menuItemStyle}
                onClick={() => { setSettingsMenuOpen(false); toast('无边框模式开发中...') }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span style={{ marginRight: '10px', fontSize: '15px' }}>👁️</span>
                无边框模式
              </div>
              <div
                style={menuItemStyle}
                onClick={() => { setSettingsMenuOpen(false); toast('存储设置功能开发中...') }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span style={{ marginRight: '10px', fontSize: '15px' }}>💾</span>
                存储设置
              </div>
              <div
                style={menuItemStyle}
                onClick={() => { setSettingsMenuOpen(false); onOpenApiSettings?.() }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span style={{ marginRight: '10px', fontSize: '15px' }}>⚙️</span>
                API 设置
              </div>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: darkThemeColors.border, margin: '6px 12px' }} />

              {/* Danger zone */}
              <div
                style={{
                  ...menuItemStyle,
                  color: darkThemeColors.accentRed,
                }}
                onClick={() => {
                  setSettingsMenuOpen(false)
                  if (onClearCanvas) onClearCanvas()
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(244,67,54,0.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span style={{ marginRight: '10px', fontSize: '15px' }}>🗑️</span>
                清空画布
              </div>
              <div
                style={{
                  ...menuItemStyle,
                  color: darkThemeColors.accentRed,
                }}
                onClick={() => {
                  setSettingsMenuOpen(false)
                  if (onLogout) onLogout()
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(244,67,54,0.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span style={{ marginRight: '10px', fontSize: '15px' }}>🚪</span>
                退出登录
              </div>

              {/* Version */}
              <div style={{ padding: '8px 16px 0', textAlign: 'center', fontSize: '11px', color: darkThemeColors.textSecondary }}>
                网页版 v2.2.8
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopToolbar
