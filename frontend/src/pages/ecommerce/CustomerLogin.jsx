import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiPost, apiGet, API_BASE } from '../../api'
import { useToast } from '../../ui/Toast'
import PasswordInput from '../../components/PasswordInput'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  .cl-page {
    min-height: 100vh;
    display: flex;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #ffffff;
  }

  .cl-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 48px;
    max-width: 560px;
    margin: 0 auto;
  }

  .cl-right {
    flex: 1;
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%);
    display: none;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .cl-right::before {
    content: '';
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%);
    animation: pulse 4s ease-in-out infinite;
  }

  .cl-right::after {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(234, 88, 12, 0.1) 0%, transparent 70%);
    animation: pulse 4s ease-in-out infinite 1s;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }

  .cl-logo-container {
    margin-bottom: 48px;
  }

  .cl-logo {
    height: 44px;
    width: auto;
    object-fit: contain;
  }

  .cl-header {
    margin-bottom: 40px;
  }

  .cl-title {
    font-size: 32px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  }

  .cl-subtitle {
    font-size: 15px;
    color: #64748b;
    margin: 0;
    font-weight: 400;
  }

  .cl-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .cl-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cl-label {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    letter-spacing: 0.01em;
  }

  .cl-input {
    width: 100%;
    padding: 16px 18px;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    font-size: 15px;
    font-family: inherit;
    transition: all 0.2s ease;
    background: #fafafa;
    color: #0f172a;
  }

  .cl-input::placeholder {
    color: #9ca3af;
  }

  .cl-input:hover {
    border-color: #d1d5db;
    background: #ffffff;
  }

  .cl-input:focus {
    outline: none;
    border-color: #f97316;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.08);
  }

  .cl-btn {
    width: 100%;
    padding: 18px;
    border: none;
    border-radius: 12px;
    background: #0f172a;
    color: white;
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.25s ease;
    margin-top: 8px;
  }

  .cl-btn:hover {
    background: #1e293b;
    transform: translateY(-1px);
  }

  .cl-btn:active {
    transform: translateY(0);
  }

  .cl-btn:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
  }

  .cl-divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 8px 0;
  }

  .cl-divider-line {
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }

  .cl-divider-text {
    font-size: 12px;
    color: #9ca3af;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cl-footer {
    text-align: center;
    margin-top: 32px;
    font-size: 14px;
    color: #64748b;
  }

  .cl-footer a {
    color: #f97316;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
  }

  .cl-footer a:hover {
    color: #ea580c;
  }

  .cl-staff-link {
    text-align: center;
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid #f1f5f9;
    font-size: 13px;
    color: #94a3b8;
  }

  .cl-staff-link a {
    color: #64748b;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .cl-staff-link a:hover {
    color: #0f172a;
  }

  .cl-back {
    position: absolute;
    top: 32px;
    left: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
  }

  .cl-back:hover {
    color: #0f172a;
  }

  .cl-illustration {
    position: relative;
    z-index: 1;
    font-size: 120px;
    opacity: 0.9;
  }

  @media (min-width: 1024px) {
    .cl-right {
      display: flex;
    }
    .cl-left {
      padding: 64px 80px;
    }
  }

  @media (max-width: 640px) {
    .cl-left {
      padding: 32px 24px;
    }
    .cl-title {
      font-size: 26px;
    }
    .cl-logo-container {
      margin-bottom: 40px;
    }
    .cl-header {
      margin-bottom: 32px;
    }
  }
`

export default function CustomerLogin() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [branding, setBranding] = useState({ headerLogo: null, loginLogo: null })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const j = await apiGet('/api/settings/branding')
        if (!cancelled) setBranding({ headerLogo: j.headerLogo || null, loginLogo: j.loginLogo || null })
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Email is required')
      return
    }
    if (!password) {
      toast.error('Password is required')
      return
    }

    setLoading(true)
    try {
      const data = await apiPost('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password,
        loginType: 'customer'
      })
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('me', JSON.stringify(data.user))
      
      toast.success('Welcome back!')
      
      // Check for pending cart item logic
      try {
        const pendingProductId = sessionStorage.getItem('pending_cart_product')
        if (pendingProductId) {
          sessionStorage.removeItem('pending_cart_product')
          window.location.href = `/product/${pendingProductId}`
          return
        }
      } catch {}

      window.location.href = '/customer'
    } catch (err) {
      const status = err?.status
      const msg = String(err?.message || '')
      
      if (status === 401) {
        toast.error('Invalid email or password')
      } else if (status === 403) {
        toast.error('Account access restricted')
      } else {
        toast.error(msg || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="cl-page">
        <Link to="/catalog" className="cl-back">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to store
        </Link>

        <div className="cl-left">
          <div className="cl-logo-container">
            <img
              src={branding.loginLogo ? `${API_BASE}${branding.loginLogo}` : `${import.meta.env.BASE_URL}BuySial2.png`}
              alt="Logo"
              className="cl-logo"
            />
          </div>

          <div className="cl-header">
            <h1 className="cl-title">Welcome back</h1>
            <p className="cl-subtitle">Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="cl-form">
            <div className="cl-field">
              <label className="cl-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="cl-input"
                autoComplete="email"
              />
            </div>

            <div className="cl-field">
              <label className="cl-label">Password</label>
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                className="cl-input"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading} className="cl-btn">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="cl-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>

          <div className="cl-staff-link">
            <Link to="/login">Staff & Admin login →</Link>
          </div>
        </div>

        <div className="cl-right">
          <div className="cl-illustration">🛍️</div>
        </div>
      </div>
    </>
  )
}