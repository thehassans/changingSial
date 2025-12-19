import React, { useState, useEffect } from 'react'
import { apiGet } from '../../api'
import '../user/Investors.css'

export default function InvestorDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Fetch specifically for the logged-in investor
      const res = await apiGet('/users/investors/me/metrics')
      // Response structure from backend: { user: { ... } } or just user object? 
      // Checking backend users.js: res.json({ user: list[0] }) or logic?
      // Actually backend snippet 2157 calls User.findById... then res.json(inv) ?? 
      // Snippet was cut off. Usually standard is res.json({ ... }).
      // Let's assume it returns the user object directly or wrapped.
      // I'll check response structure safely.
      setData(res?.user || res) // Handle both { user: ... } and direct user object
    } catch (err) {
      console.error('Failed to load investor data:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('me')
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="investors-loading">
        <div className="investors-loading-spinner" />
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  if (!data?.investorProfile) {
    return (
      <div className="investors-container">
        <div className="investors-empty">
           <p>Profile not found or not active.</p>
           <button onClick={handleLogout} className="investors-btn-secondary">Log Out</button>
        </div>
      </div>
    )
  }

  const { investorProfile, firstName } = data
  const { 
    investmentAmount, 
    earnedProfit, 
    profitAmount, 
    profitPercentage, 
    currency, 
    status 
  } = investorProfile

  const progress = Math.min(100, (earnedProfit / profitAmount) * 100)
  const isCompleted = status === 'completed'

  return (
    <div className="investors-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Custom Header for Investor */}
      <div className="investors-header">
        <div>
           <div className="investors-subtitle">Welcome back,</div>
           <h1 className="investors-title">{firstName}</h1>
        </div>
        <button onClick={handleLogout} className="investors-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="investors-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="investors-stat-card">
          <div className="investors-stat-header">
            <span className="investors-stat-icon">💰</span>
            <span className="investors-stat-label">TOTAL INVESTMENT</span>
          </div>
          <div className="investors-stat-value" style={{ color: '#3b82f6' }}>
            {Number(investmentAmount).toLocaleString()} <span style={{ fontSize: '0.6em', opacity: 0.7 }}>{currency}</span>
          </div>
        </div>

        <div className="investors-stat-card">
          <div className="investors-stat-header">
            <span className="investors-stat-icon">📈</span>
            <span className="investors-stat-label">PROFIT EARNED</span>
          </div>
          <div className="investors-stat-value" style={{ color: '#10b981' }}>
            {Number(earnedProfit).toLocaleString()} <span style={{ fontSize: '0.6em', opacity: 0.7 }}>{currency}</span>
          </div>
        </div>

        <div className="investors-stat-card">
          <div className="investors-stat-header">
            <span className="investors-stat-icon">🎯</span>
            <span className="investors-stat-label">TARGET PROFIT</span>
          </div>
          <div className="investors-stat-value" style={{ color: '#8b5cf6' }}>
            {Number(profitAmount).toLocaleString()} <span style={{ fontSize: '0.6em', opacity: 0.7 }}>{currency}</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="investors-form-card">
        <div className="investor-progress">
          <div className="investor-progress-header">
             <span>Profit Progress</span>
             <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="investor-progress-bar">
            <div 
              className={`investor-progress-fill ${isCompleted ? 'completed' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
           {isCompleted ? (
             <div className="investor-completed-badge mt-4">
               🎉 Investment Completed! You have reached your profit target.
             </div>
           ) : (
             <div className="investor-status-active" style={{ display: 'inline-block', marginTop: '16px', borderRadius: '8px' }}>
                STATUS: {status.toUpperCase()}
             </div>
           )}
        </div>
        
        <div className="investors-grid" style={{ marginTop: '30px', gridTemplateColumns: '1fr' }}>
           <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' }}>Investment Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                 <div>
                    <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Profit Rate</span>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{profitPercentage}% <span style={{ fontSize: '12px', fontWeight: 'normal' }}>per order</span></div>
                 </div>
                 <div>
                    <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Started Date</span>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{new Date(data.createdAt).toLocaleDateString()}</div>
                 </div>
                 <div>
                   <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Account ID</span>
                   <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#64748b' }}>{data._id}</div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}
