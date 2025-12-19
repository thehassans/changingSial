import React, { useState, useEffect } from 'react'
import { apiGet } from '../../api'
import './Dashboard.css'

export default function InvestorDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const res = await apiGet('/users/me')
      setData(res?.user || res) 
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
      <div className="investor-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!data?.investorProfile) {
    return (
      <div className="investor-dashboard">
        <div className="id-progress-card" style={{ textAlign: 'center' }}>
           <p className="id-stat-label">Profile not active</p>
           <button onClick={handleLogout} className="id-logout-btn" style={{ margin: '20px auto' }}>Log Out</button>
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
    status,
    createdAt
  } = investorProfile

  const progress = Math.min(100, (earnedProfit / profitAmount) * 100)
  const isCompleted = status === 'completed'

  return (
    <div className="investor-dashboard">
      {/* Header */}
      <div className="id-header">
        <div>
           <div className="id-welcome-label">Welcome back</div>
           <h1 className="id-user-name">{firstName}</h1>
        </div>
        <button onClick={handleLogout} className="id-logout-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>

      {/* Stats Grid */}
      <div className="id-stats-grid">
        <div className="id-stat-card" style={{ '--card-color-1': '#3b82f6', '--card-color-2': '#60a5fa', '--card-bg-1': '#3b82f6', '--card-bg-2': '#2563eb' }}>
          <div className="id-stat-icon-wrapper">
            <span>💰</span>
          </div>
          <div className="id-stat-label">Total Investment</div>
          <div className="id-stat-value">
            {Number(investmentAmount).toLocaleString()}
            <span className="id-stat-currency">{currency}</span>
          </div>
        </div>

        <div className="id-stat-card" style={{ '--card-color-1': '#10b981', '--card-color-2': '#34d399', '--card-bg-1': '#10b981', '--card-bg-2': '#059669' }}>
          <div className="id-stat-icon-wrapper">
            <span>📈</span>
          </div>
          <div className="id-stat-label">Profit Earned</div>
          <div className="id-stat-value">
            {Number(earnedProfit).toLocaleString()}
            <span className="id-stat-currency">{currency}</span>
          </div>
        </div>

        <div className="id-stat-card" style={{ '--card-color-1': '#8b5cf6', '--card-color-2': '#a78bfa', '--card-bg-1': '#8b5cf6', '--card-bg-2': '#7c3aed' }}>
          <div className="id-stat-icon-wrapper">
            <span>🎯</span>
          </div>
          <div className="id-stat-label">Target Profit</div>
          <div className="id-stat-value">
            {Number(profitAmount).toLocaleString()}
            <span className="id-stat-currency">{currency}</span>
          </div>
        </div>
      </div>

      {/* Progress & Details */}
      <div className="id-progress-card">
        <div className="id-progress-header">
           <h2 className="id-card-title">Investment Progress</h2>
           <span style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6' }}>{progress.toFixed(1)}%</span>
        </div>
        
        <div className="id-progress-track">
          <div 
            className="id-progress-fill"
            style={{ width: `${Math.max(2, progress)}%` }} // Ensure at least tiny bit visible
          />
        </div>

        <div className={`id-status-badge ${status === 'active' ? 'active' : ''}`}>
          <div className="id-status-dot" />
          STATUS: {status}
          {isCompleted && ' - COMPLETED 🎉'}
        </div>

        <div className="id-details-grid">
           <div className="id-detail-item">
              <span className="id-detail-label">Profit Rate</span>
              <span className="id-detail-value">{profitPercentage}% <span style={{fontSize: '14px', fontWeight: '400', color: '#94a3b8'}}>per order</span></span>
           </div>
           
           <div className="id-detail-item">
              <span className="id-detail-label">Started Date</span>
              <span className="id-detail-value">{new Date(createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
           </div>

           <div className="id-detail-item">
              <span className="id-detail-label">Account ID</span>
              <span className="id-detail-value" style={{ fontFamily: 'monospace', fontSize: '14px' }}>{data._id}</span>
           </div>
        </div>

      </div>
    </div>
  )
}
