import React from 'react'
import { useOutletContext } from 'react-router-dom'
import './Dashboard.css'

export default function Transactions() {
  const { user } = useOutletContext()
  const profile = user?.investorProfile || {}
  const { currency = 'SAR', earnedProfit = 0 } = profile

  // Placeholder transactions - in real app would come from API
  const transactions = [
    { id: 1, type: 'profit', amount: earnedProfit, date: new Date(), description: 'Total Accumulated Profit' },
  ]

  return (
    <div className="investor-dashboard">
      <div className="id-background-overlay" />
      
      {/* Header */}
      <div className="id-header">
        <div className="id-welcome">
           <span className="id-greeting">Financial Records</span>
           <h1 className="id-name">Transactions</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="id-stats-grid">
        <div className="id-stat-card glass">
          <div className="id-stat-icon green">
            💰
          </div>
          <div className="id-stat-content">
            <span className="id-stat-label">Total Earned</span>
            <div className="id-stat-value highlight">
              {Number(earnedProfit).toLocaleString()} <span className="currency">{currency}</span>
            </div>
            <div className="id-stat-sub">Lifetime Profit</div>
          </div>
        </div>

        <div className="id-stat-card glass">
          <div className="id-stat-icon blue">
            📈
          </div>
          <div className="id-stat-content">
            <span className="id-stat-label">This Month</span>
            <div className="id-stat-value">
              {Number(earnedProfit).toLocaleString()} <span className="currency">{currency}</span>
            </div>
            <div className="id-stat-sub">Current Period</div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="id-activity-feed" style={{ marginTop: '0' }}>
        <h3>Recent Activity</h3>
        
        <div className="activity-list">
          {transactions.length === 0 ? (
            <div className="it-empty" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📭</span>
              <p>No transactions yet</p>
            </div>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className="activity-item">
                <div className="activity-icon">
                  {tx.type === 'profit' ? '⚡' : '💸'}
                </div>
                <div className="activity-info">
                  <span className="activity-title">{tx.description}</span>
                  <span className="activity-time">{tx.date.toLocaleDateString()}</span>
                </div>
                <div className={`activity-amount ${tx.type === 'profit' ? 'positive' : ''}`}>
                  {tx.type === 'profit' ? '+' : '-'}{Number(tx.amount).toLocaleString()} {currency}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
