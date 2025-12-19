import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import './Dashboard.css'

export default function Profile() {
  const { user } = useOutletContext()
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const profile = user.investorProfile || {}

  function copyId() {
    navigator.clipboard.writeText(user._id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="investor-dashboard">
      <div className="id-header">
        <div>
          <div className="id-welcome-label">Your Account</div>
          <h1 className="id-user-name">Profile</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="id-progress-card">
        <div className="ip-profile-header">
          <div className="ip-avatar">
            {user.firstName?.[0] || 'I'}
          </div>
          <div className="ip-profile-info">
            <h2 className="ip-name">{user.firstName} {user.lastName}</h2>
            <span className="ip-badge">Investor</span>
          </div>
        </div>

        <div className="id-details-grid" style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
          <div className="id-detail-item">
            <span className="id-detail-label">Email</span>
            <span className="id-detail-value">{user.email}</span>
          </div>
          
          <div className="id-detail-item">
            <span className="id-detail-label">Phone</span>
            <span className="id-detail-value">{user.phone || 'Not provided'}</span>
          </div>

          <div className="id-detail-item">
            <span className="id-detail-label">Member Since</span>
            <span className="id-detail-value">
              {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Investment Details */}
      <div className="id-progress-card" style={{ marginTop: '24px' }}>
        <h2 className="id-card-title">Investment Agreement</h2>
        
        <div className="id-details-grid" style={{ marginTop: '24px' }}>
          <div className="id-detail-item">
            <span className="id-detail-label">Investment Amount</span>
            <span className="id-detail-value" style={{ color: '#3b82f6' }}>
              {Number(profile.investmentAmount || 0).toLocaleString()} {profile.currency}
            </span>
          </div>
          
          <div className="id-detail-item">
            <span className="id-detail-label">Target Profit</span>
            <span className="id-detail-value" style={{ color: '#8b5cf6' }}>
              {Number(profile.profitAmount || 0).toLocaleString()} {profile.currency}
            </span>
          </div>

          <div className="id-detail-item">
            <span className="id-detail-label">Profit Rate</span>
            <span className="id-detail-value">{profile.profitPercentage || 0}% per order</span>
          </div>

          <div className="id-detail-item">
            <span className="id-detail-label">Status</span>
            <span className={`ip-status-badge ${profile.status}`}>
              {profile.status || 'unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Account ID */}
      <div className="id-progress-card" style={{ marginTop: '24px' }}>
        <h2 className="id-card-title">Account Reference</h2>
        <div className="ip-account-id">
          <code>{user._id}</code>
          <button onClick={copyId} className="ip-copy-btn">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <style>{`
        .ip-profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .ip-avatar {
          width: 80px;
          height: 80px;
          border-radius: 24px;
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          color: white;
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.35);
        }
        .ip-name {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px;
        }
        .ip-badge {
          display: inline-block;
          padding: 6px 14px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          color: #8b5cf6;
        }
        .ip-status-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .ip-status-badge.active {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }
        .ip-status-badge.paused {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        }
        .ip-status-badge.completed {
          background: rgba(59, 130, 246, 0.1);
          color: #2563eb;
        }
        .ip-account-id {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
        }
        .ip-account-id code {
          flex: 1;
          font-family: 'SF Mono', monospace;
          font-size: 14px;
          color: #64748b;
          word-break: break-all;
        }
        .ip-copy-btn {
          padding: 8px 16px;
          background: #1e293b;
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ip-copy-btn:hover {
          background: #334155;
        }
      `}</style>
    </div>
  )
}
