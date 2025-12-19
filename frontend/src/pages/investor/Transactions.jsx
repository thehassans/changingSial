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
      <div className="id-header">
        <div>
          <div className="id-welcome-label">Transaction History</div>
          <h1 className="id-user-name">Your Earnings</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="id-stats-grid">
        <div className="id-stat-card" style={{ '--card-color-1': '#10b981', '--card-color-2': '#34d399', '--card-bg-1': '#10b981', '--card-bg-2': '#059669' }}>
          <div className="id-stat-icon-wrapper">
            <span>💰</span>
          </div>
          <div className="id-stat-label">Total Earned</div>
          <div className="id-stat-value">
            {Number(earnedProfit).toLocaleString()}
            <span className="id-stat-currency">{currency}</span>
          </div>
        </div>

        <div className="id-stat-card" style={{ '--card-color-1': '#3b82f6', '--card-color-2': '#60a5fa', '--card-bg-1': '#3b82f6', '--card-bg-2': '#2563eb' }}>
          <div className="id-stat-icon-wrapper">
            <span>📈</span>
          </div>
          <div className="id-stat-label">This Month</div>
          <div className="id-stat-value">
            {Number(earnedProfit).toLocaleString()}
            <span className="id-stat-currency">{currency}</span>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="id-progress-card">
        <h2 className="id-card-title">Recent Activity</h2>
        
        <div className="it-list">
          {transactions.length === 0 ? (
            <div className="it-empty">
              <span>📭</span>
              <p>No transactions yet</p>
            </div>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className="it-item">
                <div className="it-item-icon">
                  {tx.type === 'profit' ? '📈' : '💸'}
                </div>
                <div className="it-item-details">
                  <div className="it-item-desc">{tx.description}</div>
                  <div className="it-item-date">{tx.date.toLocaleDateString()}</div>
                </div>
                <div className={`it-item-amount ${tx.type}`}>
                  {tx.type === 'profit' ? '+' : '-'}{Number(tx.amount).toLocaleString()} {currency}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="it-note">
          <span>ℹ️</span>
          <p>Profits are automatically distributed from completed orders based on your investment agreement.</p>
        </div>
      </div>

      <style>{`
        .it-list {
          margin-top: 24px;
        }
        .it-empty {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
        }
        .it-empty span {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }
        .it-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 16px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
        }
        .it-item:hover {
          background: #f1f5f9;
          transform: translateX(4px);
        }
        .it-item-icon {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .it-item-details {
          flex: 1;
        }
        .it-item-desc {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }
        .it-item-date {
          font-size: 13px;
          color: #94a3b8;
        }
        .it-item-amount {
          font-weight: 700;
          font-size: 18px;
        }
        .it-item-amount.profit {
          color: #10b981;
        }
        .it-item-amount.withdrawal {
          color: #ef4444;
        }
        .it-note {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-top: 24px;
          padding: 16px;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }
        .it-note span {
          font-size: 20px;
        }
        .it-note p {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}
