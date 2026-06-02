import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Paper, Typography, TextField, Box } from '@mui/material';
import { NodeStatus } from '../../types/node';
import { getNodeStatusColor } from '../../utils/nodeHelpers';

/**
 * 文本输入节点
 * 允许用户输入文本内容
 */
export const TextInputNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const status = data.status as NodeStatus;

  /**
   * 处理文本变化
   */
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    data.onChange?.(id, { data: { ...data.data, text: event.target.value } });
  };

  return (
    <Paper
      sx={{
        minWidth: 200,
        border: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : '#2196F3',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* 节点头部 */}
      <Box
        sx={{
          bgcolor: '#2196F3',
          color: 'white',
          px: 1.5,
          py: 0.8,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {data.label || '文本输入'}
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

        <TextField
          size="small"
          placeholder="输入文本..."
          value={data.data?.text || ''}
          onChange={handleTextChange}
          multiline
          rows={3}
          sx={{ width: '100%', mt: 1 }}
        />

        {/* 状态指示器 */}
        {status && status !== NodeStatus.IDLE && (
          <Box
            sx={{
              mt: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: getNodeStatusColor(status),
              }}
            />
            <Typography variant="caption">{status}</Typography>
          </Box>
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
