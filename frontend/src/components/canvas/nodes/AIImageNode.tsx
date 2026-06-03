import React, { useState, useCallback, useEffect } from 'react'
import BaseNode from './BaseNode'
import { darkThemeColors } from '../../../styles/theme'

// ── localStorage 读取 ───────────────────────────────────────
interface ModelInfo {
  id: string
  provider: string
}

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

/** 读取已获取的模型列表 */
function getSavedModels(): ModelInfo[] {
  try {
    const raw = localStorage.getItem('workflow_api_models')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
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

const providerLabels: Record<string, string> = {
  kukuda: 'KuKuDa / OpenAI',
  comfly: '第三方',
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

      const modelInfo = availableModels.find(m => m.id === modelId)
      const provider = modelInfo?.provider || 'kukuda'
      const config = getConfigForProvider(provider)

      if (!config?.key) {
        throw new Error(`请先在设置中配置 ${providerLabels[provider] || provider} 的 API Key`)
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
              {/* 模型选择 */}
            <select
              value={data.model || ''}
              onChange={e => handleChange('model', e.target.value)}
              style={selectStyle}
              title="模型"
            >
              <option value="">选择模型</option>

              {/* Group 1: KuKuDa / OpenAI */}
              {(() => {
                const models = availableModels.filter(m => m.provider === 'kukuda')
                if (models.length === 0) return null
                return (
                  <optgroup key="kukuda" label={providerLabels['kukuda'] || 'KuKuDa / OpenAI'}>
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.id}</option>
                    ))}
                  </optgroup>
                )
              })()}

              {/* Group 2: 第三方 — comfly + 所有自定义通道 */}
              {(() => {
                const thirdPartyModels = availableModels.filter(m => {
                  if (m.provider === 'comfly') return true
                  return m.provider.startsWith('custom-')
                })
                if (thirdPartyModels.length === 0) return null
                return (
                  <optgroup key="thirdparty" label="第三方">
                    {/* comfly 模型 */}
                    {availableModels
                      .filter(m => m.provider === 'comfly')
                      .map(m => (
                        <option key={m.id} value={m.id}>{m.id}</option>
                      ))}
                    {/* 自定义通道模型 */}
                    {getCustomChannels().map(ch => {
                      const models = availableModels.filter(m => m.provider === `custom-${ch.id}`)
                      if (models.length === 0) return null
                      return models.map(m => (
                        <option key={m.id} value={m.id}>🔌 {ch.name} / {m.id}</option>
                      ))
                    })}
                  </optgroup>
                )
              })()}

              {availableModels.length === 0 && (
                <option value="" disabled>请在设置中获取模型列表</option>
              )}
            </select>

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
