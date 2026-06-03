import React, { useState, useCallback, useEffect, useRef } from 'react'
import BaseNode from './BaseNode'
import { darkThemeColors } from '../../../styles/theme'

interface TextInputNodeProps {
  data?: any
  selected?: boolean
}

const TextInputNode: React.FC<TextInputNodeProps> = ({ data = {}, selected = false }) => {
  const [localText, setLocalText] = useState(data?.text || '')
  const isComposing = useRef(false)

  // 同步外部数据变化
  useEffect(() => {
    if (data?.text !== undefined && data.text !== localText && !isComposing.current) {
      setLocalText(data.text)
    }
  }, [data?.text])

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value)
  }, [])

  const handleCompositionStart = useCallback(() => {
    isComposing.current = true
  }, [])

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLTextAreaElement>) => {
    isComposing.current = false
    setLocalText(e.currentTarget.value)
    if (data?.onChange) {
      data.onChange('text', e.currentTarget.value)
    }
  }, [data])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (isComposing.current) {
      isComposing.current = false
    }
    if (data?.onChange && e.target.value !== data?.text) {
      data.onChange('text', e.target.value)
    }
  }, [data])

  return (
    <BaseNode
      data={data}
      selected={selected}
      type="textInput"
      label="文本输入"
      icon="📝"
      outputs={[{ id: 'text', label: '文本', dataType: 'TEXT' }]}
    >
      <textarea
        value={localText}
        onChange={handleTextChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onBlur={handleBlur}
        placeholder="输入文本内容..."
        style={{
          width: '100%',
          flex: 1,
          minHeight: '60px',
          backgroundColor: darkThemeColors.bgTertiary,
          border: `1px solid ${darkThemeColors.border}`,
          borderRadius: '6px',
          padding: '8px',
          color: darkThemeColors.textPrimary,
          fontSize: '13px',
          fontFamily: 'inherit',
          resize: 'none',
          outline: 'none',
          lineHeight: 1.5,
        }}
      />
    </BaseNode>
  )
}

export default TextInputNode
