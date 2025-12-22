import React from 'react'

export default function ReferralAmounts() {
  return (
    <div className="container">
      <div className="page-header">
        <div>
          <div className="page-title">Referral Amounts</div>
          <div className="page-subtitle">Track referral earnings and payouts</div>
        </div>
      </div>
      <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Referral Amounts</div>
        <div>Referral earnings and commission tracking will appear here.</div>
      </div>
    </div>
  )
}
