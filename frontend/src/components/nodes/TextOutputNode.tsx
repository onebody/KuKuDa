import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Paper, Typography, Box } from '@mui/material';
import { NodeStatus } from '../../types/node';
import { getNodeStatusColor } from '../../utils/nodeHelpers';

/**
 * 文本输出节点
 * 显示文本结果
 */
export const TextOutputNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const status = data.status as NodeStatus;
  const result = data.result;

  return (
    <Paper
      sx={{
        minWidth: 200,
        maxWidth: 300,
        border: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : '#4CAF50',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* 节点头部 */}
      <Box
        sx={{
          bgcolor: '#4CAF50',
          color: 'white',
          px: 1.5,
          py: 0.8,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {data.label || '文本输出'}
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

        {/* 显示结果 */}
        {result ? (
          <Box
            sx={{
              p: 1,
              bgcolor: 'action.hover',
              borderRadius: 1,
              maxHeight: 150,
              overflow: 'auto',
            }}
          >
            <Typography variant="body2">
              {typeof result === 'string' ? result : JSON.stringify(result)}
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            等待输入...
          </Typography>
        )}

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
      </Box>
    </Paper>
  );
};
