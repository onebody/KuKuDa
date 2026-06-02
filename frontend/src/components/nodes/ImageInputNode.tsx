import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Paper, Typography, Box, Button } from '@mui/material';
import { NodeStatus } from '../../types/node';
import { getNodeStatusColor } from '../../utils/nodeHelpers';

/**
 * 图片输入节点
 * 上传或选择图片作为输入
 */
export const ImageInputNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const status = data.status as NodeStatus;

  /**
   * 处理图片上传
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    // 读取文件
    const reader = new FileReader();
    reader.onload = (e) => {
      data.onChange?.(id, {
        data: {
          ...data.data,
          imageUrl: e.target?.result,
          fileName: file.name,
        },
      });
    };
    reader.readAsDataURL(file);
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
          {data.label || '图片输入'}
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

        {/* 上传按钮 */}
        <Button
          variant="outlined"
          component="label"
          size="small"
          fullWidth
        >
          上传图片
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />
        </Button>

        {/* 显示上传的图片 */}
        {data.data?.imageUrl && (
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <img
              src={data.data.imageUrl}
              alt="上传的图片"
              style={{
                maxWidth: '100%',
                maxHeight: 120,
                borderRadius: 4,
              }}
            />
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              {data.data.fileName}
            </Typography>
          </Box>
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
