import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { API_BASE, apiGet, apiPatch } from '../api.js'

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

  const mobileTabs = [
    { to: '/dropshipper/dashboard', label: 'Dashboard', icon: links[0].icon },
    { to: '/dropshipper/products', label: 'Products', icon: links[1].icon },
    { to: '/dropshipper/submit-order', label: 'Orders', icon: links[2].icon },
    { to: '/dropshipper/orders', label: 'History', icon: links[3].icon },
    { to: '/dropshipper/finances', label: 'Earnings', icon: links[4].icon },
  ]

  return (
    <div>
      <div className={`main ${isMobile ? 'full-mobile with-mobile-tabs' : ''}`}>
        {/* Professional topbar matching agent panel */}
        <div
          className="topbar"
          style={{
            background: 'var(--sidebar-bg)',
            borderBottom: '1px solid var(--sidebar-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
            minHeight: '60px',
            padding: '0 1rem'
          }}
        >
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
                display: 'inline-flex',
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
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                fontSize: '16px'
              }}>📦</span>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1px'}}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Dropshipper</span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>{me.firstName || 'Dropshipper'} {me.lastName || ''}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, position: 'relative' }}>
            {/* Premium Theme Toggle */}
            <button
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}
              style={{
                position: 'relative',
                width: '60px',
                height: '30px',
                background: theme === 'dark' ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                borderRadius: '15px',
                border: theme === 'dark' ? '2px solid #334155' : '2px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: theme === 'dark' ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.1)',
                padding: 0,
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: theme === 'dark' ? '32px' : '4px',
                transform: 'translateY(-50%)',
                width: '22px',
                height: '22px',
                background: theme === 'dark' ? 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                borderRadius: '50%',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px'
              }}>
                {theme === 'dark' ? '🌙' : '☀️'}
              </div>
            </button>
            
            {/* Settings Button */}
            <button
              className="settings-button"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: showSettings ? '0 0 0 2px var(--accent)' : 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 9 3.09V3a2 2 0 0 1 4 0v.09c0 .67.39 1.28 1 1.57h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0c.3.61.91 1 1.58 1H21a2 2 0 0 1 0 4h-.09c-.67 0-1.28.39-1.57 1z"/>
              </svg>
            </button>

            {/* Settings Dropdown */}
            {showSettings && (
              <div 
                className="settings-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '280px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  padding: '12px'
                }}
              >
                <div style={{fontSize: '14px', fontWeight: 700, marginBottom: '12px', padding: '0 4px'}}>Settings</div>
                
                {/* Password Change */}
                <div style={{padding: '12px 8px', borderBottom: '1px solid var(--border)'}}>
                  <button
                    className="btn small secondary"
                    onClick={() => {
                      setShowSettings(false)
                      setShowPassModal(true)
                    }}
                    style={{width: '100%', fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Change Password
                  </button>
                </div>

                {/* Logout */}
                <div style={{padding: '12px 8px'}}>
                  <button
                    className="btn small danger"
                    onClick={() => {
                      setShowSettings(false)
                      doLogout()
                    }}
                    style={{width: '100%', fontSize: '12px', padding: '6px 12px'}}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar for desktop */}
        {!isMobile && (
          <aside className="sidebar">
            <nav className="nav">
              {links.map(l => (
                <NavLink key={l.to} to={l.to} className={({isActive}) => `link ${isActive?'active':''}`}>
                  {l.icon}
                  <span>{l.label}</span>
                </NavLink>
              ))}
            </nav>
            <div style={{padding: 24}}>
              <div style={{
                padding: 16, borderRadius: 12, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
                border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: 8
              }}>
                <div style={{fontSize:12, fontWeight:600, color:'#10b981'}}>PRO TIPS</div>
                <div style={{fontSize:11, color:'var(--text-secondary)', lineHeight: 1.4}}>
                  Maintain a high delivery rate to unlock exclusive products and faster payouts.
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="content">
          <Outlet />
        </div>

        {/* Mobile Bottom Tabs */}
        {isMobile && (
          <nav className="mobile-tabs">
            {mobileTabs.map(t => (
              <NavLink key={t.to} to={t.to} className={({isActive}) => `mobile-tab ${isActive?'active':''}`}>
                {React.cloneElement(t.icon, { width: 22, height: 22 })}
                <span>{t.label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>

      {/* Password Change Modal */}
      {showPassModal && (
        <div className="modal-overlay" onClick={() => setShowPassModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth: 400}}>
            <h3 style={{marginTop: 0}}>Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div style={{marginBottom: 16}}>
                <label style={{display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600}}>Current Password</label>
                <input
                  type="password"
                  className="input"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div style={{marginBottom: 16}}>
                <label style={{display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600}}>New Password</label>
                <input
                  type="password"
                  className="input"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div style={{marginBottom: 20}}>
                <label style={{display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600}}>Confirm New Password</label>
                <input
                  type="password"
                  className="input"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end'}}>
                <button type="button" className="btn secondary" onClick={() => setShowPassModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary" disabled={changingPass}>
                  {changingPass ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
