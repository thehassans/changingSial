import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom'
import { API_BASE, apiGet } from '../api.js'

export default function InvestorLayout() {
  const [closed, setClosed] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  )
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  )

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark'
    } catch {
      return 'dark'
    }
  })

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

  const links = [
    { to: '/investor', label: 'Investment Plans' },
    { to: '/investor/my-invest', label: 'My Investments' },
    { to: '/investor/referrals', label: 'Referrals' },
    { to: '/investor/withdraw', label: 'Withdraw' },
    { to: '/investor/profile', label: 'Profile' },
  ]

  // Branding for header logo
  const [branding, setBranding] = useState({ headerLogo: null })
  const [me, setMe] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('me') || '{}')
    } catch {
      return {}
    }
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const j = await apiGet('/api/settings/branding')
        if (!cancelled) setBranding({ headerLogo: j.headerLogo || null })
      } catch {}
      try {
        const r = await apiGet('/api/users/me')
        if (!cancelled) setMe(r?.user || {})
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const mobileTabs = [
    {
      to: '/investor',
      label: 'Plans',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      to: '/investor/my-invest',
      label: 'Investments',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      to: '/investor/referrals',
      label: 'Referrals',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      to: '/investor/profile',
      label: 'Profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ]

  const tabsVisible = isMobile
  const hideSidebar = isMobile

  function doLogout() {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('me')
    } catch {}
    try {
      navigate('/login', { replace: true })
    } catch {}
    setTimeout(() => {
      try {
        window.location.assign('/login')
      } catch {}
    }, 30)
  }

  return (
    <div>
      <div className={`main ${hideSidebar ? 'full-mobile' : closed ? 'full' : ''} ${tabsVisible ? 'with-mobile-tabs' : ''}`}>
        {/* Topbar */}
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
            {/* Investor identity chip */}
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
              }}>💰</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Investor</span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>{me.firstName || 'Investor'} {me.lastName || ''}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              style={{
                width: '60px',
                height: '30px',
                background: theme === 'dark' ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                borderRadius: '15px',
                border: theme === 'dark' ? '2px solid #334155' : '2px solid #cbd5e1',
                cursor: 'pointer',
                position: 'relative',
                padding: 0
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
                transition: 'left 0.3s',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {theme === 'dark' ? '🌙' : '☀️'}
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={doLogout}
              className="btn secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Sidebar for desktop */}
        {!hideSidebar && (
          <div className="sidebar" style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}>
            <nav style={{ display: 'grid', gap: 4, padding: '12px 8px' }}>
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/investor'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    color: 'var(--fg)',
                    transition: 'all 0.2s'
                  }}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Main content */}
        <div className="content">
          <Outlet />
        </div>

        {/* Mobile bottom tabs */}
        {tabsVisible && (
          <div
            className="mobile-tabs"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'var(--sidebar-bg)',
              borderTop: '1px solid var(--sidebar-border)',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              height: '60px',
              zIndex: 100
            }}
          >
            {mobileTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/investor'}
                className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '8px 4px',
                  textDecoration: 'none',
                  color: 'var(--fg)',
                  fontSize: '11px',
                  fontWeight: 500
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
