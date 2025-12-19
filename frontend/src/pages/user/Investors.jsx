import React, { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPatch, apiDelete } from '../../api'

const CURRENCIES = ['SAR', 'AED', 'OMR', 'BHD', 'INR', 'KWD', 'QAR', 'USD', 'CNY']

export default function Investors() {
  const [investors, setInvestors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingInvestor, setEditingInvestor] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    investmentAmount: '',
    profitAmount: '',
    profitPercentage: '15',
    currency: 'SAR',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadInvestors = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiGet('/user/investors')
      setInvestors(res.users || [])
    } catch (err) {
      console.error('Failed to load investors:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInvestors()
  }, [loadInvestors])

  const resetForm = () => {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      investmentAmount: '',
      profitAmount: '',
      profitPercentage: '15',
      currency: 'SAR',
    })
    setEditingInvestor(null)
    setError('')
  }

  const openCreate = () => {
    resetForm()
    setShowModal(true)
  }

  const openEdit = (investor) => {
    setEditingInvestor(investor)
    setForm({
      firstName: investor.firstName || '',
      lastName: investor.lastName || '',
      email: investor.email || '',
      password: '',
      phone: investor.phone || '',
      investmentAmount: investor.investorProfile?.investmentAmount?.toString() || '',
      profitAmount: investor.investorProfile?.profitAmount?.toString() || '',
      profitPercentage: investor.investorProfile?.profitPercentage?.toString() || '15',
      currency: investor.investorProfile?.currency || 'SAR',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const payload = {
        ...form,
        investmentAmount: parseFloat(form.investmentAmount) || 0,
        profitAmount: parseFloat(form.profitAmount) || 0,
        profitPercentage: parseFloat(form.profitPercentage) || 15,
      }

      if (editingInvestor) {
        await apiPatch(`/user/investors/${editingInvestor._id}`, payload)
      } else {
        await apiPost('/user/investors', payload)
      }

      setShowModal(false)
      resetForm()
      loadInvestors()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save investor')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleProfit = async (investor) => {
    try {
      await apiPost(`/user/investors/${investor._id}/toggle-profit`)
      loadInvestors()
    } catch (err) {
      console.error('Failed to toggle profit:', err)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await apiDelete(`/user/investors/${deleteConfirm._id}`)
      setDeleteConfirm(null)
      loadInvestors()
    } catch (err) {
      console.error('Failed to delete investor:', err)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: 'Active' },
      inactive: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', text: 'Paused' },
      completed: { bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', text: 'Completed' },
    }
    const s = styles[status] || styles.inactive
    return (
      <span style={{
        background: s.bg,
        color: '#fff',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {s.text}
      </span>
    )
  }

  const getProgress = (investor) => {
    const earned = investor.investorProfile?.earnedProfit || 0
    const target = investor.investorProfile?.profitAmount || 1
    return Math.min(100, (earned / target) * 100)
  }

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
          }}>
            Investor Management
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Manage your investors and track profit distribution
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)'
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Investor
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Total Investors', value: investors.length, color: '#3b82f6', icon: '👥' },
          { label: 'Active', value: investors.filter(i => i.investorProfile?.status === 'active').length, color: '#10b981', icon: '✅' },
          { label: 'Completed', value: investors.filter(i => i.investorProfile?.status === 'completed').length, color: '#8b5cf6', icon: '🏆' },
          { label: 'Total Invested', value: formatCurrency(investors.reduce((s, i) => s + (i.investorProfile?.investmentAmount || 0), 0), 'SAR'), color: '#f59e0b', icon: '💰' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>{stat.icon}</span>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Investors Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading investors...</div>
      ) : investors.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '20px',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💼</div>
          <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '24px' }}>No investors yet. Add your first investor to start tracking profits!</p>
          <button onClick={openCreate} style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
            Add First Investor
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
          {investors.map((inv) => (
            <div key={inv._id} style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'transform 0.3s, box-shadow 0.3s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#fff',
                  }}>
                    {inv.firstName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>
                      {inv.firstName} {inv.lastName}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '13px' }}>{inv.email}</div>
                  </div>
                </div>
                {getStatusBadge(inv.investorProfile?.status)}
              </div>

              {/* Investment Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Investment</div>
                  <div style={{ color: '#60a5fa', fontSize: '18px', fontWeight: '700' }}>
                    {formatCurrency(inv.investorProfile?.investmentAmount, inv.investorProfile?.currency)}
                  </div>
                </div>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Profit/Order</div>
                  <div style={{ color: '#a78bfa', fontSize: '18px', fontWeight: '700' }}>
                    {inv.investorProfile?.profitPercentage || 0}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>Profit Progress</span>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                    {formatCurrency(inv.investorProfile?.earnedProfit, inv.investorProfile?.currency)} / {formatCurrency(inv.investorProfile?.profitAmount, inv.investorProfile?.currency)}
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${getProgress(inv)}%`,
                    background: inv.investorProfile?.status === 'completed'
                      ? 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)'
                      : 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                {inv.investorProfile?.status === 'completed' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#a78bfa',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}>
                    🎉 Investment Completed!
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {inv.investorProfile?.status !== 'completed' && (
                  <button
                    onClick={() => handleToggleProfit(inv)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: inv.investorProfile?.status === 'active'
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      transition: 'transform 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {inv.investorProfile?.status === 'active' ? '⏸️ Pause' : '▶️ Start'}
                  </button>
                )}
                <button
                  onClick={() => openEdit(inv)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#94a3b8'
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(inv)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'transparent',
                    color: '#ef4444',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '24px',
            }}>
              {editingInvestor ? 'Edit Investor' : 'Add New Investor'}
            </h2>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '20px',
                color: '#ef4444',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>First Name *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Last Name *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+966 XXX XXX XXXX"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              {!editingInvestor && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Password *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editingInvestor}
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Investment Amount *</label>
                  <input
                    type="number"
                    value={form.investmentAmount}
                    onChange={(e) => setForm({ ...form, investmentAmount: e.target.value })}
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c} style={{ background: '#1e293b' }}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Total Profit Amount *</label>
                  <input
                    type="number"
                    value={form.profitAmount}
                    onChange={(e) => setForm({ ...form, profitAmount: e.target.value })}
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Profit % Per Order</label>
                  <input
                    type="number"
                    value={form.profitPercentage}
                    onChange={(e) => setForm({ ...form, profitPercentage: e.target.value })}
                    min="0"
                    max="100"
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 2,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Saving...' : editingInvestor ? 'Update Investor' : 'Create Investor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setDeleteConfirm(null)}>
          <div style={{
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '12px' }}>Delete Investor?</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
              Are you sure you want to delete <strong style={{ color: '#fff' }}>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'transparent',
                  color: '#94a3b8',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
