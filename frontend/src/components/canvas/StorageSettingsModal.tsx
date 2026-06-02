import React, { useState, useEffect, useCallback } from 'react'
import { darkThemeColors } from '../../styles/theme'
import { toast } from 'react-hot-toast'

interface StorageSettingsState {
  cacheDir: string
  cachedSize: number // bytes
  cachedFiles: number
  maxCacheSize: number // bytes
}

const STORAGE_KEY = 'kukuda_storage_settings'
const DEFAULT_MAX_CACHE = 1024 * 1024 * 1024 // 1GB

function loadStorageSettings(): StorageSettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {
    cacheDir: '/app/data/media',
    cachedSize: 235 * 1024 * 1024, // mock: 235 MB
    cachedFiles: 234,
    maxCacheSize: DEFAULT_MAX_CACHE,
  }
}

function saveStorageSettings(state: StorageSettingsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 MB'
  const mb = bytes / (1024 * 1024)
  if (mb < 1024) return `${mb.toFixed(0)} MB`
  const gb = mb / 1024
  return `${gb.toFixed(2)} GB`
}

interface StorageSettingsModalProps {
  open: boolean
  onClose: () => void
}

const StorageSettingsModal: React.FC<StorageSettingsModalProps> = ({ open, onClose }) => {
  const [state, setState] = useState<StorageSettingsState>(loadStorageSettings())
  const [dirValue, setDirValue] = useState(state.cacheDir)
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    if (open) {
      const s = loadStorageSettings()
      setState(s)
      setDirValue(s.cacheDir)
    }
  }, [open])

  const handleSaveDir = useCallback(() => {
    setSaving(true)
    const next = { ...state, cacheDir: dirValue }
    setState(next)
    saveStorageSettings(next)
    setTimeout(() => {
      setSaving(false)
      toast.success('缓存目录已保存')
    }, 300)
  }, [state, dirValue])

  const handleClearCache = useCallback(() => {
    if (!confirm('确定要清除所有缓存吗？此操作不可恢复。')) return
    setClearing(true)
    const next = { ...state, cachedSize: 0, cachedFiles: 0 }
    setState(next)
    saveStorageSettings(next)
    setTimeout(() => {
      setClearing(false)
      toast.success('缓存已清除')
    }, 500)
  }, [state])

  const cachePercent = Math.min((state.cachedSize / state.maxCacheSize) * 100, 100)

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          backgroundColor: darkThemeColors.bgPrimary,
          border: `1px solid ${darkThemeColors.border}`,
          borderRadius: '16px',
          width: 'min(520px, 92vw)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${darkThemeColors.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🖴</span>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: darkThemeColors.textPrimary,
              }}
            >
              存储与缓存设置
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: darkThemeColors.textSecondary,
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1,
              borderRadius: '6px',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            overflowY: 'auto',
          }}
        >
          {/* Cache Directory */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: darkThemeColors.textPrimary,
              }}
            >
              媒体缓存目录
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: darkThemeColors.bgSecondary,
                  border: `1px solid ${darkThemeColors.border}`,
                  borderRadius: '8px',
                  padding: '0 12px',
                  gap: '8px',
                  height: '40px',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = darkThemeColors.accentBlue + '60'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = darkThemeColors.border
                }}
              >
                <input
                  type="text"
                  value={dirValue}
                  onChange={(e) => setDirValue(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: darkThemeColors.textPrimary,
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  onClick={() => toast('文件夹选择功能开发中...')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: darkThemeColors.textSecondary,
                    fontSize: '16px',
                    cursor: 'pointer',
                    padding: '4px',
                    lineHeight: 1,
                    borderRadius: '4px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = darkThemeColors.textPrimary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = darkThemeColors.textSecondary
                  }}
                  title="选择文件夹"
                >
                  📁
                </button>
              </div>
              <button
                onClick={handleSaveDir}
                disabled={saving}
                style={{
                  padding: '8px 16px',
                  backgroundColor: darkThemeColors.accentBlue,
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  transition: 'opacity 0.15s ease',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.opacity = '0.85'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = saving ? '0.7' : '1'
                }}
              >
                ✓ {saving ? '保存中' : '保存'}
              </button>
            </div>
            <div style={{ fontSize: '11px', color: darkThemeColors.textSecondary, lineHeight: 1.5 }}>
              AI 生成的图片和视频将缓存到此目录，防止外部 URL 过期
            </div>
          </div>

          {/* Cache Usage Card */}
          <div
            style={{
              backgroundColor: darkThemeColors.bgSecondary,
              border: `1px solid ${darkThemeColors.border}`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: darkThemeColors.textPrimary }}>
                缓存使用情况
              </span>
              <button
                onClick={handleClearCache}
                disabled={clearing || state.cachedSize === 0}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${darkThemeColors.accentRed}`,
                  borderRadius: '6px',
                  color: darkThemeColors.accentRed,
                  fontSize: '12px',
                  cursor: clearing || state.cachedSize === 0 ? 'not-allowed' : 'pointer',
                  opacity: state.cachedSize === 0 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (state.cachedSize > 0 && !clearing) {
                    e.currentTarget.style.backgroundColor = 'rgba(244,67,54,0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                🗑️ {clearing ? '清除中' : '清除缓存'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <span style={{ color: darkThemeColors.textSecondary }}>已缓存：</span>
              <span style={{ color: darkThemeColors.accentBlue, fontWeight: 600 }}>
                {formatBytes(state.cachedSize)}
              </span>
              <span style={{ color: darkThemeColors.textSecondary }}>
                ({state.cachedFiles} 个文件)
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: darkThemeColors.bgPrimary,
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${cachePercent}%`,
                    height: '100%',
                    backgroundColor: cachePercent > 80 ? darkThemeColors.accentRed : darkThemeColors.accentBlue,
                    borderRadius: '3px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: darkThemeColors.textSecondary }}>
                <span>0 GB</span>
                <span>{formatBytes(state.maxCacheSize)}</span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div
            style={{
              backgroundColor: `${darkThemeColors.accentBlue}10`,
              border: `1px solid ${darkThemeColors.accentBlue}30`,
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>ℹ️</span>
            <div style={{ fontSize: '12px', color: darkThemeColors.textSecondary, lineHeight: 1.6 }}>
              <span style={{ color: darkThemeColors.accentBlue, fontWeight: 600 }}>使用说明：</span>
              <br />
              AI 生成的图片和视频会自动缓存到服务端指定目录，防止外部 CDN 链接过期。缓存的文件永久保存，不受外部链接时效限制。如磁盘空间不足，可点击「清除缓存」释放空间。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StorageSettingsModal
