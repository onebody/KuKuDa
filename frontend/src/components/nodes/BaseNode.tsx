import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Paper, Typography, Box } from '@mui/material';
import { NODE_TYPES } from '../../constants/nodeTypes';
import { NodeStatus } from '../../types/node';
import { getNodeStatusColor } from '../../utils/nodeHelpers';

/**
 * 基础节点组件
 * 所有自定义节点的基类
 */
export const BaseNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeType = data.nodeType as string;
  const nodeInfo = NODE_TYPES.find((nt) => nt.type === nodeType);
  const status = data.status as NodeStatus;
  const color = nodeInfo?.color || '#555';

  return (
    <Paper
      sx={{
        minWidth: 180,
        maxWidth: 250,
        border: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : color,
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: selected ? 3 : 1,
      }}
    >
      {/* 节点头部 */}
      <Box
        sx={{
          bgcolor: color,
          color: 'white',
          px: 1.5,
          py: 0.8,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {data.label || '节点'}
        </Typography>

        {/* 状态指示器 */}
        {status && status !== NodeStatus.IDLE && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: getNodeStatusColor(status),
              ml: 'auto',
            }}
          />
        )}
      </Box>

      {/* 节点内容 */}
      <Box sx={{ p: 1.5, minHeight: 60 }}>
        {/* 输入句柄 */}
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          style={{ background: '#555' }}
        />

        {/* 显示配置信息 */}
        {data.config?.model && (
          <Typography variant="caption" display="block">
            模型: {data.config.model}
          </Typography>
        )}

        {data.config?.prompt && (
          <Typography
            variant="caption"
            display="block"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            提示词: {data.config.prompt}
          </Typography>
        )}

        {/* 显示结果 */}
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
                ? data.result
                : JSON.stringify(data.result).slice(0, 100)}
            </Typography>
          </Box>
        )}

        {/* 错误信息 */}
        {data.error && (
          <Typography variant="caption" color="error" display="block">
            {data.error}
          </Typography>
        )}

        {/* 输出句柄 */}
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
