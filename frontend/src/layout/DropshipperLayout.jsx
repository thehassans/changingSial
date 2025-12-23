import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { API_BASE, apiGet, apiPatch } from '../api.js'

const PREMIUM_STYLES = `
  .dropshipper-layout {
    display: flex;
    height: 100vh;
    background: var(--bg, #0f172a);
    color: var(--text, #f8fafc);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    overflow: hidden;
  }

  [data-theme="light"] .dropshipper-layout {
    --bg: #f8fafc;
    --text: #0f172a;
    --panel: #ffffff;
    --panel-2: #f1f5f9;
    --border: rgba(0, 0, 0, 0.08);
    --sidebar-bg: #ffffff;
    --sidebar-border: #e2e8f0;
  }

  [data-theme="dark"] .dropshipper-layout {
    --bg: #0f172a;
    --text: #f8fafc;
    --panel: rgba(30, 41, 59, 0.7);
    --panel-2: rgba(51, 65, 85, 0.5);
    --border: rgba(255, 255, 255, 0.08);
    --sidebar-bg: rgba(15, 23, 42, 0.95);
    --sidebar-border: rgba(255, 255, 255, 0.1);
  }

  .dropshipper-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: var(--sidebar-bg, #0f172a);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--sidebar-border, rgba(255, 255, 255, 0.1));
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    z-index: 100;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .dropshipper-sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    bottom: 0;
    width: 260px;
    background: var(--sidebar-bg, #0f172a);
    backdrop-filter: blur(20px);
    border-right: 1px solid var(--sidebar-border, rgba(255, 255, 255, 0.1));
    display: flex;
    flex-direction: column;
    z-index: 50;
    transition: transform 0.3s ease;
  }

  .dropshipper-nav {
    flex: 1;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
  }

  .dropshipper-nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 10px;
    color: var(--text-secondary, #94a3b8);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }

  .dropshipper-nav-link:hover {
    background: rgba(16, 185, 129, 0.08);
    color: #10b981;
  }

  .dropshipper-nav-link.active {
    background: linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%);
    color: #10b981;
    font-weight: 600;
    box-shadow: inset 3px 0 0 #10b981;
  }

  .dropshipper-content {
    margin-left: 260px;
    margin-top: 64px;
    height: calc(100vh - 64px);
    overflow-y: auto;
    padding: 32px;
    background: var(--bg);
  }

  .dropshipper-mobile-tabs {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 72px;
    background: var(--sidebar-bg, #0f172a);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--sidebar-border, rgba(255, 255, 255, 0.1));
    z-index: 100;
    justify-content: space-around;
    align-items: center;
    padding: 0 8px;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .dropshipper-mobile-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--text-secondary, #94a3b8);
    text-decoration: none;
    font-size: 11px;
    font-weight: 500;
    flex: 1;
    height: 100%;
    transition: all 0.2s;
  }

  .dropshipper-mobile-tab.active {
    color: #10b981;
  }

  .dropshipper-mobile-tab svg {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 768px) {
    .dropshipper-sidebar {
      display: none;
    }
    .dropshipper-content {
      margin-left: 0;
      padding: 16px;
      padding-bottom: 88px;
    }
    .dropshipper-mobile-tabs {
      display: flex;
    }
    .dropshipper-topbar {
      padding: 0 16px;
    }
  }

  .dropshipper-pro-tip {
    margin: 16px;
    padding: 16px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .dropshipper-pro-tip-title {
    font-size: 12px;
    font-weight: 700;
    color: #10b981;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .dropshipper-pro-tip-text {
    font-size: 11px;
    color: var(--text-secondary, #94a3b8);
    line-height: 1.5;
  }

  /* Scrollbar styling */
  .dropshipper-content::-webkit-scrollbar,
  .dropshipper-nav::-webkit-scrollbar {
    width: 6px;
  }

  .dropshipper-content::-webkit-scrollbar-track,
  .dropshipper-nav::-webkit-scrollbar-track {
    background: transparent;
  }

  .dropshipper-content::-webkit-scrollbar-thumb,
  .dropshipper-nav::-webkit-scrollbar-thumb {
    background: var(--border, rgba(255, 255, 255, 0.1));
    border-radius: 99px;
  }
`

export default function DropshipperLayout() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  )
  const navigate = useNavigate()
  
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark'
    } catch {
      return 'dark'
    }
  })
  
  const [showSettings, setShowSettings] = useState(false)
  const [showPassModal, setShowPassModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPass, setChangingPass] = useState(false)
  
  const [me, setMe] = useState(() => { 
    try { 
      return JSON.parse(localStorage.getItem('me')||'{}') 
    } catch { 
      return {} 
    } 
  })

  const [branding, setBranding] = useState({ headerLogo: null })

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme)
    } catch {}
    const root = document.documentElement
    if (theme === 'dark') root.setAttribute('data-theme', 'dark')
    else root.removeAttribute('data-theme')
  }, [theme])

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const j = await apiGet('/api/settings/branding')
        if (!cancelled) setBranding({ headerLogo: j.headerLogo || null })
      } catch {}
      try {
        const r = await apiGet('/api/users/me')
        if (!cancelled) setMe(r?.user||{})
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  function doLogout() {
    try { 
      localStorage.removeItem('token')
      localStorage.removeItem('me') 
    } catch {}
    try { navigate('/login', { replace: true }) } catch {}
    setTimeout(() => { try { window.location.assign('/login') } catch {} }, 30)
  }

  async function handlePasswordChange(e) {
    e?.preventDefault?.()
    if (!currentPassword || !newPassword) {
      alert('Please fill all fields')
      return
    }
    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match')
      return
    }
    setChangingPass(true)
    try {
      await apiPatch('/api/users/me/password', {
        currentPassword,
        newPassword,
      })
      alert('Password changed successfully!')
      setShowPassModal(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      alert(err?.message || 'Failed to change password')
    } finally {
      setChangingPass(false)
    }
  }

  // Click outside to close settings
  useEffect(() => {
    function handleClickOutside(e) {
      if (showSettings && !e.target.closest('.settings-dropdown') && !e.target.closest('.settings-button')) {
        setShowSettings(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSettings])

  const links = [
    { to: '/dropshipper/dashboard', label: 'Overview', icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { to: '/dropshipper/products', label: 'Products', icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )},
    { to: '/dropshipper/submit-order', label: 'New Order', icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    )},
    { to: '/dropshipper/orders', label: 'My Orders', icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { to: '/dropshipper/finances', label: 'Earnings', icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
  ]

  return (
    <>
      <style>{PREMIUM_STYLES}</style>
      <div className="dropshipper-layout">
        {/* Professional topbar */}
        <div className="dropshipper-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {(() => {
              const fallback = `${import.meta.env.BASE_URL}BuySial2.png`
              const src = branding.headerLogo ? `${API_BASE}${branding.headerLogo}` : fallback
              return (
                <img
                  src={src}
                  alt="BuySial"
                  style={{ height: 36, width: 'auto', objectFit: 'contain' }}
                />
              )
            })()}
            {/* Professional Dropshipper identity chip */}
            <div
              style={{
                display: isMobile ? 'none' : 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                whiteSpace: 'nowrap'
              }}
            >
              <span aria-hidden style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      