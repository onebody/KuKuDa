import React from 'react'
import { Node } from 'reactflow'
import { darkThemeColors } from '../../styles/theme'

interface PropertyPanelProps {
  isOpen: boolean
  selectedNode: Node | null
  onClose: () => void
  onUpdateNode: (nodeId: string, data: any) => void
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  isOpen,
  selectedNode,
  onClose,
  onUpdateNode,
}) => {
  if (!isOpen) return null

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '300px',
    height: '100%',
    backgroundColor: darkThemeColors.bgSecondary,
    borderLeft: `1px solid ${darkThemeColors.border}`,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 20,
    boxShadow: '-4px 0 12px rgba(0,0,0,0.3)',
  }

  const headerStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: `1px solid ${darkThemeColors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
  }

  const sectionStyle: React.CSSProperties = {
    marginBottom: '20px',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: darkThemeColors.textSecondary,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: darkThemeColors.bgTertiary,
    border: `1px solid ${darkThemeColors.border}`,
    borderRadius: '6px',
    color: darkThemeColors.textPrimary,
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const handleChange = (key: string, value: any) => {
    if (selectedNode) {
      onUpdateNode(selectedNode.id, { ...selectedNode.data, [key]: value })
    }
  }

  const handleConfigChange = (key: string, value: any) => {
    if (selectedNode) {
      const newConfig = { ...selectedNode.data.config, [key]: value }
      onUpdateNode(selectedNode.id, { ...selectedNode.data, config: newConfig })
    }
  }

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: darkThemeColors.textPrimary }}>
          {selectedNode ? '节点属性' : '属性面板'}
        </span>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: darkThemeColors.textSecondary,
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = darkThemeColors.bgTertiary
            e.currentTarget.style.color = darkThemeColors.textPrimary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = darkThemeColors.textSecondary
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {selectedNode ? (
          <>
            {/* Node Name */}
            <div style={sectionStyle}>
              <label style={labelStyle}>节点名称</label>
              <input
                type="text"
                value={selectedNode.data.label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = darkThemeColors.accentBlue
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = darkThemeColors.border
                }}
              />
            </div>

            {/* Node Type (read-only) */}
            <div style={sectionStyle}>
              <label style={labelStyle}>节点类型</label>
              <div
                style={{
                  ...inputStyle,
                  backgroundColor: darkThemeColors.bgPrimary,
                  cursor: 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{selectedNode.data.icon || '📦'}</span>
                <span>{selectedNode.type}</span>
              </div>
            </div>

            {/* Node ID (read-only) */}
            <div style={sectionStyle}>
              <label style={labelStyle}>节点 ID</label>
              <div
                style={{
                  ...inputStyle,
                  backgroundColor: darkThemeColors.bgPrimary,
                  cursor: 'default',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              >
                {selectedNode.id}
              </div>
            </div>

            {/* Type-specific configurations */}
            {selectedNode.type === 'llmCall' && (
              <>
                <div style={sectionStyle}>
                  <label style={labelStyle}>模型选择</label>
                  <select
                    value={selectedNode.data.config?.model || 'gpt-4'}
                    onChange={(e) => handleConfigChange('model', e.target.value)}
                    style={{
                      ...inputStyle,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3">Claude 3</option>
                    <option value="wenxin">文心一言</option>
                  </select>
                </div>

                <div style={sectionStyle}>
                  <label style={labelStyle}>
                    温度: {selectedNode.data.config?.temperature || 0.7}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={selectedNode.data.config?.temperature || 0.7}
                    onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: darkThemeColors.accentBlue,
                    }}
                  />
                </div>

                <div style={sectionStyle}>
                  <label style={labelStyle}>最大令牌</label>
                  <input
                    type="number"
                    value={selectedNode.data.config?.maxTokens || 2048}
                    onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = darkThemeColors.accentBlue
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = darkThemeColors.border
                    }}
                  />
                </div>
              </>
            )}

            {selectedNode.type === 'textInput' && (
              <div style={sectionStyle}>
                <label style={labelStyle}>默认文本</label>
                <textarea
                  value={selectedNode.data.config?.defaultText || ''}
                  onChange={(e) => handleConfigChange('defaultText', e.target.value)}
                  style={{
                    ...inputStyle,
                    minHeight: '80px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = darkThemeColors.accentBlue
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = darkThemeColors.border
                  }}
                />
              </div>
            )}

            {selectedNode.type === 'imageGeneration' && (
              <>
                <div style={sectionStyle}>
                  <label style={labelStyle}>模型</label>
                  <select
                    value={selectedNode.data.config?.model || 'dall-e-3'}
                    onChange={(e) => handleConfigChange('model', e.target.value)}
                    style={{
                      ...inputStyle,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="dall-e-3">DALL-E 3</option>
                    <option value="dall-e-2">DALL-E 2</option>
                    <option value="stable-diffusion">Stable Diffusion</option>
                  </select>
                </div>

                <div style={sectionStyle}>
                  <label style={labelStyle}>尺寸</label>
                  <select
                    value={selectedNode.data.config?.size || '1024x1024'}
                    onChange={(e) => handleConfigChange('size', e.target.value)}
                    style={{
                      ...inputStyle,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="1024x1024">1024×1024</option>
                    <option value="1024x1792">1024×1792</option>
                    <option value="1792x1024">1792×1024</option>
                  </select>
                </div>
              </>
            )}

            {/* Node Status */}
            <div
              style={{
                marginTop: '24px',
                padding: '12px',
                backgroundColor: darkThemeColors.bgTertiary,
                borderRadius: '6px',
              }}
            >
              <div style={{ fontSize: '11px', color: darkThemeColors.textSecondary, marginBottom: '6px' }}>
                节点状态
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor:
                      selectedNode.data.status === 'SUCCESS'
                        ? darkThemeColors.accentGreen
                        : selectedNode.data.status === 'RUNNING'
                          ? darkThemeColors.accentBlue
                          : selectedNode.data.status === 'ERROR'
                            ? darkThemeColors.accentRed
                            : darkThemeColors.textSecondary,
                  }}
                />
                <span style={{ fontSize: '13px', color: darkThemeColors.textPrimary, fontWeight: 600 }}>
                  {selectedNode.data.status || 'IDLE'}
                </span>
              </div>
            </div>

            {/* Delete Button */}
            <div style={{ marginTop: '24px' }}>
              <button
                onClick={() => {
                  // TODO: Implement node deletion
                  console.log('Delete node:', selectedNode.id)
                }}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${darkThemeColors.accentRed}`,
                  borderRadius: '6px',
                  color: darkThemeColors.accentRed,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkThemeColors.accentRed
                  e.currentTarget.style.color = darkThemeColors.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = darkThemeColors.accentRed
                }}
              >
                删除节点
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <div style={{ fontSize: '14px', color: darkThemeColors.textSecondary }}>
              选择一个节点来编辑其属性
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PropertyPanel
