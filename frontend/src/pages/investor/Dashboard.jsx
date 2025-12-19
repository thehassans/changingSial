import React from 'react'
import { useOutletContext } from 'react-router-dom'
import './Dashboard.css'

export default function InvestorDashboard() {
  const { user } = useOutletContext()

  if (!user?.investorProfile) {
    return (
      <div className="investor-dashboard">
        <div className="id-progress-card" style={{ textAlign: 'center' }}>
           <p className="id-stat-label">Loading...</p>
        </div>
      </div>
    )
  }

  const { investorProfile, firstName } = user
  const { 
    investmentAmount, 
    earnedProfit, 
    profitAmount, 
    profitPercentage, 
    currency, 
    status
  } = investorProfile

  const progress = Math.min(100, profitAmount > 0 ? (earnedProfit / profitAmount) * 100 : 0)
  const remaining = Math.max(0, profitAmount - earnedProfit)
  const isCompleted = status === 'completed'

  return (
    <div className="investor-dashboard">
      {/* Header */}
      <div className="id-header">
        <div>
           <div className="id-welcome-label">Welcome back</div>
           <h1 className="id-user-name">{firstName}</h1>
        </div>
      </div>

      {/* Target Profit Hero Card */}
      <div className="id-target-hero">
        <div className="id-target-glow" />
        <div className="id-target-content">
          <div className="id-target-icon">🎯</div>
          <div className="id-target-label">Target Profit</div>
          <div className="id-target-value">
            {Number(profitAmount).toLocaleString()}
            <span className="id-target-currency">{currency}</span>
          </div>
          <div className="id-target-remaining">
            {isCompleted ? (
              <span className="id-target-complete">🎉 Target Achieved!</span>
            ) : (
              <>
                <span>{Number(remaining).toLocaleString()} {currency}</span> remaining
              </>
            )}
          </div>
        </div>
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

        <div className="id-stat-card" style={{ '--card-color-1': '#f59e0b', '--card-color-2': '#fbbf24', '--card-bg-1': '#f59e0b', '--card-bg-2': '#d97706' }}>
          <div className="id-stat-icon-wrapper">
            <span>⚡</span>
          </div>
          <div className="id-stat-label">Profit Rate</div>
          <div className="id-stat-value">
            {profitPercentage}%
            <span className="id-stat-currency">per order</span>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="id-progress-card">
        <div className="id-progress-header">
           <h2 className="id-card-title">Progress to Target</h2>
           <span style={{ fontSize: '24px', fontWeight: '800', color: '#8b5cf6' }}>{progress.toFixed(1)}%</span>
        </div>
        
        <div className="id-progress-track">
          <div 
            className="id-progress-fill"
            style={{ width: `${Math.max(2, progress)}%` }}
          />
        </div>

        <div className={`id-status-badge ${status === 'active' ? 'active' : ''}`}>
          <div className="id-status-dot" />
          STATUS: {status?.toUpperCase()}
          {isCompleted && ' 🎉'}
        </div>

        <div className="id-details-grid">
           <div className="id-detail-item">
              <span className="id-detail-label">Invested</span>
              <span className="id-detail-value" style={{ color: '#3b82f6' }}>{Number(investmentAmount).toLocaleString()} {currency}</span>
           </div>
           
           <div className="id-detail-item">
              <span className="id-detail-label">Earned</span>
              <span className="id-detail-value" style={{ color: '#10b981' }}>{Number(earnedProfit).toLocaleString()} {currency}</span>
           </div>

           <div className="id-detail-item">
              <span className="id-detail-label">Target</span>
              <span className="id-detail-value" style={{ color: '#8b5cf6' }}>{Number(profitAmount).toLocaleString()} {currency}</span>
           </div>
        </div>
      </div>
    </div>
  )
}

