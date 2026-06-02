import React, { useState, useEffect, useCallback } from 'react'
import { darkThemeColors } from '../../styles/theme'
import { toast } from 'react-hot-toast'

// ── Types ─────────────────────────────────────────────────────────────

export interface KuKuDaApiConfig {
  url: string
  key: string
}

export interface ComflyConfig {
  url: string
  key: string
}

export interface Ai6800Config {
  imageUrl: string
  videoUrl: string
  key: string
}

export interface ApiSettingsState {
  kukuda: KuKuDaApiConfig
  comfly: ComflyConfig
  ai6800: Ai6800Config
}

const STORAGE_KEY = 'workflow_api_settings'

const defaultState: ApiSettingsState = {
  kukuda: {
    url: 'https://nywh.top',
    key: '',
  },
  comfly: {
    url: 'https://ai.comfly.chat',
    key: '',
  },
  ai6800: {
    imageUrl: 'https://api.ai6800.com',
    videoUrl: 'https://api.lk888.ai',
    key: '',
  },
}

// ── Persistence helpers ───────────────────────────────────────────────────

export function loadApiSettings(): ApiSettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Migrate old "kaka" key → "kukuda"
      const migrated: any = { ...parsed }
      if (parsed.kaka && !parsed.kukuda) {
        migrated.kukuda = parsed.kaka
        delete migrated.kaka
      }
      return {
        kukuda: { ...defaultState.kukuda, ...migrated.kukuda },
        comfly: { ...defaultState.comfly, ...migrated.comfly },
        ai6800: { ...defaultState.ai6800, ...migrated.ai6800 },
      }
    }
  } catch {
    // ignore
  }
  return { ...defaultState }
}

export function saveApiSettings(settings: ApiSettingsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function clearApiSettings() {
  localStorage.removeItem(STORAGE_KEY)
}

// ── Eye icon component ─────────────────────────────────────────────────

const EyeIcon: React.FC<{ visible: boolean; onClick: () => void }> = ({
  visible,
  onClick,
}) => (
  <span
    onClick={onClick}
    style={{
      cursor: 'pointer',
      fontSize: '14px',
      color: darkThemeColors.textSecondary,
      userSelect: 'none',
      padding: '0 4px',
      transition: 'color 0.15s ease',
    }}
    onMouseEnter={(e) => {
      ;(e.target as HTMLElement).style.color = darkThemeColors.textPrimary
    }}
    onMouseLeave={(e) => {
      ;(e.target as HTMLElement).style.color = darkThemeColors.textSecondary
    }}
    title={visible ? '隐藏' : '显示'}
  >
    {visible ? '👁️' : '🙈'}
  </span>
)

// ── Provider Card component ────────────────────────────────────────────

interface ProviderCardProps {
  title: string
  icon: string
  badge?: string
  description?: string
  children: React.ReactNode
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  title,
  icon,
  badge,
  description,
  children,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#181825',
        border: `1px solid ${darkThemeColors.border}`,
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: darkThemeColors.textPrimary,
          }}
        >
          {title}
        </span>
        {badge && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '10px',
              backgroundColor: `${darkThemeColors.accentBlue}20`,
              color: darkThemeColors.accentBlue,
              border: `1px solid ${darkThemeColors.accentBlue}40`,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
      </div>

      {/* Description */}
      {description && (
        <div
          style={{
            fontSize: '11px',
            color: darkThemeColors.accentBlue,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      )}
    </div>
  )
}

// ── Labeled Input component ──────────────────────────────────────────

interface LabeledInputProps {
  label: string
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'password'
  placeholder?: string
  suffixNote?: string
}

const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  suffixNote,
}) => {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password' || label.includes('Key')
  const inputType = isPassword && !visible ? 'password' : 'text'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <label
          style={{
            fontSize: '12px',
            color: darkThemeColors.textSecondary,
            fontWeight: 500,
          }}
        >
          {label}
        </label>
        {suffixNote && (
          <span
            style={{
              fontSize: '11px',
              color: darkThemeColors.textSecondary,
            }}
          >
            {suffixNote}
          </span>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#252540',
          border: `1px solid ${darkThemeColors.border}`,
          borderRadius: '6px',
          padding: '0 10px',
          gap: '6px',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={() => {}}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.borderColor =
            darkThemeColors.accentBlue + '60'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.borderColor =
            darkThemeColors.border
        }}
      >
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            color: darkThemeColors.textPrimary,
            fontSize: '13px',
            padding: '9px 0',
            outline: 'none',
            fontFamily: 'monospace',
          }}
        />
        {isPassword && <EyeIcon visible={visible} onClick={() => setVisible(!visible)} />}
      </div>
    </div>
  )
}

