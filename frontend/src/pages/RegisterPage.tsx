import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function RegisterPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入有效的手机号')
      return
    }

    if (password.length < 6) {
      setError('密码长度至少6位')
      return
    }

    try {
      await register(phone, password, name)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败，请重试')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
      <h2>注册 - Workflow Canvas</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label>用户名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: 8 }}
            required
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>手机号</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', padding: 8 }}
            required
            placeholder="请输入手机号"
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8 }}
            required
            minLength={6}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 15 }}>{error}</div>}
        <button
          type="submit"
          disabled={isLoading}
          style={{ width: '100%', padding: 10, backgroundColor: '#1976d2', color: 'white', border: 'none' }}
        >
          {isLoading ? '注册中...' : '注册'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 15 }}>
        已有账号？<Link to="/login">立即登录</Link>
      </p>
    </div>
  )
}
