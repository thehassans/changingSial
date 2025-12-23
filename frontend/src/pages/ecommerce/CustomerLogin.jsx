import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiPost, apiGet, API_BASE } from '../../api'
import { useToast } from '../../ui/Toast'
import PasswordInput from '../../components/PasswordInput'
import CountrySelector from '../../components/ecommerce/CountrySelector'

const STYLES = `
  .customer-login-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .customer-login-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  }

  .customer-login-container {
    display: grid;
    place-items: center;
    min-height: calc(100vh - 70px);
    padding: 40px 24px;
  }

  .customer-login-card {
    width: 100%;
    max-width: 440px;
    background: #ffffff;
    border-radius: 20px;
    padding: 40px 36px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.04);
  }

  .customer-login-logo {
    width: 56px;
    height: 56px;
    margin: 0 auto 20px;
    display: block;
    border-radius: 14px;
    object-fit: contain;
    background: #ffffff;
    padding: 8px;
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  .customer-login-title {
    font-size: 26px;
    font-weight: 700;
    text-align: center;
    background: linear-gradient(135deg, #f97316, #ea580c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 6px;
  }

  .customer-login-subtitle {
    text-align: center;
    color: #64748b;
    font-size: 14px;
    margin-bottom: 32px;
  }

  .customer-login-field {
    margin-bottom: 20px;
  }

  .customer-login-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
  }

  .customer-login-input {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 15px;
    transition: all 0.2s;
    background: #f8fafc;
  }

  .customer-login-input:focus {
    outline: none;
    border-color: #f97316;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
  }

  .customer-login-btn {
    width: 100%;
    padding: 16px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s;
    box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);
    margin-top: 8px;
  }

  .customer-login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(249, 115, 22, 0.4);
  }

  .customer-login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .customer-login-footer {
    text-align: center;
    margin-top: 24px;
    font-size: 14px;
    color: #64748b;
  }

  .customer-login-footer a {
    color: #f97316;
    text-decoration: none;
    font-weight: 600;
  }

  .customer-login-footer a:hover {
    text-decoration: underline;
  }

  .customer-login-staff-link {
    display: block;
    text-align: center;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e2e8f0;
    font-size: 13px;
    color: #94a3b8;
  }

  .customer-login-staff-link a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
  }

  .customer-login-back-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
  }

  .customer-login-back-link:hover {
    color: #0f172a;
  }

  .customer-login-register-link {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #f97316;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: color 0.2s;
  }

  .customer-login-register-link:hover {
    color: #ea580c;
  }

  @media (max-width: 480px) {
    .customer-login-card {
      padding: 32px 24px;
      border-radius: 16px;
    }
    .customer-login-header {
      padding: 12px 16px;
    }
  }
`

export default function CustomerLogin() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [branding, setBranding] = useState({ headerLogo: null, loginLogo: null })
  const [selectedCountry, setSelectedCountry] = useState(() => {
    try { return localStorage.getItem('selected_country') || 'SA' } catch { return 'SA' }
  })

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

  useEffect(() => {
    try { localStorage.setItem('selected_country', selectedCountry) } catch {}
  }, [selectedCountry])

  const handleCountryChange = (country) => {
    setSelectedCountry(country.code)
  }

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
      window.location.href = '/customer'
    } catch (err) {
      const status = err?.status
      const msg = String(err?.message || '')
      
      if (status === 401) {
        toast.error('Invalid email or password')
      } else if (status === 403) {
        toast.error('Account access restricted. Please contact support.')
      } else {
        toast.error(msg || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="customer-login-page">
        <header className="customer-login-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <CountrySelector 
              selectedCountry={selectedCountry}
              onCountryChange={handleCountryChange}
            />
            <Link to="/catalog" className="customer-login-back-link">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Catalog
            </Link>
          </div>
          <Link to="/register" className="customer-login-register-link">
            Create Account
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </header>

        <div className="customer-login-container">
          <form onSubmit={handleSubmit} className="customer-login-card">
            <img
              src={branding.loginLogo ? `${API_BASE}${branding.loginLogo}` : `${import.meta.env.BASE_URL}BuySial2.png`}
              alt="Logo"
              className="customer-login-logo"
            />
            <h1 className="customer-login-title">Welcome Back</h1>
            <p className="customer-login-subtitle">Sign in to your account</p>

            <div className="customer-login-field">
              <label className="customer-login-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="customer-login-input"
                autoComplete="email"
              />
            </div>

            <div className="customer-login-field">
              <label className="customer-login-label">Password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="customer-login-input"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading} className="customer-login-btn">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="customer-login-footer">
              Don't have an account? <Link to="/register">Create one</Link>
            </div>

            <div className="customer-login-staff-link">
              Staff or Admin? <Link to="/login">Sign in here</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}