import React, { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPatch, apiDelete } from '../../api'
import './References.css'

export default function References() {
  const [references, setReferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedRef, setExpandedRef] = useState(null)

  const loadReferences = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiGet('/users/references')
      setReferences(res.references || [])
      
      // Load investors for each reference
      const refsWithInvestors = await Promise.all(
        (res.references || []).map(async (ref) => {
          try {
            const invRes = await apiGet(`/users/references/${ref._id}/investors`)
            return { ...ref, investors: invRes.investors || [] }
          } catch {
            return { ...ref, investors: [] }
          }
        })
      )
      setReferences(refsWithInvestors)
    } catch (err) {
      console.error('Failed to load references:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReferences()
  }, [loadReferences])

  const totalInvestors = references.reduce((sum, ref) => sum + (ref.investors?.length || 0), 0)
  const totalEarned = references.reduce((sum, ref) => sum + (ref.referenceProfile?.totalEarned || 0), 0)

  return (
    <div className="references-container">
      <div className="references-header">
        <div>
          <h1 className="references-title">References</h1>
          <p className="references-subtitle">Track commission and referred investors</p>
        </div>
      </div>

      {/* Stats */}
      <div className="references-stats">
        <div className="references-stat-card">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <div className="stat-label">Total References</div>
            <div className="stat-value">{references.length}</div>
          </div>
        </div>
        <div className="references-stat-card">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <circle cx="15" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <div className="stat-label">Investors Referred</div>
            <div className="stat-value">{totalInvestors}</div>
          </div>
        </div>
        <div className="references-stat-card">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <div className="stat-label">Total Earned</div>
            <div className="stat-value">{totalEarned.toLocaleString()} SAR</div>
          </div>
        </div>
      </div>

      {/* References Grid */}
      {loading ? (
        <div className="references-loading">
          <div className="spinner"></div>
          <p>Loading references...</p>
        </div>
      ) : references.length === 0 ? (
        <div className="references-empty">
          <div className="empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <p>No references yet. References will appear here when assigned to investors.</p>
        </div>
      ) : (
        <div className="references-grid">
          {references.map((ref) => (
            <div key={ref._id} className="reference-card">
              <div className="reference-header">
                <div className="reference-avatar">
                  {ref.firstName?.[0]?.toUpperCase() || 'R'}
                </div>
                <div className="reference-info">
                  <div className="reference-name">{ref.firstName} {ref.lastName}</div>
                  <div className="reference-email">{ref.email}</div>
                  {ref.phone && <div className="reference-phone">{ref.phone}</div>}
                </div>
              </div>

              <div className="reference-stats-row">
                <div className="stat-box">
                  <div className="stat-box-label">Commission</div>
                  <div className="stat-box-value">{ref.referenceProfile?.commissionPerOrder || 0}%</div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-label">Investors</div>
                  <div className="stat-box-value">{ref.investors?.length || 0}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-label">Earned</div>
                  <div className="stat-box-value">{(ref.referenceProfile?.totalEarned || 0).toLocaleString()}</div>
                </div>
              </div>

              {ref.investors?.length > 0 && (
                <div className="reference-investors">
                  <button
                    className="toggle-investors-btn"
                    onClick={() => setExpandedRef(expandedRef === ref._id ? null : ref._id)}
                  >
                    {expandedRef === ref._id ? 'â Hide' : 'â Show'} Investors ({ref.investors.length})
                  </button>
                  
                  {expandedRef === ref._id && (
                    <div className="investors-list">
                      {ref.investors.map((inv) => (
                        <div key={inv._id} className="investor-item">
                          <div className="investor-item-name">
                            {inv.firstName} {inv.lastName}
                          </div>
                          <div className="investor-item-investment">
                            {(inv.investorProfile?.investmentAmount || 0).toLocaleString()} {inv.investorProfile?.currency}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
