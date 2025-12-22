import React from 'react'

export default function ReferralDetails() {
  return (
    <div className="container">
      <div className="page-header">
        <div>
          <div className="page-title">Referral Details</div>
          <div className="page-subtitle">View and manage referral information</div>
        </div>
      </div>
      <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Referral Details</div>
        <div>Referral tracking and details will appear here.</div>
      </div>
    </div>
  )
}
