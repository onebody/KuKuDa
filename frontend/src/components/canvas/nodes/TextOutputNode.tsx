import React from 'react'
import BaseNode, { BaseNodeProps } from './BaseNode'
import { darkThemeColors } from '../../../styles/theme'

interface TextOutputNodeProps {
  data: {
    label?: string
    result?: string
    status?: string
    [key: string]: any
  }
  selected?: boolean
}

const TextOutputNode: React.FC<TextOutputNodeProps> = ({ data, selected = false }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'SUCCESS': return darkThemeColors.accentGreen
      case 'RUNNING': return darkThemeColors.accentBlue
      case 'ERROR': return darkThemeColors.accentRed
      default: return darkThemeColors.textSecondary
    }
  }

  return (
    <BaseNode
      data={data}
      selected={selected}
      type="textOutput"
      label="文本输出"
      icon="📄"
      inputs={[{ id: 'text', label: '文本', dataType: 'TEXT' as any }]}
    >
      <div style={{ marginTop: '8px' }}>
        <div
          style={{
            backgroundColor: darkThemeColors.bgTertiary,
            border: `1px solid ${darkThemeColors.border}`,
            borderRadius: '6px',
            padding: '8px',
            minHeight: '60px',
            maxHeight: '120px',
            overflowY: 'auto',
            fontSize: '12px',
            color: data.result ? darkThemeColors.textPrimary : darkThemeColors.textSecondary,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {data.result || '等待执行...'}
        </div>

        {/* Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '8px',
          fontSize: '11px',
          color: getStatusColor(data.status),
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(data.status),
          }} />
          <span>{data.status || 'IDLE'}</span>
        </div>
      </div>
    </BaseNode>
  )
}

export default TextOutputNode
