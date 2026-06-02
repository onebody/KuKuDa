import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Paper, Typography, Box, FormControl, Select, MenuItem } from '@mui/material';
import { NodeStatus } from '../../types/node';
import { getNodeStatusColor } from '../../utils/nodeHelpers';

/**
 * LLM 调用节点
 * 调用大语言模型
 */
export const LLMNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const status = data.status as NodeStatus;
  const config = data.config || {};

  /**
   * 处理配置变化
   */
  const handleConfigChange = (key: string, value: any) => {
    data.onChange?.(id, {
      config: { ...config, [key]: value },
    });
  };

  return (
    <Paper
      sx={{
        minWidth: 220,
        border: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : '#9C27B0',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* 节点头部 */}
      <Box
        sx={{
          bgcolor: '#9C27B0',
          color: 'white',
          px: 1.5,
          py: 0.8,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {data.label || 'LLM 调用'}
        </Typography>
      </Box>

      {/* 节点内容 */}
      <Box sx={{ p: 1.5 }}>
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          style={{ background: '#555' }}
        />

        {/* 模型选择 */}
        <FormControl size="small" fullWidth sx={{ mb: 1 }}>
          <Select
            value={config.model || 'gpt-4'}
            onChange={(e) => handleConfigChange('model', e.target.value)}
          >
            <MenuItem value="gpt-4">GPT-4</MenuItem>
            <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
            <MenuItem value="claude-3">Claude 3</MenuItem>
            <MenuItem value="wenxin">文心一言</MenuItem>
            <MenuItem value="qwen">通义千问</MenuItem>
          </Select>
        </FormControl>

        {/* 提示词 */}
        {config.prompt && (
          <Typography
            variant="caption"
            display="block"
            sx={{
              mt: 1,
              p: 0.5,
              bgcolor: 'action.hover',
              borderRadius: 1,
              maxHeight: 80,
              overflow: 'auto',
            }}
          >
            {config.prompt}
          </Typography>
        )}

        {/* 结果显示 */}
        {data.result && (
          <Box
            sx={{
              mt: 1,
              p: 0.5,
              bgcolor: 'action.hover',
              borderRadius: 1,
              maxHeight: 100,
              overflow: 'auto',
            }}
          >
            <Typography variant="caption">
              {typeof data.result === 'string'
                ? data.result.slice(0, 200)
                : JSON.stringify(data.result).slice(0, 200)}
            </Typography>
          </Box>
        )}

        {/* 错误信息 */}
        {data.error && (
          <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
            {data.error}
          </Typography>
        )}

        <Handle
          type="source"
          position={Position.Right}
          id="output"
          style={{ background: '#555' }}
        />
      </Box>
    </Paper>
  );
};
