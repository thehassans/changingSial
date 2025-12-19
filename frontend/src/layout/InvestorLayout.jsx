import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { apiGet } from '../api'
import './InvestorLayout.css'

export default function InvestorLayout() {
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    try {
      const res = await apiGet('/users/me')
      setUser(res?.user || res)
    } catch {
      handleLogout()
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('me')
    navigate('/login')
  }

  const menuItems = [
    { path: '/investor', icon: '📊', label: 'Dashboard', end: true },
    { path: '/investor/transactions', icon: '💸', label: 'Transactions' },
    { path: '/investor/profile', icon: '👤', label: 'Profile' },
  ]

  return (
    <div className="il-container">
      {/* Mobile Header */}
      <header className="il-mobile-header">
        <button className="il-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="il-mobile-title">Investor Portal</span>
      </header>

      {/* Sidebar */}
      <aside className={`il-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="il-sidebar-header">
          <div className="il-logo">
            <span className="il-logo-icon">💎</span>
            <span className="il-logo-text">Investor</span>
          </div>
          <button className="il-close-btn" onClick={() => setSidebarOpen(false)}>×</button>
        </div>

        {user && (
          <div className="il-user-card">
            <div className="il-user-avatar">
              {user.firstName?.[0] || 'I'}
            </div>
            <div className="il-user-info">
              <div className="il-user-name">{user.firstName} {user.lastName}</div>
              <div className="il-user-role">Investor</div>
            </div>
          </div>
        )}

        <nav className="il-nav">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `il-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="il-nav-icon">{item.icon}</span>
              <span className="il-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="il-sidebar-footer">
          <button onClick={handleLogout} className="il-logout-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && <div className="il-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="il-main">
        <Outlet context={{ user, refreshUser: loadUser }} />
      </main>
    </div>
  )
}
