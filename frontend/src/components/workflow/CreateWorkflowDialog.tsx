import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';

interface CreateWorkflowDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

/**
 * 创建工作流对话框
 */
export const CreateWorkflowDialog: React.FC<CreateWorkflowDialogProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  /**
   * 处理创建
   */
  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
    }
  };

  /**
   * 处理关闭
   */
  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>创建工作流</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            autoFocus
            label="工作流名称"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="描述（可选）"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={!name.trim()}
        >
          创建
        </Button>
      </DialogActions>
    </Dialog>
  );
};
