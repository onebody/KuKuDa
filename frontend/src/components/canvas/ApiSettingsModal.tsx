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

export interface ProviderModelInfo {
  id: string
  label?: string
  provider: string
}

const STORAGE_KEY = 'workflow_api_settings'
const MODELS_STORAGE_KEY = 'workflow_api_models'

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
    imageUrl: 'https://ai6800.com',
    videoUrl: 'https://ai6800.com',
    key: '',
  },
}

// ── Model list helpers ────────────────────────────────────────────────

/** 从 localStorage 加载已获取的模型列表 */
export function loadAvailableModels(): ProviderModelInfo[] {
  try {
    const raw = localStorage.getItem(MODELS_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

/** 保存模型列表到 localStorage */
export function saveAvailableModels(models: ProviderModelInfo[]) {
  localStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(models))
}

/** 调用 OpenAI 兼容 API 获取模型列表 */
async function fetchOpenAIModels(
  baseUrl: string,
  apiKey: string
): Promise<string[]> {
  const url = baseUrl.replace(/\/$/, '') + '/v1/models'
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
  }
  const data = await res.json()
  if (!data.data || !Array.isArray(data.data)) {
    throw new Error('返回格式不正确')
  }
  return data.data.map((m: any) => m.id as string)
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
        ai6800: { ...defaultState.ai6800, ...(migrated.ai6800 || {}) },
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
  localStorage.removeItem(MODELS_STORAGE_KEY)
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

// ── Model List Display component ──────────────────────────────────────

const ModelListDisplay: React.FC<{
  models: string[]
  provider: string
  expanded: boolean
  onToggle: () => void
}> = ({ models, provider, expanded, onToggle }) => {
  if (models.length === 0) return null

  return (
    <div
      style={{
        backgroundColor: '#0f0f1a',
        border: `1px solid ${darkThemeColors.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          color: darkThemeColors.textSecondary,
          fontSize: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = darkThemeColors.textPrimary
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = darkThemeColors.textSecondary
        }}
      >
        <span>
          <span style={{ color: darkThemeColors.accentGreen, fontWeight: 600 }}>
            {models.length}
          </span>{' '}
          个模型已获取
        </span>
        <span style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </button>
      {expanded && (
        <div
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '4px 12px 8px',
            borderTop: `1px solid ${darkThemeColors.border}`,
          }}
        >
          {models.map((m) => (
            <div
              key={m}
              style={{
                fontSize: '12px',
                color: darkThemeColors.textSecondary,
                padding: '3px 0',
                fontFamily: 'monospace',
                borderBottom: `1px solid ${darkThemeColors.border}40`,
                wordBreak: 'break-all',
              }}
            >
              {m}
            </div>
          ))}
        </div>
      )}
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

  // 每个通道的获取状态
  const [fetching, setFetching] = useState<{
    kukuda: boolean
    comfly: boolean
  }>({ kukuda: false, comfly: false })

  // 每个通道获取到的模型列表
  const [fetchedModels, setFetchedModels] = useState<{
    kukuda: string[]
    comfly: string[]
  }>({ kukuda: [], comfly: [] })

  // 展开状态
  const [expandedModels, setExpandedModels] = useState<{
    kukuda: boolean
    comfly: boolean
  }>({ kukuda: false, comfly: false })

  useEffect(() => {
    if (open) {
      setSettings(loadApiSettings())
      // 加载已保存的模型列表
      const saved = loadAvailableModels()
      setFetchedModels({
        kukuda: saved.filter((m) => m.provider === 'kukuda').map((m) => m.id),
        comfly: saved.filter((m) => m.provider === 'comfly').map((m) => m.id),
      })
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
    setFetchedModels({ kukuda: [], comfly: [] })
    clearApiSettings()
    toast.success('所有 API 配置已清空')
  }, [])

  /** 获取指定通道的模型列表 */
  const handleFetchModels = useCallback(
    async (provider: 'kukuda' | 'comfly') => {
      let url = ''
      let key = ''

      if (provider === 'kukuda') {
        url = settings.kukuda.url
        key = settings.kukuda.key
      } else {
        url = settings.comfly.url
        key = settings.comfly.key
      }

      if (!url || !key) {
        toast.error('请先填写 API 地址和 Key')
        return
      }

      setFetching((prev) => ({ ...prev, [provider]: true }))
      try {
        const models = await fetchOpenAIModels(url, key)
        setFetchedModels((prev) => ({ ...prev, [provider]: models }))

        // 保存到 localStorage（合并其他提供商的数据）
        const otherModels = loadAvailableModels().filter((m) => m.provider !== provider)
        const newModels: ProviderModelInfo[] = [
          ...otherModels,
          ...models.map((id) => ({ id, provider })),
        ]
        saveAvailableModels(newModels)
        // 同时保存 API 配置，避免用户忘记点保存
        saveApiSettings(settings)

        toast.success(`✅ ${provider} 获取到 ${models.length} 个模型`)
      } catch (err: any) {
        toast.error(`❌ 获取失败: ${err.message || '未知错误'}`)
      } finally {
        setFetching((prev) => ({ ...prev, [provider]: false }))
      }
    },
    [settings]
  )

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
          width: 'min(960px, 94vw)',
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
            {/* 获取模型列表按钮 */}
            <button
              onClick={() => handleFetchModels('kukuda')}
              disabled={fetching.kukuda}
              style={{
                width: '100%',
                padding: '8px 0',
                backgroundColor: `${darkThemeColors.accentGreen}15`,
                border: `1px solid ${darkThemeColors.accentGreen}40`,
                borderRadius: '6px',
                color: darkThemeColors.accentGreen,
                fontSize: '13px',
                cursor: fetching.kukuda ? 'wait' : 'pointer',
                opacity: fetching.kukuda ? 0.6 : 1,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                if (!fetching.kukuda) {
                  e.currentTarget.style.backgroundColor = `${darkThemeColors.accentGreen}25`
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${darkThemeColors.accentGreen}15`
              }}
            >
              {fetching.kukuda ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  获取中...
                </>
              ) : (
                <>🔄 获取模型列表</>
              )}
            </button>
            {/* 模型列表展示 */}
            <ModelListDisplay
              models={fetchedModels.kukuda}
              provider="kukuda"
              expanded={expandedModels.kukuda}
              onToggle={() =>
                setExpandedModels((prev) => ({ ...prev, kukuda: !prev.kukuda }))
              }
            />
            <button
              onClick={() => {
                updateKuKuDa({ url: defaultState.kukuda.url, key: '' })
                setFetchedModels((prev) => ({ ...prev, kukuda: [] }))
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
            {/* 获取模型列表按钮 */}
            <button
              onClick={() => handleFetchModels('comfly')}
              disabled={fetching.comfly}
              style={{
                width: '100%',
                padding: '8px 0',
                backgroundColor: `${darkThemeColors.accentGreen}15`,
                border: `1px solid ${darkThemeColors.accentGreen}40`,
                borderRadius: '6px',
                color: darkThemeColors.accentGreen,
                fontSize: '13px',
                cursor: fetching.comfly ? 'wait' : 'pointer',
                opacity: fetching.comfly ? 0.6 : 1,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                if (!fetching.comfly) {
                  e.currentTarget.style.backgroundColor = `${darkThemeColors.accentGreen}25`
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${darkThemeColors.accentGreen}15`
              }}
            >
              {fetching.comfly ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  获取中...
                </>
              ) : (
                <>🔄 获取模型列表</>
              )}
            </button>
            {/* 模型列表展示 */}
            <ModelListDisplay
              models={fetchedModels.comfly}
              provider="comfly"
              expanded={expandedModels.comfly}
              onToggle={() =>
                setExpandedModels((prev) => ({ ...prev, comfly: !prev.comfly }))
              }
            />
            <button
              onClick={() => {
                updateComfly({ url: defaultState.comfly.url, key: '' })
                setFetchedModels((prev) => ({ ...prev, comfly: [] }))
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
