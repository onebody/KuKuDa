import React from 'react'
import BaseNode, { BaseNodeProps } from './BaseNode'
import { darkThemeColors } from '../../../styles/theme'

interface LLMNodeProps {
  data: {
    label?: string
    model?: string
    prompt?: string
    temperature?: number
    maxTokens?: number
    onChange?: (key: string, value: any) => void
    [key: string]: any
  }
  selected?: boolean
}

const LLMNode: React.FC<LLMNodeProps> = ({ data, selected = false }) => {
  const handleChange = (key: string, value: any) => {
    if (data.onChange) {
      data.onChange(key, value)
    }
  }

  return (
    <BaseNode
      data={data}
      selected={selected}
      type="llmCall"
      label="LLM 调用"
      icon="🤖"
      inputs={[{ id: 'prompt', label: '提示词' }]}
      outputs={[{ id: 'response', label: '响应' }]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
            value={data.model || 'gpt-4'}
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
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="claude-3">Claude 3</option>
            <option value="wenxin">文心一言</option>
          </select>
        </div>

        {/* Temperature */}
        <div>
          <label style={{ 
            fontSize: '11px', 
            color: darkThemeColors.textSecondary,
            display: 'block',
            marginBottom: '4px',
          }}>
            温度: {data.temperature || 0.7}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={data.temperature || 0.7}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: darkThemeColors.accentBlue,
            }}
          />
        </div>

        {/* Max Tokens */}
        <div>
          <label style={{ 
            fontSize: '11px', 
            color: darkThemeColors.textSecondary,
            display: 'block',
            marginBottom: '4px',
          }}>
            最大令牌
          </label>
          <input
            type="number"
            value={data.maxTokens || 2048}
            onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
            style={{
              width: '100%',
              backgroundColor: darkThemeColors.bgTertiary,
              border: `1px solid ${darkThemeColors.border}`,
              borderRadius: '6px',
              color: darkThemeColors.textPrimary,
              fontSize: '12px',
              padding: '6px 8px',
              outline: 'none',
            }}
          />
        </div>
      </div>
    </BaseNode>
  )
}

export default LLMNode
