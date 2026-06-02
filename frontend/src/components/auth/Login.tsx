import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useLoginForm } from '../../hooks/useAuth';

/**
 * 登录表单组件
 */
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { formData, errors, isLoading, handleChange, handleSubmit } = useLoginForm();

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
        登录
      </Typography>

      <Box component="form" onSubmit={onSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="phone"
          label="手机号"
          name="phone"
          autoComplete="tel"
          autoFocus
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
          autoComplete="current-password"
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
          {isLoading ? '登录中...' : '登录'}
        </Button>

        <Typography variant="body2" align="center">
          还没有账号？ <Link to="/register">立即注册</Link>
        </Typography>
      </Box>
    </Paper>
  );
};
