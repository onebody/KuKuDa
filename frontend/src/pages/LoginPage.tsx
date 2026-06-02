import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { authService } from '../services/authService'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(phone, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请重试')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
      <h2>登录 - Workflow Canvas</h2>
      <form onSubmit={handleSubmit}>
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
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 15 }}>{error}</div>}
        <button
          type="submit"
          disabled={isLoading}
          style={{ width: '100%', padding: 10, backgroundColor: '#1976d2', color: 'white', border: 'none' }}
        >
          {isLoading ? '登录中...' : '登录'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 15 }}>
        还没有账号？<Link to="/register">立即注册</Link>
      </p>
    </div>
  )
}
