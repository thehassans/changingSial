import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { apiGet } from '../api.js'
import './InvestorLayout.css'

export default function InvestorLayout() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('investor-theme') || 'dark')
  const navigate = useNavigate()
  const location = useLocation()

  // Apply theme effect
  useEffect(() => {
    localStorage.setItem('investor-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    let alive = true
    apiGet('/users/me')
      .then((data) => {
        if (!alive) return
        // Fix: backend returns { user: ... } so we must extract it
        const u = data?.user || data
        if (u && u.role === 'investor') {
          setUser(u)
        } else {
          // If not investor, maybe redirect or handled by ProtectedRoute
          // For now, allow but verify role
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('me')
    window.location.href = '/login'
  }

  const navLinks = [
    { to: '/investor', label: 'Dashboard', icon: '⚡' },
    { to: '/investor/transactions', label: 'Transactions', icon: '💰' },
    { to: '/investor/profile', label: 'Profile', icon: '👤' }, 
  ]

  if (loading) return <div className="il-container">Loading...</div>

  return (
    <div className="il-container" data-theme={theme}>
      {/* Sidebar (Desktop) */}
      <aside className="il-sidebar">
        <div className="il-sidebar-header">
          <div className="il-logo">
            <img 
              src={`${import.meta.env.BASE_URL}BuySial2.png`} 
              alt="BuySial" 
              className="il-logo-img"
            />
          </div>
        </div>

        <div className="il-user-card">
          <div className="il-user-avatar">
            {user?.firstName?.charAt(0) || 'I'}
          </div>
          <div className="il-user-info">
            <span className="il-user-name">{user?.firstName} {user?.lastName}</span>
            <span className="il-user-role">Investor Account</span>
          </div>
        </div>

        <nav className="il-nav">
          {navLinks.map(link => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              end={link.to === '/investor'}
              className={({ isActive }) => `il-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="il-nav-icon">{link.icon}</span>
              <span className="il-nav-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="il-sidebar-footer">
          <button className="il-theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button className="il-logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="il-main">
        <Outlet context={{ user, theme }} />
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="il-bottom-nav">
        {navLinks.map(link => (
          <NavLink 
            key={link.to} 
            to={link.to} 
            end={link.to === '/investor'}
            className={({ isActive }) => `il-bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="il-nav-icon">{link.icon}</span>
            <span className="il-nav-label">{link.label}</span>
          </NavLink>
        ))}
         <button className="il-bottom-nav-item" onClick={toggleTheme}>
             <span className="il-nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
             <span className="il-nav-label">Theme</span>
         </button>
      </nav>
    </div>
  )
}
