import React from 'react'
import BaseNode, { BaseNodeProps } from './BaseNode'
import { darkThemeColors } from '../../../styles/theme'

interface ImageGenNodeProps {
  data: {
    label?: string
    prompt?: string
    model?: string
    size?: string
    imageUrl?: string
    onChange?: (key: string, value: any) => void
    [key: string]: any
  }
  selected?: boolean
}

const ImageGenNode: React.FC<ImageGenNodeProps> = ({ data, selected = false }) => {
  const handleChange = (key: string, value: any) => {
    if (data.onChange) {
      data.onChange(key, value)
    }
  }

  return (
    <BaseNode
      data={data}
      selected={selected}
      type="imageGeneration"
      label="图片生成"
      icon="🎨"
      inputs={[{ id: 'prompt', label: '提示词' }]}
      outputs={[{ id: 'image', label: '图片' }]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Prompt Input */}
        <div>
          <label style={{ 
            fontSize: '11px', 
            color: darkThemeColors.textSecondary,
            display: 'block',
            marginBottom: '4px',
          }}>
            提示词
          </label>
          <textarea
            value={data.prompt || ''}
            onChange={(e) => handleChange('prompt', e.target.value)}
            placeholder="输入提示词..."
            style={{
              width: '100%',
              minHeight: '50px',
              backgroundColor: darkThemeColors.bgTertiary,
              border: `1px solid ${darkThemeColors.border}`,
              borderRadius: '6px',
              color: darkThemeColors.textPrimary,
              fontSize: '12px',
              padding: '8px',
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = darkThemeColors.accentBlue
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = darkThemeColors.border
            }}
          />
        </div>

        {/* Model Selection */}
        <div>
          <label style={{ 
            fontSize: '11px', 
            color: darkThemeColors.textSecondary,
            display: 'block',
            marginBottom: '4px',
          }}>
            模型
          </label>
          <select
            value={data.model || 'dall-e-3'}
            onChange={(e) => handleChange('model', e.target.value)}
            style={{
              width: '100%',
              backgroundColor: darkThemeColors.bgTertiary,
              border: `1px solid ${darkThemeColors.border}`,
              borderRadius: '6px',
              color: darkThemeColors.textPrimary,
              fontSize: '12px',
              padding: '6px 8px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="dall-e-3">DALL-E 3</option>
            <option value="dall-e-2">DALL-E 2</option>
            <option value="stable-diffusion">Stable Diffusion</option>
            <option value="midjourney">Midjourney</option>
          </select>
        </div>

        {/* Size Selection */}
        <div>
          <label style={{ 
            fontSize: '11px', 
            color: darkThemeColors.textSecondary,
            display: 'block',
            marginBottom: '4px',
          }}>
            尺寸
          </label>
          <select
            value={data.size || '1024x1024'}
            onChange={(e) => handleChange('size', e.target.value)}
            style={{
              width: '100%',
              backgroundColor: darkThemeColors.bgTertiary,
              border: `1px solid ${darkThemeColors.border}`,
              borderRadius: '6px',
              color: darkThemeColors.textPrimary,
              fontSize: '12px',
              padding: '6px 8px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="1024x1024">1024×1024</option>
            <option value="1024x1792">1024×1792</option>
            <option value="1792x1024">1792×1024</option>
            <option value="512x512">512×512</option>
          </select>
        </div>

        {/* Generated Image Preview */}
        {data.imageUrl && (
          <div style={{
            marginTop: '8px',
            borderRadius: '6px',
            overflow: 'hidden',
            border: `1px solid ${darkThemeColors.border}`,
          }}>
            <img 
              src={data.imageUrl} 
              alt="Generated" 
              style={{ 
                width: '100%', 
                height: 'auto',
                display: 'block',
              }} 
            />
          </div>
        )}
      </div>
    </BaseNode>
  )
}

export default ImageGenNode
