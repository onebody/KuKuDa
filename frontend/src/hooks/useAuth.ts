import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { User, LoginRequest, RegisterRequest } from '../types';

/**
 * 认证 Hook
 * 提供认证相关的状态和方法
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    getMe,
  } = useAuthStore();

  return {
    // 状态
    user,
    isAuthenticated,
    isLoading,

    // 方法
    login,
    register,
    logout,
    getMe,
  };
};

/**
 * 登录表单 Hook
 * 处理登录表单状态和提交
 */
export const useLoginForm = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    phone: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});
  const { login, isLoading } = useAuth();

  /**
   * 处理输入变化
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 清除对应字段的错误
    if (errors[name as keyof LoginRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * 表单验证
   */
  const validate = (): boolean => {
    const newErrors: Partial<LoginRequest> = {};

    if (!formData.phone) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '手机号格式不正确';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(formData.phone, formData.password);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  };
};

/**
 * 注册表单 Hook
 * 处理注册表单状态和提交
 */
export const useRegisterForm = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    phone: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterRequest>>({});
  const { register, isLoading } = useAuth();

  /**
   * 处理输入变化
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 清除对应字段的错误
    if (errors[name as keyof RegisterRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * 表单验证
   */
  const validate = (): boolean => {
    const newErrors: Partial<RegisterRequest> = {};

    if (!formData.name) {
      newErrors.name = '请输入姓名';
    }

    if (!formData.phone) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '手机号格式不正确';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度不能少于 6 个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register(formData.phone, formData.password, formData.name);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  };
};
