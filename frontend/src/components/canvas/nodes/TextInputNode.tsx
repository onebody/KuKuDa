import React from 'react'
import BaseNode, { BaseNodeProps } from './BaseNode'
import { darkThemeColors } from '../../../styles/theme'

interface TextInputNodeProps {
  data: {
    label?: string
    text?: string
    onChange?: (value: string) => void
    [key: string]: any
  }
  selected?: boolean
}

const TextInputNode: React.FC<TextInputNodeProps> = ({ data, selected = false }) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (data.onChange) {
      data.onChange(e.target.value)
    }
  }

  return (
    <BaseNode
      data={data}
      selected={selected}
      type="textInput"
      label="文本输入"
      icon="📝"
      outputs={[{ id: 'text', label: '文本' }]}
    >
      <div style={{ marginTop: '8px' }}>
        <textarea
          value={data.text || ''}
          onChange={handleTextChange}
          placeholder="输入文本..."
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
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = darkThemeColors.accentBlue
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = darkThemeColors.border
          }}
        />
      </div>
    </BaseNode>
  )
}

export default TextInputNode
