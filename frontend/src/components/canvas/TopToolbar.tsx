import React, { useState, useEffect, useRef } from 'react'
import { darkThemeColors } from '../../styles/theme'
import Tooltip from '@mui/material/Tooltip'
import { useAuthStore } from '../../stores/authStore'
import { toast } from 'react-hot-toast'
import { workflowService } from '../../services/workflowService'

interface TopToolbarProps {
  projectName: string
  onProjectNameChange: (name: string) => void
  isSavingName?: boolean
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
  onBack?: () => void
  workflowId?: string
}

const TopToolbar: React.FC<TopToolbarProps> = ({
  projectName,
  onProjectNameChange,
  isSavingName,
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
  workflowId,
}) => {
  const [isEditingName, setIsEditingName] = useState(false)
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const settingsMenuRef = useRef<HTMLDivElement>(null)

  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Track save status
  useEffect(() => {
    if (isSavingName) {
      setSaveStatus('saving')
    } else {
      const timer = setTimeout(() => setSaveStatus('saved'), 500)
      return () => clearTimeout(timer)
    }
  }, [isSavingName])

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
    gap: '12px',
  }

  const rightSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
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
    fontSize: '15px',
    transition: 'all 0.15s ease',
  }

  const primaryButtonStyle: React.CSSProperties = {
    backgroundColor: darkThemeColors.accentBlue,
    color: 'white',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  }

  const menuItemStyle: React.CSSProperties = {
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: '13px',
    color: darkThemeColors.textPrimary,
    whiteSpace: 'nowrap',
    transition: 'background-color 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    height: '20px',
    backgroundColor: darkThemeColors.border,
    margin: '0 4px',
  }

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setSettingsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleRunWorkflow = async () => {
    if (!workflowId || workflowId === 'new') {
      toast.error('请先保存工作流')
      return
    }
    setIsRunning(true)
    try {
      const result = await workflowService.executeWorkflow(workflowId)
      if (result.code === 0) {
        toast.success('工作流执行已启动')
      } else {
        toast.error(result.message || '执行失败')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || '执行工作流失败')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div style={toolbarStyle}>
      {/* Left Section: Back + Project Name + Save Status */}
      <div style={leftSectionStyle}>
        {/* Back to Home */}
        <Tooltip title="返回主页 (Esc)" placement="bottom">
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

        <div style={dividerStyle} />

        {/* Project Name */}
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
              fontFamily: 'inherit',
            }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              onClick={() => setIsEditingName(true)}
              style={{
                cursor: 'pointer',
                color: darkThemeColors.textPrimary,
                fontSize: '14px',
                fontWeight: 500,
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              title="点击编辑名称"
            >
              {projectName || '未命名项目'}
            </div>
            {/* Save status indicator */}
            <span
              style={{
                fontSize: '11px',
                color: saveStatus === 'saving'
                  ? darkThemeColors.accentBlue
                  : saveStatus === 'unsaved'
                  ? darkThemeColors.accentYellow
                  : darkThemeColors.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {saveStatus === 'saving' && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    border: `2px solid ${darkThemeColors.border}`,
                    borderTopColor: darkThemeColors.accentBlue,
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
              )}
              {saveStatus === 'saving' ? '保存中...' : saveStatus === 'saved' ? '已保存' : '未保存'}
            </span>
          </div>
        )}
      </div>

      {/* Right Section: All Controls */}
      <div style={rightSectionStyle}>
        {/* ── Run Button ── */}
        <Tooltip title="运行工作流" placement="bottom">
          <button
            style={{
              ...primaryButtonStyle,
              opacity: isRunning ? 0.7 : 1,
              cursor: isRunning ? 'not-allowed' : 'pointer',
            }}
            onClick={handleRunWorkflow}
            disabled={isRunning}
            onMouseEnter={(e) => {
              if (!isRunning) e.currentTarget.style.backgroundColor = darkThemeColors.accentBlue + 'dd'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = darkThemeColors.accentBlue
            }}
          >
            {isRunning ? (
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
            ) : (
              '▶'
            )}
            运行
          </button>
        </Tooltip>

        <div style={dividerStyle} />

        {/* Save */}
        <Tooltip title="保存工作流 (Ctrl+S)" placement="bottom">
          <button
            style={iconButtonStyle}
            onClick={() => onSave?.()}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
              e.currentTarget.style.color = darkThemeColors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = darkThemeColors.textSecondary
            }}
          >
            💾
          </button>
        </Tooltip>

        {/* Export */}
        <Tooltip title="导出工作流图片 (PNG)" placement="bottom">
          <button
            style={iconButtonStyle}
            onClick={() => onDownload?.()}
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

        {/* Fit View */}
        <Tooltip title="适应视图" placement="bottom">
          <button
            style={iconButtonStyle}
            onClick={() => onFitView?.()}
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

        <div style={dividerStyle} />

        {/* ── Account / Settings ── */}
        <div style={{ position: 'relative' }} ref={settingsMenuRef}>
          <Tooltip title="设置" placement="bottom">
            <button
              style={{
                ...iconButtonStyle,
                width: 'auto',
                padding: '0 8px',
                gap: '6px',
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
              {/* User avatar */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: darkThemeColors.accentBlue,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                {user?.name?.charAt(0) || user?.phone?.charAt(0) || 'U'}
              </div>
              <span style={{ fontSize: '12px' }}>▼</span>
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
                minWidth: '200px',
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
                <span style={{ fontSize: '15px' }}>☀️</span>
                切换亮色
              </div>
              <div
                style={menuItemStyle}
                onClick={() => { setSettingsMenuOpen(false); toast('无边框模式开发中...') }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span style={{ fontSize: '15px' }}>👁️</span>
                无边框模式
              </div>
              <div
                style={menuItemStyle}
                onClick={() => { setSettingsMenuOpen(false); toast('存储设置功能开发中...') }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span style={{ fontSize: '15px' }}>💾</span>
                存储设置
              </div>
              <div
                style={menuItemStyle}
                onClick={() => { setSettingsMenuOpen(false); onOpenApiSettings?.() }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span style={{ fontSize: '15px' }}>⚙️</span>
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
                  if (onLogout) onLogout()
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(244,67,54,0.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span style={{ fontSize: '15px' }}>🚪</span>
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
