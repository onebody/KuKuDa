import React, { useState, useEffect, useCallback } from 'react'
import { darkThemeColors } from '../../styles/theme'
import { toast } from 'react-hot-toast'

// ── Types ─────────────────────────────────────────────────────

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

export interface CustomChannel {
  id: string
  name: string
  url: string
  key: string
  modelName?: string
  advanced: {
    tools: boolean
    imageInput: boolean
    reasoning: boolean
    customProtocol: boolean
  }
  models: string[]
}

export interface ApiSettingsState {
  kukuda: KuKuDaApiConfig
  comfly: ComflyConfig
  ai6800: Ai6800Config
  customChannels: CustomChannel[]
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
  customChannels: [],
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
      // Migrate: ensure customChannels exists
      const customChannels = migrated.customChannels || []
      return {
        kukuda: { ...defaultState.kukuda, ...migrated.kukuda },
        comfly: { ...defaultState.comfly, ...migrated.comfly },
        ai6800: { ...defaultState.ai6800, ...(migrated.ai6800 || {}) },
        customChannels,
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

// ── Utility helpers ──────────────────────────────────────────────────────

/** 生成唯一 ID */
function generateId(): string {
  return `ch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/** 掩码敏感信息 */
function maskString(str: string, visibleChars: number = 4): string {
  if (!str) return '未设置'
  if (str.length <= visibleChars * 2) return '*'.repeat(Math.min(str.length, 12))
  return str.slice(0, visibleChars) + '*'.repeat(Math.max(str.length - visibleChars * 2, 4)) + str.slice(-visibleChars)
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

// ── Custom Channel Form Modal ────────────────────────────────────────

interface CustomChannelFormProps {
  channel?: CustomChannel  // 编辑模式时传入
  onSave: (channel: CustomChannel) => void
  onCancel: () => void
}

const CustomChannelForm: React.FC<CustomChannelFormProps> = ({
  channel,
  onSave,
  onCancel,
}) => {
  const isEdit = !!channel
  const [name, setName] = useState(channel?.name || '')
  const [url, setUrl] = useState(channel?.url || '')
  const [key, setKey] = useState(channel?.key || '')
  const [modelName, setModelName] = useState(channel?.modelName || '')
  const [advanced, setAdvanced] = useState(channel?.advanced || {
    tools: false,
    imageInput: false,
    reasoning: false,
    customProtocol: false,
  })

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('请输入通道名称')
      return
    }
    if (!url.trim()) {
      toast.error('请输入接口地址')
      return
    }
    if (!key.trim()) {
      toast.error('请输入 API Key')
      return
    }

    const saved: CustomChannel = {
      id: channel?.id || generateId(),
      name: name.trim(),
      url: url.trim(),
      key: key.trim(),
      modelName: modelName.trim() || undefined,
      advanced: { ...advanced },
      models: channel?.models || [],
    }
    onSave(saved)
  }

  const toggleAdvanced = (keyName: keyof typeof advanced) => {
    setAdvanced(prev => ({ ...prev, [keyName]: !prev[keyName] }))
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        style={{
          backgroundColor: darkThemeColors.bgPrimary,
          border: `1px solid ${darkThemeColors.border}`,
          borderRadius: '16px',
          width: 'min(520px, 90vw)',
          maxHeight: '85vh',
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
            <span style={{ fontSize: '18px' }}>{isEdit ? '✏️' : '➕'}</span>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: darkThemeColors.textPrimary,
              }}
            >
              {isEdit ? '编辑通道' : '添加自定义通道'}
            </span>
          </div>
          <button
            onClick={onCancel}
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

        {/* Body */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <LabeledInput
            label="通道名称"
            value={name}
            onChange={setName}
            placeholder="输入通道名称，例如：My API"
          />

          <LabeledInput
            label="接口地址"
            value={url}
            onChange={setUrl}
            placeholder="https://api.example.com/v1/chat/completions"
          />

          <LabeledInput
            label="API Key"
            value={key}
            onChange={setKey}
            type="password"
            placeholder="sk-xxxxxxxxxxxxxxxx"
          />

          <LabeledInput
            label="模型名称（选填）"
            value={modelName}
            onChange={setModelName}
            placeholder="输入模型参数值，例如 gpt-4o 或 openai/gpt-4o"
          />

          {/* 高级配置 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              style={{
                fontSize: '12px',
                color: darkThemeColors.textSecondary,
                fontWeight: 500,
              }}
            >
              高级配置
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {([
                ['tools', '🔧 工具调用'],
                ['imageInput', '🖼️ 图片输入'],
                ['reasoning', '🧠 推理模式'],
                ['customProtocol', '🔌 自定义协议'],
              ] as [keyof typeof advanced, string][]).map(([keyName, label]) => (
                <label
                  key={keyName}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: darkThemeColors.textPrimary,
                    cursor: 'pointer',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    backgroundColor: advanced[keyName] ? `${darkThemeColors.accentBlue}15` : 'transparent',
                    border: `1px solid ${advanced[keyName] ? darkThemeColors.accentBlue + '40' : 'transparent'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={advanced[keyName]}
                    onChange={() => toggleAdvanced(keyName)}
                    style={{
                      accentColor: darkThemeColors.accentBlue,
                      cursor: 'pointer',
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '14px 20px',
            borderTop: `1px solid ${darkThemeColors.border}`,
            backgroundColor: '#12121f',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '8px 20px',
              backgroundColor: 'transparent',
              border: `1px solid ${darkThemeColors.border}`,
              borderRadius: '6px',
              color: darkThemeColors.textSecondary,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = darkThemeColors.textSecondary
              e.currentTarget.style.color = darkThemeColors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = darkThemeColors.border
              e.currentTarget.style.color = darkThemeColors.textSecondary
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 24px',
              backgroundColor: darkThemeColors.accentBlue,
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            {isEdit ? '保存修改' : '添加通道'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Custom Channel Card component ───────────────────────────────────

interface CustomChannelCardProps {
  channel: CustomChannel
  expanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onFetchModels: () => void
  fetching: boolean
}

const CustomChannelCard: React.FC<CustomChannelCardProps> = ({
  channel,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onFetchModels,
  fetching,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#1a1a2e',
        border: `1px solid ${darkThemeColors.border}`,
        borderRadius: '10px',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.borderColor = darkThemeColors.accentBlue + '40'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.borderColor = darkThemeColors.border
      }}
    >
      {/* Channel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          cursor: 'pointer',
        }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '16px' }}>🔌</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: darkThemeColors.textPrimary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {channel.name}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: darkThemeColors.textSecondary,
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {maskString(channel.url, 6)} · {channel.models.length} 个模型
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              fontSize: '11px',
              color: channel.models.length > 0 ? darkThemeColors.accentGreen : darkThemeColors.textSecondary,
              fontWeight: 500,
            }}
          >
            {channel.models.length > 0 ? '✅' : '⚪'}
          </span>
          <span style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: darkThemeColors.textSecondary, fontSize: '12px' }}>
            ▼
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div
          style={{
            padding: '0 14px 14px',
            borderTop: `1px solid ${darkThemeColors.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: darkThemeColors.textSecondary, minWidth: '70px' }}>接口地址:</span>
              <span style={{ fontSize: '12px', color: darkThemeColors.textPrimary, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {maskString(channel.url, 6)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: darkThemeColors.textSecondary, minWidth: '70px' }}>API Key:</span>
              <span style={{ fontSize: '12px', color: darkThemeColors.textPrimary, fontFamily: 'monospace' }}>
                {maskString(channel.key, 4)}
              </span>
            </div>
            {channel.modelName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: darkThemeColors.textSecondary, minWidth: '70px' }}>模型名称:</span>
                <span style={{ fontSize: '12px', color: darkThemeColors.textPrimary, fontFamily: 'monospace' }}>
                  {channel.modelName}
                </span>
              </div>
            )}
            {(channel.advanced.tools || channel.advanced.imageInput || channel.advanced.reasoning || channel.advanced.customProtocol) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: darkThemeColors.textSecondary, minWidth: '70px' }}>高级配置:</span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {channel.advanced.tools && (
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: `${darkThemeColors.accentBlue}20`, color: darkThemeColors.accentBlue }}>
                      工具调用
                    </span>
                  )}
                  {channel.advanced.imageInput && (
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: `${darkThemeColors.accentGreen}20`, color: darkThemeColors.accentGreen }}>
                      图片输入
                    </span>
                  )}
                  {channel.advanced.reasoning && (
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: `${darkThemeColors.accentYellow}20`, color: darkThemeColors.accentYellow }}>
                      推理模式
                    </span>
                  )}
                  {channel.advanced.customProtocol && (
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#a855f720', color: '#a855f7' }}>
                      自定义协议
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onFetchModels() }}
              disabled={fetching}
              style={{
                padding: '6px 12px',
                backgroundColor: `${darkThemeColors.accentGreen}15`,
                border: `1px solid ${darkThemeColors.accentGreen}40`,
                borderRadius: '6px',
                color: darkThemeColors.accentGreen,
                fontSize: '12px',
                cursor: fetching ? 'wait' : 'pointer',
                opacity: fetching ? 0.6 : 1,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onMouseEnter={(e) => {
                if (!fetching) {
                  e.currentTarget.style.backgroundColor = `${darkThemeColors.accentGreen}25`
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${darkThemeColors.accentGreen}15`
              }}
            >
              {fetching ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  获取中...
                </>
              ) : (
                <>🔄 获取模型</>
              )}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              style={{
                padding: '6px 12px',
                backgroundColor: `${darkThemeColors.accentBlue}15`,
                border: `1px solid ${darkThemeColors.accentBlue}40`,
                borderRadius: '6px',
                color: darkThemeColors.accentBlue,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${darkThemeColors.accentBlue}25`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${darkThemeColors.accentBlue}15`
              }}
            >
              ✏️ 编辑
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              style={{
                padding: '6px 12px',
                backgroundColor: `${darkThemeColors.accentRed}15`,
                border: `1px solid ${darkThemeColors.accentRed}40`,
                borderRadius: '6px',
                color: darkThemeColors.accentRed,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginLeft: 'auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${darkThemeColors.accentRed}25`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${darkThemeColors.accentRed}15`
              }}
            >
              🗑️ 删除
            </button>
          </div>

          {/* Model List */}
          <ModelListDisplay
            models={channel.models}
            provider={`custom-${channel.id}`}
            expanded={true}
            onToggle={() => {}}
          />
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
  const [fetching, setFetching] = useState<Record<string, boolean>>({
    kukuda: false,
    comfly: false,
  })

  // 每个通道获取到的模型列表
  const [fetchedModels, setFetchedModels] = useState<Record<string, string[]>>({
    kukuda: [],
    comfly: [],
  })

  // 展开状态
  const [expandedModels, setExpandedModels] = useState<{
    kukuda: boolean
    comfly: boolean
  }>({ kukuda: false, comfly: false })

  // 自定义通道的展开/编辑/表单状态
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set())
  const [showChannelForm, setShowChannelForm] = useState(false)
  const [editingChannel, setEditingChannel] = useState<CustomChannel | undefined>(undefined)

  useEffect(() => {
    if (open) {
      const loadedSettings = loadApiSettings()
      setSettings(loadedSettings)
      // 加载已保存的模型列表
      const saved = loadAvailableModels()
      const newFetchedModels: Record<string, string[]> = {
        kukuda: saved.filter((m) => m.provider === 'kukuda').map((m) => m.id),
        comfly: saved.filter((m) => m.provider === 'comfly').map((m) => m.id),
      }
      // 加载自定义通道的模型
      loadedSettings.customChannels.forEach(ch => {
        newFetchedModels[ch.id] = ch.models
      })
      setFetchedModels(newFetchedModels)
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
    async (provider: string, overrideUrl?: string, overrideKey?: string) => {
      let fetchUrl = ''
      let fetchKey = ''

      if (provider === 'kukuda') {
        fetchUrl = settings.kukuda.url
        fetchKey = settings.kukuda.key
      } else if (provider === 'comfly') {
        fetchUrl = settings.comfly.url
        fetchKey = settings.comfly.key
      } else {
        // 自定义通道
        const channel = settings.customChannels.find(ch => ch.id === provider)
        if (channel) {
          fetchUrl = channel.url
          fetchKey = channel.key
        }
      }

      // 如果传入了 overrideUrl 和 overrideKey（用于自定义通道），使用传入的值
      if (overrideUrl !== undefined && overrideKey !== undefined) {
        fetchUrl = overrideUrl
        fetchKey = overrideKey
      }

      if (!fetchUrl || !fetchKey) {
        toast.error('请先填写 API 地址和 Key')
        return
      }

      setFetching((prev) => ({ ...prev, [provider]: true }))
      try {
        const models = await fetchOpenAIModels(fetchUrl, fetchKey)
        setFetchedModels((prev) => ({ ...prev, [provider]: models }))

        // 如果是自定义通道，更新 settings 中的 models
        if (provider !== 'kukuda' && provider !== 'comfly') {
          setSettings(prev => ({
            ...prev,
            customChannels: prev.customChannels.map(ch =>
              ch.id === provider ? { ...ch, models } : ch
            )
          }))
        }

        // 保存到 localStorage（合并其他提供商的数据）
        // 自定义通道的 provider 标识统一加上 custom- 前缀
        const modelProvider = provider !== 'kukuda' && provider !== 'comfly' ? `custom-${provider}` : provider
        const otherModels = loadAvailableModels().filter((m) => m.provider !== modelProvider)
        const newModels: ProviderModelInfo[] = [
          ...otherModels,
          ...models.map((id) => ({ id, provider: modelProvider })),
        ]
        saveAvailableModels(newModels)
        // 同时保存 API 配置，避免用户忘记点保存
        // 使用最新 state 保存，确保自定义通道数据不丢失
        const latestSettings = loadApiSettings()
        if (provider !== 'kukuda' && provider !== 'comfly') {
          latestSettings.customChannels = latestSettings.customChannels.map(ch =>
            ch.id === provider ? { ...ch, models } : ch
          )
        }
        saveApiSettings(latestSettings)

        toast.success(`✅ 获取到 ${models.length} 个模型`)
      } catch (err: any) {
        toast.error(`❌ 获取失败: ${err.message || '未知错误'}`)
      } finally {
        setFetching((prev) => ({ ...prev, [provider]: false }))
      }
    },
    [settings]
  )

  // ── 自定义通道管理 ───────────────────────────────────────────

  const handleAddChannel = useCallback(() => {
    setEditingChannel(undefined)
    setShowChannelForm(true)
  }, [])

  const handleEditChannel = useCallback((channel: CustomChannel) => {
    setEditingChannel(channel)
    setShowChannelForm(true)
  }, [])

  const handleSaveChannel = useCallback((channel: CustomChannel) => {
    setSettings(prev => {
      const exists = prev.customChannels.some(ch => ch.id === channel.id)
      if (exists) {
        return {
          ...prev,
          customChannels: prev.customChannels.map(ch =>
            ch.id === channel.id ? channel : ch
          )
        }
      } else {
        return {
          ...prev,
          customChannels: [...prev.customChannels, channel]
        }
      }
    })
    setShowChannelForm(false)
    setEditingChannel(undefined)
    toast.success(`通道 ${channel.name} 已保存`)
  }, [])

  const handleDeleteChannel = useCallback((channelId: string) => {
    const channel = settings.customChannels.find(ch => ch.id === channelId)
    if (!confirm(`确定要删除通道 "${channel?.name || '未知'}" 吗？`)) return

    setSettings(prev => ({
      ...prev,
      customChannels: prev.customChannels.filter(ch => ch.id !== channelId)
    }))
    // 同时删除该通道的模型
    const otherModels = loadAvailableModels().filter(m => m.provider !== `custom-${channelId}`)
    saveAvailableModels(otherModels)

    toast.success('通道已删除')
  }, [settings.customChannels])

  const toggleChannelExpanded = useCallback((channelId: string) => {
    setExpandedChannels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(channelId)) {
        newSet.delete(channelId)
      } else {
        newSet.add(channelId)
      }
      return newSet
    })
  }, [])

  const handleFetchCustomChannelModels = useCallback((channel: CustomChannel) => {
    handleFetchModels(channel.id, channel.url, channel.key)
  }, [handleFetchModels])

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
            display: 'flex',
            flexDirection: 'column',
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

          {/* 自定义通道区域 */}
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
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🔌</span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: darkThemeColors.textPrimary,
                  }}
                >
                  自定义通道
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: '#a855f720',
                    color: '#a855f7',
                    border: '1px solid #a855f740',
                  }}
                >
                  自定义
                </span>
              </div>
              <button
                onClick={handleAddChannel}
                style={{
                  padding: '6px 14px',
                  backgroundColor: `${darkThemeColors.accentBlue}15`,
                  border: `1px solid ${darkThemeColors.accentBlue}40`,
                  borderRadius: '6px',
                  color: darkThemeColors.accentBlue,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${darkThemeColors.accentBlue}25`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${darkThemeColors.accentBlue}15`
                }}
              >
                ➕ 添加通道
              </button>
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: '11px',
                color: darkThemeColors.accentBlue,
                lineHeight: 1.5,
              }}
            >
              💡 添加自定义 API 通道，支持任意 OpenAI 兼容的 API 服务。
            </div>

            {/* Channel List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {settings.customChannels.length === 0 && (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: darkThemeColors.textSecondary,
                    fontSize: '13px',
                    border: `1px dashed ${darkThemeColors.border}`,
                    borderRadius: '8px',
                  }}
                >
                  暂无自定义通道，点击「添加通道」开始配置
                </div>
              )}
              {settings.customChannels.map(channel => (
                <CustomChannelCard
                  key={channel.id}
                  channel={channel}
                  expanded={expandedChannels.has(channel.id)}
                  onToggle={() => toggleChannelExpanded(channel.id)}
                  onEdit={() => handleEditChannel(channel)}
                  onDelete={() => handleDeleteChannel(channel.id)}
                  onFetchModels={() => handleFetchCustomChannelModels(channel)}
                  fetching={!!fetching[channel.id]}
                />
              ))}
            </div>
          </div>
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

      {/* 添加/编辑通道表单弹窗 */}
      {showChannelForm && (
        <CustomChannelForm
          channel={editingChannel}
          onSave={handleSaveChannel}
          onCancel={() => {
            setShowChannelForm(false)
            setEditingChannel(undefined)
          }}
        />
      )}
    </div>
  )
}

export default ApiSettingsModal
