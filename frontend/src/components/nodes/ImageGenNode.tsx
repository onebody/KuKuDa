import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Paper, Typography, Box, FormControl, Select, MenuItem } from '@mui/material';
import { NodeStatus } from '../../types/node';
import { getNodeStatusColor } from '../../utils/nodeHelpers';

/**
 * 图片生成节点
 * 使用 AI 生成图片
 */
export const ImageGenNode: React.FC<NodeProps> = ({ id, data, selected }) => {
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
        borderColor: selected ? 'primary.main' : '#FF9800',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* 节点头部 */}
      <Box
        sx={{
          bgcolor: '#FF9800',
          color: 'white',
          px: 1.5,
          py: 0.8,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {data.label || '图片生成'}
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

        {/* 图片尺寸选择 */}
        <FormControl size="small" fullWidth sx={{ mb: 1 }}>
          <Select
            value={config.imageSize || '512x512'}
            onChange={(e) => handleConfigChange('imageSize', e.target.value)}
          >
            <MenuItem value="256x256">256x256</MenuItem>
            <MenuItem value="512x512">512x512</MenuItem>
            <MenuItem value="1024x1024">1024x1024</MenuItem>
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
            提示词: {config.prompt}
          </Typography>
        )}

        {/* 生成的图片 */}
        {data.result && data.result.url && (
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <img
              src={data.result.url}
              alt="生成的图片"
              style={{
                maxWidth: '100%',
                maxHeight: 150,
                borderRadius: 4,
              }}
            />
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
