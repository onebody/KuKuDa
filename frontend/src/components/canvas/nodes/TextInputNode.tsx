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
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  // 防抖保存：输入停止 500ms 后自动保存
  const debouncedSave = useCallback((value: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (data?.onChange) {
        data.onChange('text', value)
      }
    }, 500)
  }, [data])

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  // 同步外部数据变化
  useEffect(() => {
    if (data?.text !== undefined && data.text !== localText && !isComposing.current) {
      setLocalText(data.text)
    }
  }, [data?.text])

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value)
    // 输入时触发防抖保存
    if (!isComposing.current) {
      debouncedSave(e.target.value)
    }
  }, [debouncedSave])

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
    // 失焦时立即保存（取消防抖，直接保存）
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
      saveTimer.current = null
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
