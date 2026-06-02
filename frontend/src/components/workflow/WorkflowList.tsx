import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../../stores/workflowStore';
import { Workflow } from '../../types/workflow';

interface WorkflowListProps {
  workflows: Workflow[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

/**
 * 工作流列表组件
 */
export const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const navigate = useNavigate();

  /**
   * 处理新建工作流
   */
  const handleCreate = () => {
    navigate('/workflow/new');
  };

  /**
   * 处理点击工作流卡片
   */
  const handleCardClick = (workflowId: string) => {
    navigate(`/workflow/${workflowId}`);
  };

  if (workflows.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
      >
        <Typography variant="h6" color="textSecondary" gutterBottom>
          还没有工作流
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          创建第一个工作流
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">我的工作流</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          新建工作流
        </Button>
      </Box>

      <Grid container spacing={3}>
        {workflows.map((workflow) => (
          <Grid item xs={12} sm={6} md={4} key={workflow.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3,
                },
              }}
              onClick={() => handleCardClick(workflow.id)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {workflow.name}
                </Typography>
                {workflow.description && (
                  <Typography variant="body2" color="textSecondary">
                    {workflow.description}
                  </Typography>
                )}
                <Typography variant="caption" color="textSecondary">
                  创建时间: {new Date(workflow.createdAt).toLocaleString()}
                </Typography>
                {workflow.lastExecutedAt && (
                  <Typography variant="caption" color="textSecondary" display="block">
                    最后执行: {new Date(workflow.lastExecutedAt).toLocaleString()}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Tooltip title="编辑">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(workflow.id);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="复制">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(workflow.id);
                    }}
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="删除">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(workflow.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
