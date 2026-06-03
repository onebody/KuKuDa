import React, { useState, useCallback, useEffect, useRef } from 'react'
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
  // 主来源
  const fromStore = loadAvailableModels()
  if (fromStore.length > 0) return fromStore

  // Fallback：从 settings 中读取自定义通道的 models（兼容旧数据）
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
function getSavedSettings(): {
  kukuda: ProviderConfig
  comfly: ProviderConfig
  customChannels: CustomChannelInfo[]
} {
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
  // 自定义通道：provider 格式为 "custom-{id}"
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
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'builtin' | 'thirdparty'>('all')
  const [models, setModels] = useState<ModelInfo[]>(() => getSavedModels())
  const panelRef = useRef<HTMLDivElement>(null)

  // 打开时重新从 localStorage 加载模型列表（刷新）
  useEffect(() => {
    if (open) {
      setModels(getSavedModels())
    }
  }, [open])

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

  return (
    <div ref={panelRef} style={{ position: 'relative', flex: 1, minWidth: '120px' }}>
      {/* 触发按钮 */}
      <button
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

      {/* 弹出面板 */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 100,
            width: '280px',
            maxHeight: '360px',
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
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${darkThemeColors.border}` }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: darkThemeColors.bgSecondary,
              borderRadius: '6px',
              padding: '0 8px',
            }}>
              <span style={{ fontSize: '12px', color: darkThemeColors.textSecondary }}>🔍</span>
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
                  fontSize: '12px',
                  padding: '6px 0',
                  outline: 'none',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', color: darkThemeColors.textSecondary, cursor: 'pointer', fontSize: '11px', padding: '2px' }}
                >✕</button>
              )}
            </div>
          </div>

          {/* 分类标签 */}
          <div style={{
            display: 'flex',
            gap: '4px',
            padding: '8px 12px',
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
                  fontSize: '11px',
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
                    padding: '4px 12px',
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
                      padding: '6px 12px',
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
                    padding: '4px 12px',
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
                      padding: '6px 12px',
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
                fontSize: '12px',
              }}>
                {models.length === 0
                  ? '暂无可用模型，请先在设置中获取模型列表'
                  : '没有找到匹配的模型'}
              </div>
            )}
          </div>
        </div>
      )}
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
    [key: string]: any
  }
  selected?: boolean
}

// ── 组件 ───────────────────────────────────────────────────────
const AIImageNode: React.FC<AIImageNodeProps> = ({ data, selected = false }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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
        body: JSON.stringify({ config, body }),
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

  // ── 样式 ─────────────────────────────────────────────────
  const selectStyle: React.CSSProperties = {
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
  }

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* 提示词输入 */}
          <textarea
            value={data.prompt || ''}
            onChange={e => handleChange('prompt', e.target.value)}
            placeholder="输入提示词..."
            style={{
              width: '100%',
              minHeight: '60px',
              backgroundColor: darkThemeColors.bgTertiary,
              border: `1px solid ${darkThemeColors.border}`,
              borderRadius: '6px',
              color: darkThemeColors.textPrimary,
              fontSize: '12px',
              padding: '8px',
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = darkThemeColors.accentBlue }}
            onBlur={e => { e.currentTarget.style.borderColor = darkThemeColors.border }}
          />

          {/* 错误提示 */}
          {errorMsg && (
            <div style={{
              fontSize: '11px',
              color: darkThemeColors.accentRed,
              padding: '6px 8px',
              backgroundColor: `${darkThemeColors.accentRed}15`,
              borderRadius: '4px',
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
            gap: '6px',
            padding: '6px',
            backgroundColor: darkThemeColors.bgTertiary,
            borderRadius: '6px',
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
              style={selectStyle}
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
              style={selectStyle}
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
                padding: '4px 10px',
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

          {/* 图片输出区域 */}
          <div
            style={{
              borderRadius: '6px',
              overflow: 'hidden',
              border: `1px solid ${darkThemeColors.border}`,
              backgroundColor: darkThemeColors.bgTertiary,
              minHeight: '120px',
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
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '200px', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: darkThemeColors.textSecondary, fontSize: '12px' }}>
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
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }}
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
