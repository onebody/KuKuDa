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

/** 根据 provider 获取对应的 config（支持自定义通道，兼容旧数据格式） */
function getConfigForProvider(provider: string): ProviderConfig | null {
  const settings = getSavedSettings()
  if (provider === 'kukuda') return settings.kukuda
  if (provider === 'comfly') return settings.comfly
  if (provider.startsWith('custom-')) {
    const channelId = provider.replace(/^custom-/, '')
    const ch = settings.customChannels.find(c => c.id === channelId)
    if (ch) return { url: ch.url, key: ch.key }
  }
  // 兜底：兼容旧数据格式（provider 直接是 channelId，没有 custom- 前缀）
  const ch = settings.customChannels.find(c => c.id === provider)
  if (ch) return { url: ch.url, key: ch.key }
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
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'builtin' | 'thirdparty'>('all')
  const [models, setModels] = useState<ModelInfo[]>(() => getSavedModels())
  const buttonRef = useRef<HTMLButtonElement>(null)
  const portalPanelRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 280 })

  // 打开时重新从 localStorage 加载模型列表（刷新），并计算面板位置
  useEffect(() => {
    if (open && buttonRef.current) {
      setModels(getSavedModels())
      const rect = buttonRef.current.getBoundingClientRect()
      setPanelPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 280),
      })
    }
  }, [open])

  // 面板打开期间，监听 scroll/resize 实时更新面板位置
  useEffect(() => {
    if (!open) return
    const updatePos = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setPanelPos(prev => ({
          ...prev,
          top: rect.bottom + 4,
          left: rect.left,
          width: Math.max(rect.width, 280),
        }))
      }
    }
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [open])

  // 监听 localStorage 变化（其他标签页或组件修改时自动刷新模型列表）
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'workflow_api_models' || e.key === 'workflow_api_settings') {
        setModels(getSavedModels())
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // 面板打开时自动聚焦搜索框
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [open])

  // 点击外部关闭（同时检查触发按钮和下拉面板）
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      const clickedButton = buttonRef.current?.contains(target)
      const clickedPanel = portalPanelRef.current?.contains(target)
      if (!clickedButton && !clickedPanel) {
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

  // ── 固定样式（不再随节点缩放）──────────────────────
  const fontSize = 11
  const fontSizeSm = 10
  const paddingX = 8
  const paddingY = 6
  const borderRadius = 6
  const tabPaddingY = 3
  const tabPaddingX = 10
  const tabRadius = 12
  const listItemPaddingY = 6
  const listItemPaddingX = 12
  const panelWidth = 280
  const panelMaxH = 360
  const searchPaddingX = 6
  const searchPaddingY = 6
  const categoryFontSize = 10
  const labelFontSize = 12

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: '120px' }}>
      {/* 触发按钮 */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '4px 8px',
          backgroundColor: darkThemeColors.bgSecondary,
          border: `1px solid ${darkThemeColors.border}`,
          borderRadius: '6px',
          color: value ? darkThemeColors.textPrimary : darkThemeColors.textSecondary,
          fontSize: '11px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
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
          ref={portalPanelRef}
          style={{
            position: 'fixed',
            top: `${panelPos.top}px`,
            left: `${panelPos.left}px`,
            zIndex: 99999,
            width: `${panelPos.width}px`,
            maxHeight: `${panelMaxH}px`,
            backgroundColor: darkThemeColors.bgPrimary,
            border: `1px solid ${darkThemeColors.border}`,
            borderRadius: '10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* 搜索框 */}
          <div style={{ padding: '6px', borderBottom: `1px solid ${darkThemeColors.border}` }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: darkThemeColors.bgSecondary,
              borderRadius: '6px',
              padding: '0 6px',
            }}>
              <span style={{ fontSize: '11px', color: darkThemeColors.textSecondary }}>🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索模型..."
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: darkThemeColors.textPrimary,
                  fontSize: '11px',
                  padding: '6px 0',
                  outline: 'none',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', color: darkThemeColors.textSecondary, cursor: 'pointer', fontSize: '10px', padding: '2px' }}
                >✕</button>
              )}
            </div>
          </div>

          {/* 分类标签 */}
          <div style={{
            display: 'flex',
            gap: '4px',
            padding: '3px 10px',
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
                  padding: '3px 10px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '10px',
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
          <div style={{ overflowY: 'auto', flex: 1, padding: '6px 0' }}>
            {/* 系统内置模型 */}
            {(activeCategory === 'all' || activeCategory === 'builtin') && filteredBuiltin.length > 0 && (
              <div>
                {activeCategory === 'all' && (
                  <div style={{
                    padding: `4px ${listItemPaddingX}px`,
                    fontSize: '10px',
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
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
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
                    padding: `4px ${listItemPaddingX}px`,
                    fontSize: '10px',
                    fontWeight: 600,
                    color: darkThemeColors.accentGreen,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginTop: filteredBuiltin.length > 0 ? '4px' : 0,
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
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${darkThemeColors.accentGreen}15` }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = value === m.id ? `${darkThemeColors.accentGreen}20` : 'transparent' }}
                  >
                    <span>{value === m.id ? '✓' : ''}</span>
                    <span style={{ flex: 1 }}>{m.id}</span>
                    <span style={{
                      fontSize: '10px',
                      color: darkThemeColors.textSecondary,
                      backgroundColor: darkThemeColors.bgSecondary,
                      padding: '1px 6px',
                      borderRadius: '4px',
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
                padding: '24px',
                textAlign: 'center',
                color: darkThemeColors.textSecondary,
                fontSize: '11px',
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
      let provider = modelInfo?.provider || 'kukuda'
      // 兼容旧数据格式：自定义通道 provider 缺少 custom- 前缀
      if (provider !== 'kukuda' && provider !== 'comfly' && !provider.startsWith('custom-')) {
        provider = `custom-${provider}`
      }
      const config = getConfigForProvider(provider)

      if (!config?.key) {
        // 构建详细诊断信息，帮助用户定位配置问题
        const settings = getSavedSettings()
        const diagnostics: string[] = []
        diagnostics.push(`检测到的 provider: ${provider}`)
        diagnostics.push(`原始 provider: ${modelInfo?.provider || '无'}`)
        diagnostics.push(`模型 ID: ${modelId}`)
        const isCustomChannel = provider !== 'kukuda' && provider !== 'comfly'
        if (isCustomChannel) {
          const chId = provider.startsWith('custom-') ? provider.replace(/^custom-/, '') : provider
          const ch = settings.customChannels.find(c => c.id === chId)
          diagnostics.push(`通道 ID: ${chId}`)
          diagnostics.push(`匹配到的通道: ${ch ? ch.name : '未找到'}`)
          diagnostics.push(`通道数量: ${settings.customChannels.length}`)
          if (settings.customChannels.length > 0) {
            diagnostics.push(`可用通道: ${settings.customChannels.map(c => `"${c.name}" (id=${c.id})`).join(', ')}`)
          }
          if (ch) {
            diagnostics.push(`通道 Key 状态: ${ch.key ? '已配置' : '未配置（空）'}`)
            diagnostics.push(`通道 URL: ${ch.url || '未配置'}`)
          }
        }
        diagnostics.push('')
        diagnostics.push('💡 请检查：')
        diagnostics.push('1. 是否已在「设置 → API 设置与模型配置」中点击「保存并关闭」')
        diagnostics.push('2. 自定义通道的 API Key 是否已填写且不为空')
        diagnostics.push('3. 是否已点击「获取模型」按钮获取该通道的模型列表')
        diagnostics.push('4. 如曾使用旧版本，建议重新点击「获取模型」刷新模型列表')
        const providerName = provider === 'kukuda' ? 'KuKuDa / OpenAI' : provider === 'comfly' ? 'Comfly' : '自定义通道'
        throw new Error(`请先在设置中配置 ${providerName} 的 API Key\n\n${diagnostics.join('\n')}`)
      }

      const body: any = {
        model: modelId || undefined,
        prompt,
        n: data.count || 1,
      }
      if (data.size) body.size = data.size

      // 根据选择的 provider 配置，直接调用其 API（OpenAI 兼容协议）
      const requestUrl = config.url.replace(/\/$/, '') + '/v1/images/generations'

      const res = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.key}`,
        },
        body: JSON.stringify(body),
      })

      // 处理 HTTP 错误
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        let detail = errData.error?.message || `HTTP ${res.status}: 生成失败`
        // 针对各类上游错误给出友好提示
        if (detail.includes('new_api_error') || detail.includes('无可用渠道') || detail.includes('distributor')) {
          detail += '\n\n💡 排查建议：当前模型在该渠道下暂不可用，请尝试更换其他图像生成模型（如 dall-e-3、midjourney、stable-diffusion 等）。'
        }
        if (detail.includes('model_price_error') || detail.includes('负载已饱和') || detail.includes('rate limit') || detail.includes('quota')) {
          detail += '\n\n💡 排查建议：当前模型上游服务负载较高或暂不可用，请稍后重试，或尝试更换其他图像生成模型。'
        }
        if (detail.includes('openai_error') || detail.includes('unsupported') || detail.includes('does not support')) {
          detail += '\n\n💡 排查建议：当前模型可能不支持图像生成，请尝试更换支持图像生成的模型（如 dall-e-3、stable-diffusion 等），或检查 API Key 是否有图像生成权限。'
        }
        throw new Error(detail)
      }

      const result = await res.json()

      // OpenAI 标准响应格式：{ data: [{ url, b64_json }], created: number }
      const urls: string[] = []
      if (result.data && Array.isArray(result.data)) {
        result.data.forEach((item: any) => {
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

  // ── 固定样式（不再随节点缩放）──────────────────────────
  const fs = 11
  const fsSm = 10
  const pad = 8
  const padSm = 6
  const padX = 4
  const rad = 6
  const gap = 6

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

          {/* 提示词输入 — flex 自适应，宽度/高度随节点变化 */}
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
              minHeight: '60px',
              maxHeight: '140px',
              flex: '0 1 auto',
              backgroundColor: darkThemeColors.bgTertiary,
              border: `1px solid ${darkThemeColors.border}`,
              borderRadius: '6px',
              color: darkThemeColors.textPrimary,
              fontSize: '12px',
              padding: '8px',
              resize: 'none',
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
              overflowY: 'auto',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = darkThemeColors.accentBlue }}
          />

          {/* 错误提示 */}
          {errorMsg && (
            <div style={{
              fontSize: '11px',
              color: darkThemeColors.accentRed,
              padding: '6px 4px',
              backgroundColor: `${darkThemeColors.accentRed}15`,
              borderRadius: '4px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: '1.5',
              flex: '0 0 auto',
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* ── 工具条（固定大小，不随节点缩放）────────── */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px',
            padding: '6px',
            backgroundColor: darkThemeColors.bgTertiary,
            borderRadius: '6px',
            flex: '0 0 auto',
          }}>
            {/* 模型选择器 */}
            <ModelSelector
              value={data.model || ''}
              onChange={model => handleChange('model', model)}
            />

            {/* 尺寸选择 */}
            <select
              value={data.size || '1024x1024'}
              onChange={e => handleChange('size', e.target.value)}
              style={{
                backgroundColor: darkThemeColors.bgTertiary,
                border: `1px solid ${darkThemeColors.border}`,
                borderRadius: '6px',
                color: darkThemeColors.textPrimary,
                fontSize: '11px',
                padding: '4px 6px',
                outline: 'none',
                cursor: 'pointer',
                flexShrink: 0,
                minWidth: '90px',
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
                borderRadius: '6px',
                color: darkThemeColors.textPrimary,
                fontSize: '11px',
                padding: '4px 6px',
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
                gap: '4px',
                padding: '4px 8px',
                backgroundColor: isGenerating ? darkThemeColors.bgSecondary : darkThemeColors.accentBlue,
                border: 'none',
                borderRadius: '6px',
                color: darkThemeColors.textPrimary,
                fontSize: '11px',
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

          {/* 图片输出区域 — 高度受限，不可随意拖动 */}
          <div
            style={{
              borderRadius: '6px',
              overflow: 'hidden',
              border: `1px solid ${darkThemeColors.border}`,
              backgroundColor: darkThemeColors.bgTertiary,
              minHeight: '120px',
              maxHeight: '220px',
              flex: '1 1 auto',
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
                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: darkThemeColors.textSecondary, fontSize: '11px' }}>
                <span style={{ fontSize: '24px' }}>🖼️</span>
                <span>output</span>
              </div>
            )}

            {data.imageUrl && (
              <div style={{
                position: 'absolute', bottom: '4px', right: '8px',
                fontSize: '10px', color: darkThemeColors.textSecondary,
                backgroundColor: `${darkThemeColors.bgSecondary}cc`,
                padding: '2px 6px', borderRadius: '4px',
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
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '10px' }}
          />
          <button
            onClick={e => { e.stopPropagation(); setIsFullscreen(false) }}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              backgroundColor: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: '50%', width: '40px', height: '40px',
              color: darkThemeColors.textPrimary, fontSize: '20px',
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
