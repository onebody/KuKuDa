import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  AccountTree as WorkflowIcon,
  Hub as NodeIcon,
  Timeline as EdgeIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Workflow } from '../../types/workflow';

interface WorkflowListProps {
  workflows: Workflow[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

// ── 暗色主题配色（与项目保持一致）──────────────────────────
const colors = {
  bgPage: '#0d0d1a',
  bgCard: '#1a1a2e',
  bgCardHover: '#222240',
  bgCardActive: '#2a2a50',
  border: '#2d2d44',
  borderHover: '#3d3d5c',
  textPrimary: '#ffffff',
  textSecondary: '#8b8b9a',
  textMuted: '#5a5a6e',
  accentBlue: '#4a9eff',
  accentBlueLight: '#6bb3ff',
  accentGreen: '#22c55e',
  accentRed: '#ef4444',
  accentOrange: '#f59e0b',
};

/**
 * 工作流列表组件 — 暗色卡片网格风格
 */
export const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate('/workflow/new');
  };

  const handleCardClick = (workflowId: string) => {
    navigate(`/workflow/${workflowId}`);
  };

  // 格式化时间（显示相对时间或日期）
  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // 获取节点类型统计（用于显示标签）
  const getNodeTypeStats = (workflow: Workflow): string[] => {
    if (!workflow.nodes || workflow.nodes.length === 0) return [];
    const typeLabels: Record<string, string> = {
      TEXT_INPUT: '文本输入',
      IMAGE_INPUT_SINGLE: '单图输入',
      IMAGE_INPUT_MULTI: '多图输入',
      FILE_INPUT_SINGLE: '单文件',
      FILE_INPUT_MULTI: '多文件',
      AI_IMAGE: 'AI绘图',
      TEXT_OUTPUT: '文本输出',
      SKILL: '技能',
    };
    const types = workflow.nodes.map((n) => typeLabels[n.type] || n.type);
    const unique = [...new Set(types)];
    return unique.slice(0, 4); // 最多显示4个
  };

  if (workflows.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        sx={{ backgroundColor: colors.bgPage }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: colors.bgCard,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            border: `1px dashed ${colors.border}`,
          }}
        >
          <WorkflowIcon sx={{ fontSize: 36, color: colors.textMuted }} />
        </Box>
        <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 1 }}>
          还没有工作流
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textMuted, mb: 3 }}>
          创建工作流，让 AI 帮你自动化处理任务
        </Typography>
        <button
          onClick={handleCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: colors.accentBlue,
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.backgroundColor = colors.accentBlueLight;
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = colors.accentBlue;
          }}
        >
          <AddIcon fontSize="small" />
          创建第一个工作流
        </button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: colors.bgPage, minHeight: '100vh' }}>
      {/* ── 页面头部 ──────────────────────────────── */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              color: colors.textPrimary,
              fontWeight: 600,
              fontSize: '1.5rem',
              mb: 0.5,
            }}
          >
            我的工作流
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted }}>
            共 {workflows.length} 个工作流
          </Typography>
        </Box>
        <button
          onClick={handleCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: colors.accentBlue,
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.backgroundColor = colors.accentBlueLight;
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = colors.accentBlue;
          }}
        >
          <AddIcon fontSize="small" />
          新建工作流
        </button>
      </Box>

      {/* ── 卡片网格 ──────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2.5,
        }}
      >
        {workflows.map((workflow) => {
          const nodeStats = getNodeTypeStats(workflow);
          const nodeCount = workflow.nodes?.length || 0;
          const edgeCount = workflow.connections?.length || 0;

          return (
            <Box
              key={workflow.id}
              onClick={() => handleCardClick(workflow.id)}
              sx={{
                position: 'relative',
                backgroundColor: colors.bgCard,
                borderRadius: 3,
                border: `1px solid ${colors.border}`,
                padding: 3,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                '&:hover': {
                  backgroundColor: colors.bgCardHover,
                  borderColor: colors.borderHover,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                },
              }}
            >
              {/* ── 卡片顶部：图标 + 标题 + 操作按钮 ── */}
              <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                {/* 图标 */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    backgroundColor: `${colors.accentBlue}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <WorkflowIcon sx={{ fontSize: 24, color: colors.accentBlue }} />
                </Box>

                {/* 标题和描述 */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: colors.textPrimary,
                      fontWeight: 600,
                      fontSize: '1rem',
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {workflow.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.textSecondary,
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '2.2em',
                    }}
                  >
                    {workflow.description || '暂无描述'}
                  </Typography>
                </Box>

                {/* 操作按钮 */}
                <Box
                  display="flex"
                  gap={0.5}
                  sx={{ opacity: 0.6, transition: 'opacity 0.2s', '&:hover': { opacity: 1 } }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip title="编辑">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(workflow.id)}
                      sx={{
                        color: colors.textMuted,
                        '&:hover': { color: colors.accentBlue, backgroundColor: `${colors.accentBlue}15` },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="复制">
                    <IconButton
                      size="small"
                      onClick={() => onDuplicate(workflow.id)}
                      sx={{
                        color: colors.textMuted,
                        '&:hover': { color: colors.accentGreen, backgroundColor: `${colors.accentGreen}15` },
                      }}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="删除">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(workflow.id)}
                      sx={{
                        color: colors.textMuted,
                        '&:hover': { color: colors.accentRed, backgroundColor: `${colors.accentRed}15` },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* ── 节点类型标签 ── */}
              {nodeStats.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  {nodeStats.map((label, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 10px',
                        borderRadius: 1.5,
                        backgroundColor: `${colors.accentBlue}10`,
                        border: `1px solid ${colors.accentBlue}25`,
                        color: colors.accentBlueLight,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </Box>
                  ))}
                </Box>
              )}

              {/* ── 底部统计信息 ── */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  pt: 2,
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Tooltip title={`${nodeCount} 个节点`}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <NodeIcon sx={{ fontSize: 14, color: colors.textMuted }} />
                      <Typography variant="caption" sx={{ color: colors.textMuted }}>
                        {nodeCount}
                      </Typography>
                    </Box>
                  </Tooltip>
                  <Tooltip title={`${edgeCount} 条连接`}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <EdgeIcon sx={{ fontSize: 14, color: colors.textMuted }} />
                      <Typography variant="caption" sx={{ color: colors.textMuted }}>
                        {edgeCount}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>

                <Box display="flex" alignItems="center" gap={0.5}>
                  <TimeIcon sx={{ fontSize: 13, color: colors.textMuted }} />
                  <Typography variant="caption" sx={{ color: colors.textMuted }}>
                    {formatTime(workflow.updatedAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default WorkflowList;
