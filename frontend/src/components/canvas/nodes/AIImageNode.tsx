import React, { useState, useCallback } from 'react'
import BaseNode from './BaseNode'
import { darkThemeColors } from '../../../styles/theme'

interface AIImageNodeProps {
  data: {
    label?: string
    prompt?: string
    model?: string
    auto?: boolean
    hd?: string
    count?: number
    mode?: string
    imageUrl?: string
    onChange?: (key: string, value: any) => void
    [key: string]: any
  }
  selected?: boolean
}

const AIImageNode: React.FC<AIImageNodeProps> = ({ data, selected = false }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleChange = (key: string, value: any) => {
    if (data.onChange) {
      data.onChange(key, value)
    }
  }

  const handleGenerate = useCallback(() => {
    setIsGenerating(true)
    // Simulate generation - in real implementation this would call the backend
    setTimeout(() => {
      setIsGenerating(false)
      handleChange('imageUrl', 'https://via.placeholder.com/400x400/1a1a2e/4a9eff?text=AI+Generated+Image')
    }, 2000)
  }, [data.prompt])

  const models = ['Nano Banana Pro', 'DALL-E 3', 'Stable Diffusion', 'Midjourney']
  const hdOptions = ['SD', 'HD', 'FHD']
  const countOptions = [1, 2, 4]
  const modeOptions = ['同步', '异步']

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
  }

  const checkboxStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: darkThemeColors.textSecondary,
    cursor: 'pointer',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  }

  return (
    <>
      <BaseNode
        data={data}
        selected={selected}
        type="aiImage"
        label="AI绘图"
        icon="🎨"
        inputs={[{ id: 'prompt', label: '提示词' }]}
        outputs={[{ id: 'image', label: '图片' }]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Prompt Input */}
          <div>
            <textarea
              value={data.prompt || ''}
              onChange={(e) => handleChange('prompt', e.target.value)}
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
              onFocus={(e) => {
                e.currentTarget.style.borderColor = darkThemeColors.accentBlue
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = darkThemeColors.border
              }}
            />
          </div>

          {/* Toolbar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px',
            padding: '6px',
            backgroundColor: darkThemeColors.bgTertiary,
            borderRadius: '6px',
          }}>
            {/* Model Select */}
            <select
              value={data.model || 'Nano Banana Pro'}
              onChange={(e) => handleChange('model', e.target.value)}
              style={selectStyle}
              title="模型"
            >
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Auto Checkbox */}
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                checked={data.auto || false}
                onChange={(e) => handleChange('auto', e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Auto
            </label>

            {/* HD Select */}
            <select
              value={data.hd || 'HD'}
              onChange={(e) => handleChange('hd', e.target.value)}
              style={selectStyle}
              title="画质"
            >
              {hdOptions.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>

            {/* Count Select */}
            <select
              value={data.count || 1}
              onChange={(e) => handleChange('count', parseInt(e.target.value))}
              style={selectStyle}
              title="张数"
            >
              {countOptions.map((c) => (
                <option key={c} value={c}>{c}张</option>
              ))}
            </select>

            {/* Mode Select */}
            <select
              value={data.mode || '异步'}
              onChange={(e) => handleChange('mode', e.target.value)}
              style={selectStyle}
              title="模式"
            >
              {modeOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Generate Button */}
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
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.backgroundColor = '#6bb3ff'
                }
              }}
              onMouseLeave={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.backgroundColor = darkThemeColors.accentBlue
                }
              }}
            >
              <span>{isGenerating ? '⏳' : '⚡'}</span>
              <span>{isGenerating ? '生成中...' : '生成'}</span>
            </button>
          </div>

          {/* Image Output Area */}
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
            onDoubleClick={() => {
              if (data.imageUrl) {
                setIsFullscreen(true)
              }
            }}
          >
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt="Generated"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  maxHeight: '200px',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                color: darkThemeColors.textSecondary,
                fontSize: '12px',
              }}>
                <span style={{ fontSize: '24px' }}>🖼️</span>
                <span>output</span>
              </div>
            )}

            {/* Hint */}
            {data.imageUrl && (
              <div style={{
                position: 'absolute',
                bottom: '4px',
                right: '8px',
                fontSize: '10px',
                color: darkThemeColors.textSecondary,
                backgroundColor: `${darkThemeColors.bgSecondary}cc`,
                padding: '2px 6px',
                borderRadius: '4px',
              }}>
                双击全屏预览
              </div>
            )}
          </div>
        </div>
      </BaseNode>

      {/* Fullscreen Image Modal */}
      {isFullscreen && data.imageUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'zoom-out',
          }}
          onClick={() => setIsFullscreen(false)}
        >
          <img
            src={data.imageUrl}
            alt="Generated Fullscreen"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsFullscreen(false)
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: darkThemeColors.textPrimary,
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
