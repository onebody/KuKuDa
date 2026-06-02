import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Button, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { PlayCircle, RotateLeft, ExpandMore, ExpandLess } from '@mui/icons-material';
import { darkThemeColors } from '../../../styles/theme';
import { skillService, SkillDefinition } from '../../../services/skillService';

interface SkillNodeData {
  label?: string;
  skillId?: string;
  parameters?: Record<string, any>;
  result?: any;
  error?: string;
  status?: string;
}

const SkillNode: React.FC<NodeProps<SkillNodeData>> = ({ data, selected }) => {
  const [skills, setSkills] = useState<SkillDefinition[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition | null>(null);
  const [params, setParams] = useState<Record<string, any>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  useEffect(() => {
    skillService.getAllSkills().then((skillsData) => {
      setSkills(skillsData);
      if (skillsData.length > 0) {
        const savedSkill = skillsData.find((s) => s.id === data.skillId);
        setSelectedSkill(savedSkill || skillsData[0]);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedSkill) {
      const initialParams: Record<string, any> = {};
      selectedSkill.parameters.forEach((param) => {
        initialParams[param.name] = param.default ?? '';
      });
      setParams(initialParams);
    }
  }, [selectedSkill]);

  const handleSkillChange = (skillId: string) => {
    const skill = skills.find((s) => s.id === skillId);
    if (skill) {
      setSelectedSkill(skill);
      setExecutionResult(null);
      setExecutionError(null);
    }
  };

  const handleParamChange = (name: string, value: any) => {
    setParams((prev) => ({ ...prev, [name]: value }));
    setExecutionResult(null);
    setExecutionError(null);
  };

  const handleExecute = async () => {
    if (!selectedSkill) return;

    setIsLoading(true);
    setExecutionError(null);

    try {
      const result = await skillService.executeSkill(selectedSkill.id, params);
      if (result.code === 0) {
        setExecutionResult(result.data);
      } else {
        setExecutionError(result.message);
      }
    } catch (error: any) {
      setExecutionError(error.response?.data?.message || '执行失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setExecutionResult(null);
    setExecutionError(null);
    if (selectedSkill) {
      const initialParams: Record<string, any> = {};
      selectedSkill.parameters.forEach((param) => {
        initialParams[param.name] = param.default ?? '';
      });
      setParams(initialParams);
    }
  };

  return (
    <div
      className="custom-node"
      style={{
        width: 320,
        backgroundColor: selected ? darkThemeColors.accentBlue + '20' : darkThemeColors.bgSecondary,
        border: `1px solid ${selected ? darkThemeColors.accentBlue : darkThemeColors.border}`,
        borderRadius: 8,
        padding: 12,
        boxShadow: selected ? `0 0 12px ${darkThemeColors.accentBlue}40` : 'none',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ top: '20%' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <span style={{ fontWeight: 600, color: darkThemeColors.textPrimary }}>
            {data.label || '技能节点'}
          </span>
        </div>
        <Button
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ minWidth: 'auto', padding: 4 }}
        >
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </Button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <FormControl fullWidth size="small">
          <InputLabel>选择技能</InputLabel>
          <Select
            value={selectedSkill?.id || ''}
            onChange={(e) => handleSkillChange(e.target.value)}
            label="选择技能"
            style={{ backgroundColor: darkThemeColors.bgTertiary }}
          >
            {skills.map((skill) => (
              <MenuItem key={skill.id} value={skill.id}>
                {skill.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {selectedSkill && (
        <div style={{ fontSize: 11, color: darkThemeColors.textSecondary, marginBottom: 8 }}>
          {selectedSkill.description}
        </div>
      )}

      {isExpanded && selectedSkill && (
        <div style={{ borderTop: `1px solid ${darkThemeColors.border}`, marginTop: 8, paddingTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: darkThemeColors.textSecondary, marginBottom: 8 }}>
            参数配置
          </div>
          {selectedSkill.parameters.map((param) => (
            <div key={param.name} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: darkThemeColors.textSecondary, marginBottom: 4 }}>
                {param.name} {param.required && <span style={{ color: '#ef4444' }}>*</span>}
              </div>
              {param.type === 'number' ? (
                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  value={params[param.name] || ''}
                  onChange={(e) => handleParamChange(param.name, parseFloat(e.target.value) || 0)}
                  placeholder={param.description}
                  style={{ backgroundColor: darkThemeColors.bgTertiary }}
                />
              ) : param.type === 'boolean' ? (
                <Select
                  fullWidth
                  size="small"
                  value={params[param.name]?.toString() || 'false'}
                  onChange={(e) => handleParamChange(param.name, e.target.value === 'true')}
                  style={{ backgroundColor: darkThemeColors.bgTertiary }}
                >
                  <MenuItem value="true">是</MenuItem>
                  <MenuItem value="false">否</MenuItem>
                </Select>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  value={params[param.name] || ''}
                  onChange={(e) => handleParamChange(param.name, e.target.value)}
                  placeholder={param.description}
                  style={{ backgroundColor: darkThemeColors.bgTertiary }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {executionError && (
        <div style={{ marginTop: 12, padding: 8, backgroundColor: '#ef444420', borderRadius: 4, color: '#ef4444', fontSize: 12 }}>
          {executionError}
        </div>
      )}

      {executionResult !== null && !executionError && (
        <div style={{ marginTop: 12, padding: 8, backgroundColor: '#22c55e20', borderRadius: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#22c55e', marginBottom: 4 }}>
            执行结果
          </div>
          <div style={{ fontSize: 12, color: darkThemeColors.textPrimary, wordBreak: 'break-all' }}>
            {typeof executionResult === 'object' ? JSON.stringify(executionResult, null, 2) : executionResult}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="small"
          onClick={handleExecute}
          disabled={isLoading}
          startIcon={<PlayCircle />}
        >
          {isLoading ? '执行中...' : '执行'}
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={handleReset}
          startIcon={<RotateLeft />}
        >
          重置
        </Button>
      </div>

      <Handle type="source" position={Position.Right} style={{ top: '80%' }} />

      <style>{`
        .custom-node {
          transition: all 0.2s ease;
        }
        .custom-node:hover {
          border-color: ${darkThemeColors.accentBlue};
        }
      `}</style>
    </div>
  );
};

export default SkillNode;
