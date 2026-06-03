import React, { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import BaseNode from './BaseNode'
import { darkThemeColors } from '../../../styles/theme'
import { loadAvailableModels, ProviderModelInfo } from '../ApiSettingsModal'

// ── localStorage 读取 ───────────────────────────────────────
interface ProviderConfig {
  url: string
  key: string
}

interface CustomChannelInfo {
  id: string
  name: string
  url: string
  key: string
}

type ModelInfo = ProviderModelInfo

/** 读取已获取的模型列表（主来源：workflow_api_models，fallback：settings 中的 ch.models） */
function getSavedModels(): ModelInfo[] {
  const fromStore = loadAvailableModels()
  if (fromStore.length > 0) return fromStore

  try {
    const raw = localStorage.getItem('workflow_api_settings')
    if (!raw) return []
    const settings = JSON.parse(raw)
    const models: ModelInfo[] = []
    if (settings.customChannels) {
      settings.customChannels.forEach((ch: any) => {
        if (ch.models && Array.isArray(ch.models)) {
          ch.models.forEach((id: string) => {
            models.push({ id, provider: `custom-${ch.id}` })
          })
        }
      })
    }
    if (models.length > 0) return models
  } catch { /* ignore */ }

  return []
}

/** 读取完整 API 设置 */
interface SavedSettings {
  kukuda: ProviderConfig
  comfly: ProviderConfig
  customChannels: CustomChannelInfo[]
}

function getSavedSettings(): SavedSettings {
  try {
    const raw = localStorage.getItem('workflow_api_settings')
    if (!raw) return { kukuda: { url: '', key: '' }, comfly: { url: '', key: '' }, customChannels: [] }
    const parsed = JSON.parse(raw)
    return {
      kukuda: parsed.kukuda || { url: '', key: '' },
      comfly: parsed.comfly || { url: '', key: '' },
      customChannels: parsed.customChannels || [],
    }
  } catch {
    return { kukuda: { url: '', key: '' }, comfly: { url: '', key: '' }, customChannels: [] }
  }
}

/** 读取自定义通道列表 */
function getCustomChannels(): CustomChannelInfo[] {
  return getSavedSettings().customChannels || []
}

/** 根据 provider 获取对应的 config（支持自定义通道） */
function getConfigForProvider(provider: string): ProviderConfig | null {
  const settings = getSavedSettings()
  if (provider === 'kukuda') return settings.kukuda
  if (provider === 'comfly') return settings.comfly
  if (provider.startsWith('custom-')) {
    const channelId = provider.replace(/^custom-/, '')
    const ch = settings.customChannels.find(c => c.id === channelId)
    if (ch) return { url: ch.url, key: ch.key }
  }
  return null
}

const CATEGORY_LABELS: Record<string, string> = {
  builtin: '系统内置模型',
  thirdparty: '第三方扩展模型',
}

// ── 模型选择器组件 ───────────────────────────────────────────────

interface ModelSelectorProps {
  value: string
  onChange: (model: string) => void
  scale?: number
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ value, onChange, scale = 1 }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'builtin' | 'thirdparty'>('all')
  const [models, setModels] = useState<ModelInfo[]>(() => getSavedModels())
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 280 })

  // 打开时重新从 localStorage 加载模型列表（刷新），并计算面板位置
  useEffect(() => {
    if (open && buttonRef.current) {
      setModels(getSavedModels())
      const rect = buttonRef.current.getBoundingClientRect()
      setPanelPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, Math.round(280 * Math.min(scale, 1.2))),
      })
    }
  }, [open, scale])

  // 监听 localStorage 变化（其他标签页或组件修改时自动刷新）
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'workflow_api_models' || e.key === 'workflow_api_settings') {
        setModels(getSavedModels())
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // 点击外部关闭
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // 分类模型
  const builtinModels = models.filter(m => m.provider === 'kukuda')
  const thirdPartyModels = models.filter(m => {
    if (m.provider === 'comfly') return true
    return m.provider.startsWith('custom-')
  })

  // 获取通道名称
  const getChannelName = (provider: string) => {
    if (provider === 'comfly') return 'Comfly'
    if (provider.startsWith('custom-')) {
      const chId = provider.replace(/^custom-/, '')
      const ch = getCustomChannels().find(c => c.id === chId)
      return ch?.name || '自定义通道'
    }
    return provider
  }

  // 过滤模型
  const filteredBuiltin = builtinModels.filter(m =>
    m.id.toLowerCase().includes(search.toLowerCase())
  )
  const filteredThirdParty = thirdPartyModels.filter(m =>
    m.id.toLowerCase().includes(search.toLowerCase())
  )

  // 当前选中的模型名称
  const selectedModel = models.find(m => m.id === value)
  const displayLabel = selectedModel
    ? `${getChannelName(selectedModel.provider)} / ${selectedModel.id}`
    : value || '选择模型'

  const hasModels = models.length > 0 || !!value

  // ── 内部样式（按 scale 缩放）──────────────────────
  const fontSize = Math.round(11 * scale)
  const fontSizeSm = Math.round(10 * scale)
  const paddingX = Math.round(8 * scale)
  const paddingY = Math.round(6 * scale)
  const borderRadius = Math.round(6 * scale)
  const tabPaddingY = Math.round(3 * scale)
  const tabPaddingX = Math.round(10 * scale)
  const tabRadius = Math.round(12 * scale)
  const listItemPaddingY = Math.round(6 * scale)
  const listItemPaddingX = Math.round(12 * scale)
  const panelWidth = Math.round(280 * Math.min(scale, 1.2))
  const panelMaxH = Math.round(360 * Math.min(scale, 1.2))
  const searchPaddingX = Math.round(6 * scale)
  const searchPaddingY = Math.round(6 * scale)
  const categoryFontSize = Math.round(10 * scale)
  const labelFontSize = Math.round(12 * scale)

  return (
    <div ref={panelRef} style={{ position: 'relative', flex: 1, minWidth: `${Math.round(120 * scale)}px` }}>
      {/* 触发按钮 */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: `${Math.round(4 * scale)}px ${paddingX}px`,
          backgroundColor: darkThemeColors.bgSecondary,
          border: `1px solid ${darkThemeColors.border}`,
          borderRadius: `${borderRadius}px`,
          color: value ? darkThemeColors.textPrimary : darkThemeColors.textSecondary,
          fontSize: `${fontSize}px`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: `${Math.round(6 * scale)}px`,
          textAlign: 'left',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {hasModels ? displayLabel : '请在设置中获取模型'}
        </span>
        <span style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>

      {/* 弹出面板 — Portal 渲染到 body，彻底逃脱所有祖先 overflow/transform 裁剪 */}
      {open && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${panelPos.top}px`,
            left: `${panelPos.left}px`,
            zIndex: 99999,
            width: `${panelPos.width}px`,
            maxHeight: `${panelMaxH}px`,
            backgroundColor: darkThemeColors.bgPrimary,
            border: `1px solid ${darkThemeColors.border}`,
            borderRadius: `${Math.round(10 * scale)}px`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* 搜索框 */}
          <div style={{ padding: `${searchPaddingY}px ${searchPaddingX}px`, borderBottom: `1px solid ${darkThemeColors.border}` }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: `${Math.round(6 * scale)}px`,
              backgroundColor: darkThemeColors.bgSecondary,
              borderRadius: `${borderRadius}px`,
              padding: `0 ${searchPaddingX}px`,
            }}>
              <span style={{ fontSize: `${fontSize}px`, color: darkThemeColors.textSecondary }}>🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索模型..."
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: darkThemeColors.textPrimary,
                  fontSize: `${fontSize}px`,
                  padding: `${searchPaddingY}px 0`,
                  outline: 'none',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', color: darkThemeColors.textSecondary, cursor: 'pointer', fontSize: `${fontSizeSm}px`, padding: `${Math.round(2 * scale)}px` }}
                >✕</button>
              )}
            </div>
          </div>

          {/* 分类标签 */}
          <div style={{
            display: 'flex',
            gap: `${Math.round(4 * scale)}px`,
            padding: `${tabPaddingY}px ${tabPaddingX}px`,
            borderBottom: `1px solid ${darkThemeColors.border}`,
          }}>
            {([
              { key: 'all', label: '全部' },
              { key: 'builtin', label: CATEGORY_LABELS.builtin },
              { key: 'thirdparty', label: CATEGORY_LABELS.thirdparty },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                style={{
                  padding: `${tabPaddingY}px ${tabPaddingX}px`,
                  borderRadius: `${tabRadius}px`,
                  border: 'none',
                  fontSize: `${fontSizeSm}px`,
                  cursor: 'pointer',
                  backgroundColor: activeCategory === tab.key ? `${darkThemeColors.accentBlue}30` : 'transparent',
                  color: activeCategory === tab.key ? darkThemeColors.accentBlue : darkThemeColors.textSecondary,
                  fontWeight: activeCategory === tab.key ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 模型列表 */}
          <div style={{ overflowY: 'auto', flex: 1, padding: `${Math.round(6 * scale)}px 0` }}>
            {/* 系统内置模型 */}
            {(activeCategory === 'all' || activeCategory === 'builtin') && filteredBuiltin.length > 0 && (
              <div>
                {activeCategory === 'all' && (
                  <div style={{
                    padding: `${Math.round(4 * scale)}px ${listItemPaddingX}px`,
                    fontSize: `${categoryFontSize}px`,
                    fontWeight: 600,
                    color: darkThemeColors.accentBlue,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {CATEGORY_LABELS.builtin}
                  </div>
                )}
                {filteredBuiltin.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { onChange(m.id); setOpen(false); setSearch('') }}
                    style={{
                      width: '100%',
                      padding: `${listItemPaddingY}px ${listItemPaddingX}px`,
                      textAlign: 'left',
                      border: 'none',
                      background: value === m.id ? `${darkThemeColors.accentBlue}20` : 'transparent',
                      color: darkThemeColors.textPrimary,
                      fontSize: `${labelFontSize}px`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: `${Math.round(6 * scale)}px`,
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${darkThemeColors.accentBlue}15` }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = value === m.id ? `${darkThemeColors.accentBlue}20` : 'transparent' }}
                  >
                    <span>{value === m.id ? '✓' : ''}</span>
                    <span style={{ flex: 1 }}>{m.id}</span>
                  </button>
                ))}
              </div>
            )}

            {/* 第三方扩展模型 */}
            {(activeCategory === 'all' || activeCategory === 'thirdparty') && filteredThirdParty.length > 0 && (
              <div>
                {activeCategory === 'all' && (
                  <div style={{
                    padding: `${Math.round(4 * scale)}px ${listItemPaddingX}px`,
                    fontSize: `${categoryFontSize}px`,
                    fontWeight: 600,
                    color: darkThemeColors.accentGreen,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginTop: filteredBuiltin.length > 0 ? `${Math.round(4 * scale)}px` : 0,
                  }}>
                    {CATEGORY_LABELS.thirdparty}
                  </div>
                )}
                {filteredThirdParty.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { onChange(m.id); setOpen(false); setSearch('') }}
                    style={{
                      width: '100%',
                      padding: `${listItemPaddingY}px ${listItemPaddingX}px`,
                      textAlign: 'left',
                      border: 'none',
                      background: value === m.id ? `${darkThemeColors.accentGreen}20` : 'transparent',
                      color: darkThemeColors.textPrimary,
                      fontSize: `${labelFontSize}px`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: `${Math.round(6 * scale)}px`,
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${darkThemeColors.accentGreen}15` }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = value === m.id ? `${darkThemeColors.accentGreen}20` : 'transparent' }}
                  >
                    <span>{value === m.id ? '✓' : ''}</span>
                    <span style={{ flex: 1 }}>{m.id}</span>
                    <span style={{
                      fontSize: `${fontSizeSm}px`,
                      color: darkThemeColors.textSecondary,
                      backgroundColor: darkThemeColors.bgSecondary,
                      padding: `${Math.round(1 * scale)}px ${Math.round(6 * scale)}px`,
                      borderRadius: `${Math.round(4 * scale)}px`,
                    }}>
                      {getChannelName(m.provider)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* 空状态 */}
            {((activeCategory === 'builtin' && filteredBuiltin.length === 0) ||
              (activeCategory === 'thirdparty' && filteredThirdParty.length === 0) ||
              (activeCategory === 'all' && models.length === 0)) && (
              <div style={{
                padding: `${Math.round(24 * scale)}px`,
                textAlign: 'center',
                color: darkThemeColors.textSecondary,
                fontSize: `${fontSize}px`,
              }}>
                {models.length === 0
                  ? '暂无可用模型，请先在设置中获取模型列表'
                  : '没有找到匹配的模型'}
              </div>
            )}
          </div>
        </div>
      , document.body)}
    </div>
  )
}

// ── Props ───────────────────────────────────────────────────────
interface AIImageNodeProps {
  data: {
    label?: string
    prompt?: string
    model?: string
    size?: string
    count?: number
    imageUrl?: string
    onChange?: (key: string, value: any) => void
    width?: number
    [key: string]: any
  }
  selected?: boolean
}

// ── 组件 ───────────────────────────────────────────────────────
const AIImageNode: React.FC<AIImageNodeProps> = ({ data, selected = false }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // ── IME compose guard ─────────────────────────────────────
  // 防止中文输入法在拼音组合期间被 React 受控更新打断
  const isComposing = React.useRef(false)
  const [localPrompt, setLocalPrompt] = useState(data.prompt || '')

  // 上游 prompt 变化时同步（仅非组合状态）
  React.useEffect(() => {
    if (!isComposing.current) {
      setLocalPrompt(data.prompt || '')
    }
  }, [data.prompt])

  const flushPrompt = React.useCallback((value: string) => {
    data.onChange?.('prompt', value)
  }, [data])

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalPrompt(e.target.value)
    if (isComposing.current) return
    flushPrompt(e.target.value)
  }

  const handleCompositionStart = () => {
    isComposing.current = true
  }

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    isComposing.current = false
    flushPrompt(e.currentTarget.value)
    setLocalPrompt(e.currentTarget.value)
  }

  // ── scale factor based on node width ──────────────────
  // base = 240px → scale = 1. Clamp 0.8 ~ 1.5
  const scale = (() => {
    const w = data.width || 240
    return Math.max(0.8, Math.min(1.5, w / 240))
  })()

  // 每次渲染前重新读 localStorage，确保从设置页回来能刷新
  const availableModels = getSavedModels()

  const handleChange = (key: string, value: any) => {
    data.onChange?.(key, value)
  }

  const handleGenerate = useCallback(async () => {
    const prompt = (data.prompt || '').trim()
    if (!prompt) {
      setErrorMsg('请输入提示词')
      return
    }
    setIsGenerating(true)
    setErrorMsg(null)

    try {
      const modelId = data.model || ''

      // 直接从 localStorage 读取模型信息，避免 state 不同步
      const allModels = loadAvailableModels()
      const modelInfo = allModels.find(m => m.id === modelId)
      const provider = modelInfo?.provider || 'kukuda'
      const config = getConfigForProvider(provider)

      if (!config?.key) {
        const providerName = provider === 'kukuda' ? 'KuKuDa / OpenAI' : provider === 'comfly' ? 'Comfly' : '自定义通道'
        throw new Error(`请先在设置中配置 ${providerName} 的 API Key`)
      }

      const body: any = {
        model: modelId || undefined,
        prompt,
        n: data.count || 1,
      }
      if (data.size) body.size = data.size

      const res = await fetch('/api/ai/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, provider, body }),
      })

      const result = await res.json()
      if (result.code !== 0) {
        // Build detailed error message from upstream response
        let detail = result.message || '生成失败'
        const upstreamError = result.data?.error
        if (upstreamError) {
          const parts: string[] = [detail]
          if (upstreamError.type && upstreamError.type !== detail) {
            parts.push(`类型: ${upstreamError.type}`)
          }
          if (upstreamError.code) {
            parts.push(`代码: ${upstreamError.code}`)
          }
          detail = parts.join(' | ')
        }
        // Add troubleshooting hint for common errors
        if (detail.includes('model_price_error') || detail.includes('负载已饱和') || detail.includes('rate limit') || detail.includes('quota')) {
          detail += '\n\n💡 排查建议：当前模型上游服务负载较高或暂不可用，请稍后重试，或尝试更换其他图像生成模型。'
        }
        if (detail.includes('openai_error') || detail.includes('unsupported') || detail.includes('does not support')) {
          detail += '\n\n💡 排查建议：当前模型可能不支持图像生成，请尝试更换支持图像生成的模型（如 dall-e-3、stable-diffusion 等），或检查 API Key 是否有图像生成权限。'
        }
        throw new Error(detail)
      }

      const urls: string[] = []
      const d = result.data
      if (d?.data && Array.isArray(d.data)) {
        d.data.forEach((item: any) => {
          if (item.url) urls.push(item.url)
          else if (item.b64_json) urls.push(`data:image/png;base64,${item.b64_json}`)
        })
      }

      if (urls.length > 0) {
        handleChange('imageUrl', urls[0])
        handleChange('imageUrls', urls)
      } else {
        throw new Error('未获取到图片 URL')
      }
    } catch (err: any) {
      setErrorMsg(err.message || '生成失败')
    } finally {
      setIsGenerating(false)
    }
  }, [data.prompt, data.model, data.size, data.count])

  // ── 缩放后的样式值 ─────────────────────────────────────
  const fs = Math.round(11 * scale)   // fontSize base
  const fsSm = Math.round(10 * scale)
  const pad = Math.round(8 * scale)
  const padSm = Math.round(6 * scale)
  const padX = Math.round(4 * scale)
  const rad = Math.round(6 * scale)
  const radLg = Math.round(10 * scale)
  const gap = Math.round(6 * scale)
  const minH = Math.round(60 * scale)
  const minOut = Math.round(120 * scale)
  const maxOut = Math.round(200 * scale)
  const tipFontSize = Math.round(10 * scale)
  const tipPadding = Math.round(6 * scale)
  const tipRadius = Math.round(4 * scale)
  const fullBtnSize = Math.round(40 * scale)
  const fullBtnRadius = Math.round(20 * scale)
  const fullFontSize = Math.round(20 * scale)

  return (
    <>
      <BaseNode
        data={data}
        selected={selected}
        type="aiImage"
        label="AI绘图"
        icon="🎨"
        inputs={[{ id: 'prompt', label: '提示词', dataType: 'TEXT' as any }]}
        outputs={[{ id: 'image', label: '图片', dataType: 'IMAGE' as any }]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, flex: 1, overflow: 'hidden' }}>

          {/* 提示词输入 — flex:1 让 textarea 随节点高度自适应 */}
          <textarea
            value={localPrompt}
            onChange={handlePromptChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onBlur={(e) => {
              if (isComposing.current && data.onChange) {
                isComposing.current = false
                data.onChange('prompt', localPrompt)
              }
              e.currentTarget.style.borderColor = darkThemeColors.border
            }}
            placeholder="输入提示词..."
            className="nodrag nopan"
            style={{
              width: '100%',
              minHeight: `${minH}px`,
              flex: '1 1 auto',
              backgroundColor: darkThemeColors.bgTertiary,
              border: `1px solid ${darkThemeColors.border}`,
              borderRadius: `${rad}px`,
              color: darkThemeColors.textPrimary,
              fontSize: `${Math.round(12 * scale)}px`,
              padding: `${pad}px`,
              resize: 'none',
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = darkThemeColors.accentBlue }}
          />

          {/* 错误提示 */}
          {errorMsg && (
            <div style={{
              fontSize: `${fs}px`,
              color: darkThemeColors.accentRed,
              padding: `${padSm}px ${padX}px`,
              backgroundColor: `${darkThemeColors.accentRed}15`,
              borderRadius: `${tipRadius}px`,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: '1.5',
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* ── 工具条 ─────────────────────────────────────── */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: `${gap}px`,
            padding: `${padSm}px`,
            backgroundColor: darkThemeColors.bgTertiary,
            borderRadius: `${rad}px`,
          }}>
            {/* 模型选择器 */}
            <ModelSelector
              value={data.model || ''}
              onChange={model => handleChange('model', model)}
              scale={scale}
            />

            {/* 尺寸选择 */}
            <select
              value={data.size || '1024x1024'}
              onChange={e => handleChange('size', e.target.value)}
              style={{
                backgroundColor: darkThemeColors.bgTertiary,
                border: `1px solid ${darkThemeColors.border}`,
                borderRadius: `${rad}px`,
                color: darkThemeColors.textPrimary,
                fontSize: `${fs}px`,
                padding: `${padX}px ${padSm}px`,
                outline: 'none',
                cursor: 'pointer',
                flexShrink: 0,
                minWidth: `${Math.round(90 * scale)}px`,
              }}
              title="尺寸"
            >
              <option value="256x256">256×256</option>
              <option value="512x512">512×512</option>
              <option value="1024x1024">1024×1024</option>
              <option value="1792x1024">1792×1024</option>
            </select>

            {/* 张数选择 */}
            <select
              value={data.count || 1}
              onChange={e => handleChange('count', parseInt(e.target.value))}
              style={{
                backgroundColor: darkThemeColors.bgTertiary,
                border: `1px solid ${darkThemeColors.border}`,
                borderRadius: `${rad}px`,
                color: darkThemeColors.textPrimary,
                fontSize: `${fs}px`,
                padding: `${padX}px ${padSm}px`,
                outline: 'none',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="张数"
            >
              <option value={1}>1张</option>
              <option value={2}>2张</option>
              <option value={4}>4张</option>
            </select>

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${Math.round(4 * scale)}px`,
                padding: `${padX}px ${pad}px`,
                backgroundColor: isGenerating ? darkThemeColors.bgSecondary : darkThemeColors.accentBlue,
                border: 'none',
                borderRadius: `${rad}px`,
                color: darkThemeColors.textPrimary,
                fontSize: `${fs}px`,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                marginLeft: 'auto',
              }}
            >
              <span>{isGenerating ? '⏳' : '⚡'}</span>
              <span>{isGenerating ? '生成中...' : '生成'}</span>
            </button>
          </div>

          {/* 图片输出区域 */}
          <div
            style={{
              borderRadius: `${rad}px`,
              overflow: 'hidden',
              border: `1px solid ${darkThemeColors.border}`,
              backgroundColor: darkThemeColors.bgTertiary,
              minHeight: `${minOut}px`,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: data.imageUrl ? 'pointer' : 'default',
              position: 'relative',
            }}
            onDoubleClick={() => { if (data.imageUrl) setIsFullscreen(true) }}
          >
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt="Generated"
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: `${maxOut}px`, objectFit: 'contain' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${Math.round(8 * scale)}px`, color: darkThemeColors.textSecondary, fontSize: `${fs}px` }}>
                <span style={{ fontSize: `${Math.round(24 * scale)}px` }}>🖼️</span>
                <span>output</span>
              </div>
            )}

            {data.imageUrl && (
              <div style={{
                position: 'absolute', bottom: `${Math.round(4 * scale)}px`, right: `${Math.round(8 * scale)}px`,
                fontSize: `${tipFontSize}px`, color: darkThemeColors.textSecondary,
                backgroundColor: `${darkThemeColors.bgSecondary}cc`,
                padding: `${Math.round(2 * scale)}px ${tipPadding}px`, borderRadius: `${tipRadius}px`,
              }}>
                双击全屏预览
              </div>
            )}
          </div>
        </div>
      </BaseNode>

      {/* 全屏预览 */}
      {isFullscreen && data.imageUrl && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, cursor: 'zoom-out',
          }}
          onClick={() => setIsFullscreen(false)}
        >
          <img
            src={data.imageUrl}
            alt="Generated Fullscreen"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: `${radLg}px` }}
          />
          <button
            onClick={e => { e.stopPropagation(); setIsFullscreen(false) }}
            style={{
              position: 'absolute', top: `${Math.round(20 * scale)}px`, right: `${Math.round(20 * scale)}px`,
              backgroundColor: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: '50%', width: `${fullBtnSize}px`, height: `${fullBtnSize}px`,
              color: darkThemeColors.textPrimary, fontSize: `${fullFontSize}px`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}

export default AIImageNode