// ── Main Modal ────────────────────────────────────────────────────────

interface ApiSettingsModalProps {
  open: boolean
  onClose: () => void
}

const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ open, onClose }) => {
  const [settings, setSettings] = useState<ApiSettingsState>(loadApiSettings())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setSettings(loadApiSettings())
    }
  }, [open])

  const updateKuKuDa = useCallback(
    (patch: Partial<KuKuDaApiConfig>) =>
      setSettings((prev) => ({ ...prev, kukuda: { ...prev.kukuda, ...patch } })),
    []
  )
  const updateComfly = useCallback(
    (patch: Partial<ComflyConfig>) =>
      setSettings((prev) => ({ ...prev, comfly: { ...prev.comfly, ...patch } })),
    []
  )
  const updateAi6800 = useCallback(
    (patch: Partial<Ai6800Config>) =>
      setSettings((prev) => ({ ...prev, ai6800: { ...prev.ai6800, ...patch } })),
    []
  )

  const handleSave = useCallback(() => {
    setSaving(true)
    saveApiSettings(settings)
    setTimeout(() => {
      setSaving(false)
      toast.success('API 配置已保存')
      onClose()
    }, 300)
  }, [settings, onClose])

  const handleClearAll = useCallback(() => {
    if (!confirm('确定要清空所有 API 配置吗？此操作不可恢复。')) return
    setSettings({ ...defaultState })
    clearApiSettings()
    toast.success('所有 API 配置已清空')
  }, [])

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
          width: 'min(900px, 92vw)',
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
            <span style={{ fontSize: '18px' }}>☁️</span>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: darkThemeColors.textPrimary,
              }}
            >
              API 设置与模型配置
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
              lineHeight: 1,
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'background-color 0.15s, color 0.15s',
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

        {/* Body - scrollable */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {/* KuKuDa-API */}
          <ProviderCard
            title="KuKuDa-API"
            icon="🧩"
            badge="首选通道"
            description="🚀 官方推荐：速度最快、稳定性最高的首选提供商。"
          >
            <LabeledInput
              label="API 地址"
              value={settings.kukuda.url}
              onChange={(v) => updateKuKuDa({ url: v })}
              placeholder="https://..."
            />
            <LabeledInput
              label="API Key"
              value={settings.kukuda.key}
              onChange={(v) => updateKuKuDa({ key: v })}
              type="password"
              placeholder="sk-xxxxxxxxxxxxxxxx"
            />
            <button
              onClick={() => {
                updateKuKuDa({ url: defaultState.kukuda.url, key: '' })
                toast.success('KuKuDa-API 配置已清空')
              }}
              style={{
                width: '100%',
                padding: '8px 0',
                backgroundColor: 'transparent',
                border: `1px solid ${darkThemeColors.border}`,
                borderRadius: '6px',
                color: darkThemeColors.textSecondary,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = darkThemeColors.accentRed
                e.currentTarget.style.color = darkThemeColors.accentRed
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = darkThemeColors.border
                e.currentTarget.style.color = darkThemeColors.textSecondary
              }}
            >
              清空 KuKuDa-API
            </button>
          </ProviderCard>

          {/* Comfly Chat */}
          <ProviderCard
            title="Comfly Chat"
            icon="💬"
            description="全局备用提供商，所有未独立设定的模型会自动走此配置。"
          >
            <LabeledInput
              label="API 地址"
              value={settings.comfly.url}
              onChange={(v) => updateComfly({ url: v })}
              placeholder="https://..."
            />
            <LabeledInput
              label="API Key"
              value={settings.comfly.key}
              onChange={(v) => updateComfly({ key: v })}
              type="password"
              placeholder="sk-xxxxxxxxxxxxxxxx"
            />
            <button
              onClick={() => {
                updateComfly({ url: defaultState.comfly.url, key: '' })
                toast.success('Comfly 配置已清空')
              }}
              style={{
                width: '100%',
                padding: '8px 0',
                backgroundColor: 'transparent',
                border: `1px solid ${darkThemeColors.border}`,
                borderRadius: '6px',
                color: darkThemeColors.textSecondary,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = darkThemeColors.accentRed
                e.currentTarget.style.color = darkThemeColors.accentRed
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = darkThemeColors.border
                e.currentTarget.style.color = darkThemeColors.textSecondary
              }}
            >
              清空 Comfly 配置
            </button>
          </ProviderCard>

          {/* AI6800 聚合 */}
          <ProviderCard
            title="AI6800 聚合 (GPT Image 2 / Ik888 视频模型)"
            icon="🤖"
          >
            <LabeledInput
              label="API 地址"
              value={settings.ai6800.imageUrl}
              onChange={(v) => updateAi6800({ imageUrl: v })}
              placeholder="https://..."
              suffixNote="GPT Image 2 → api.ai6800.com"
            />
            <LabeledInput
              label="API 地址 (Ik888 视频)"
              value={settings.ai6800.videoUrl}
              onChange={(v) => updateAi6800({ videoUrl: v })}
              placeholder="https://..."
              suffixNote="Ik888 视频 → api.lk888.ai"
            />
            <LabeledInput
              label="API Key (两个模型共用)"
              value={settings.ai6800.key}
              onChange={(v) => updateAi6800({ key: v })}
              type="password"
              placeholder="sk-xxxxxxxxxxxxxxxx"
            />
            <div
              style={{
                fontSize: '11px',
                color: darkThemeColors.textSecondary,
                lineHeight: 1.5,
              }}
            >
              GPT Image 2 走 api.ai6800.com；SP 2.0 参考生 / 全能参考 / Sora-2
              官转版走 api.lk888.ai（与上面地址分开，共用同一个 Key）。
            </div>
            <button
              onClick={() => {
                updateAi6800({
                  imageUrl: defaultState.ai6800.imageUrl,
                  videoUrl: defaultState.ai6800.videoUrl,
                  key: '',
                })
                toast.success('AI6800 配置已清空')
              }}
              style={{
                width: '100%',
                padding: '8px 0',
                backgroundColor: 'transparent',
                border: `1px solid ${darkThemeColors.border}`,
                borderRadius: '6px',
                color: darkThemeColors.textSecondary,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = darkThemeColors.accentRed
                e.currentTarget.style.color = darkThemeColors.accentRed
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = darkThemeColors.border
                e.currentTarget.style.color = darkThemeColors.textSecondary
              }}
            >
              清空 AI6800 配置
            </button>
          </ProviderCard>

          {/* Maintenance card (placeholder) */}
          <ProviderCard title="第三方通道" icon="🔒">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 0',
                gap: '8px',
                color: darkThemeColors.textSecondary,
              }}
            >
              <span style={{ fontSize: '24px', filter: 'blur(4px)', userSelect: 'none' }}>
                abcdefghijkl
              </span>
              <span style={{ fontSize: '13px' }}>维护中</span>
            </div>
          </ProviderCard>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderTop: `1px solid ${darkThemeColors.border}`,
            backgroundColor: '#12121f',
          }}
        >
          <button
            onClick={handleClearAll}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              color: darkThemeColors.accentRed,
              fontSize: '13px',
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            清空所有 API
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 24px',
              backgroundColor: darkThemeColors.accentBlue,
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: saving ? 'wait' : 'pointer',
              opacity: saving ? 0.7 : 1,
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.opacity = '0.85'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = saving ? '0.7' : '1'
            }}
          >
            {saving ? '保存中...' : '保存并关闭'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApiSettingsModal
