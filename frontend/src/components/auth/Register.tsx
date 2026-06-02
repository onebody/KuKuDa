import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { useRegisterForm } from '../../hooks/useAuth';

/**
 * 注册表单组件
 */
export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { formData, errors, isLoading, handleChange, handleSubmit } = useRegisterForm();

  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 400,
        mx: 'auto',
        mt: 8,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom align="center">
        注册
      </Typography>

      <Box component="form" onSubmit={onSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="姓名"
          name="name"
          autoComplete="name"
          autoFocus
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          disabled={isLoading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          id="phone"
          label="手机号"
          name="phone"
          autoComplete="tel"
          value={formData.phone}
          onChange={handleChange}
          error={!!errors.phone}
          helperText={errors.phone}
          disabled={isLoading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="密码"
          type="password"
          id="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          disabled={isLoading}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? '注册中...' : '注册'}
        </Button>

        <Typography variant="body2" align="center">
          已有账号？ <Link to="/login">立即登录</Link>
        </Typography>
      </Box>
    </Paper>
  );
};
