import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { API_BASE, apiGet, apiPatch } from '../api.js'

const STYLES = `
  .customer-layout {
    min-height: 100vh;
    background: var(--bg, #f8fafc);
    color: var(--text, #0f172a);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  [data-theme="dark"] .customer-layout {
    --bg: #0f172a;
    --text: #f8fafc;
    --panel: rgba(30, 41, 59, 0.7);
    --panel-2: rgba(51, 65, 85, 0.5);
    --border: rgba(255, 255, 255, 0.08);
    --header-bg: rgba(15, 23, 42, 0.95);
  }

  [data-theme="light"] .customer-layout,
  .customer-layout {
    --bg: #f8fafc;
    --text: #0f172a;
    --panel: #ffffff;
    --panel-2: #f1f5f9;
    --border: rgba(0, 0, 0, 0.08);
    --header-bg: #ffffff;
  }

  .customer-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--header-bg);
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .customer-nav {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .customer-nav-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    color: var(--text);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    opacity: 0.7;
  }

  .customer-nav-link:hover {
    opacity: 1;
    background: var(--panel-2);
  }

  .customer-nav-link.active {
    opacity: 1;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 88, 12, 0.1));
    color: #f97316;
    font-weight: 600;
  }

  .customer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }

  .customer-user-menu {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .customer-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #ea580c);
    display: grid;
    place-items: center;
    font-weight: 700;
    color: white;
    font-size: 14px;
  }

  .customer-mobile-tabs {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 72px;
    background: var(--header-bg);
    border-top: 1px solid var(--border);
    z-index: 100;
    justify-content: space-around;
    align-items: center;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .customer-mobile-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: var(--text);
    text-decoration: none;
    font-size: 11px;
    font-weight: 500;
    opacity: 0.6;
    flex: 1;
    height: 100%;
    justify-content: center;
  }

  .customer-mobile-tab.active {
    opacity: 1;
    color: #f97316;
  }

  @media (max-width: 768px) {
    .customer-nav {
      display: none;
    }
    .customer-mobile-tabs {
      display: flex;
    }
    .customer-content {
      padding: 16px;
      padding-bottom: 88px;
    }
    .customer-header {
      padding: 0 16px;
    }
  }
`

export default function CustomerLayout() {
  const navigate = useNavigate()
  const [me, setMe] = useState(() => {
    try { return JSON.parse(localStorage.getItem('me') || '{}') }
    catch { return {} }
  })
  const [branding, setBranding] = useState({ headerLogo: null })

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
    return () => { cancelled = true }
  }, [])

  function doLogout() {
    try { 
      localStorage.removeItem('token')
      localStorage.removeItem('me') 
    } catch {}
    navigate('/customer-login', { replace: true })
  }

  const links = [
    { to: '/customer', label: 'Dashboard', icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { to: '/customer/orders', label: 'My Orders', icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { to: '/catalog', label: 'Shop', icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )},
  ]

  return (
    <>
      <style>{STYLES}</style>
      <div className="customer-layout">
        <header className="customer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <img
              src={branding.headerLogo ? `${API_BASE}${branding.headerLogo}` : `${import.meta.env.BASE_URL}BuySial2.png`}
              alt="Logo"
              style={{ height: 32, width: 'auto' }}
            />
            <nav className="customer-nav">
              {links.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/customer'}
                  className={({ isActive }) => `customer-nav-link ${isActive ? 'active' : ''}`}
                >
                  {l.icon}
                  <span>{l.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="customer-user-menu">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{me.firstName} {me.lastName}</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>{me.email}</div>
            </div>
            <div className="customer-avatar">
              {me.firstName?.[0] || 'C'}
            </div>
            <button
              onClick={doLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: 'none',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="customer-content">
          <Outlet />
        </main>

        <nav className="customer-mobile-tabs">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/customer'}
              className={({ isActive }) => `customer-mobile-tab ${isActive ? 'active' : ''}`}
            >
              {React.cloneElement(l.icon, { width: 24, height: 24 })}
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}
