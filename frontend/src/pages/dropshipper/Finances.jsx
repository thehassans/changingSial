import React, { useEffect, useState } from 'react'
import { apiGet } from '../../api'

export default function DropshipperFinances() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all') // all, month, week
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiGet('/api/dropshippers/finances')
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Ultra premium loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'grid', 
        placeItems: 'center', 
        height: 400,
        gap: 16
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'grid',
          placeItems: 'center',
          animation: 'pulse 1.5s infinite'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div style={{ color: 'var(--ds-text-secondary)', fontWeight: 500 }}>Loading your earnings...</div>
      </div>
    )
  }

  // Calculate stats
  const totalOrders = data?.orders?.length || 0
  const totalRevenue = data?.orders?.reduce((sum, o) => sum + (o.totalPrice || 0), 0) || 0
  const totalDropshipCost = data?.orders?.reduce((sum, o) => sum + (o.dropshipCost || o.subtotal || 0), 0) || 0
  const totalShipping = data?.orders?.reduce((sum, o) => sum + (o.shippingCost || 0), 0) || 0
  const profitMargin = totalRevenue > 0 ? ((data?.totalProfit || 0) / totalRevenue * 100).toFixed(1) : 0

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 32, 
      paddingBottom: 40,
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ 
            fontSize: 32, 
            fontWeight: 800, 
            margin: 0,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            💰 Earnings Dashboard
          </h1>
          <p style={{ color: 'var(--ds-text-secondary)', marginTop: 8, fontSize: 16 }}>
            Track your profits, payouts, and order performance
          </p>
        </div>
        
        {/* Period Filter */}
        <div style={{ 
          display: 'flex', 
          gap: 4, 
          background: 'var(--ds-glass)', 
          padding: 4, 
          borderRadius: 12,
          border: '1px solid var(--ds-border)'
        }}>
          {[
            { value: 'all', label: 'All Time' },
            { value: 'month', label: 'This Month' },
            { value: 'week', label: 'This Week' }
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: 10,
                background: period === p.value 
                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                  : 'transparent',
                color: period === p.value ? 'white' : 'var(--ds-text-secondary)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 20,
        width: '100%'
      }}>
        {/* Total Earnings */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: 20,
          padding: 28,
      