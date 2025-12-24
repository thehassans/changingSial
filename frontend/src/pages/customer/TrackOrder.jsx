import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiGet } from '../../api'

export default function TrackOrder() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const res = await apiGet(`/api/ecommerce/customer/orders/${id}`)
        setOrder(res.order)
        setTimeline(res.timeline || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const statusColors = {
    ordered: '#3b82f6',
    processing: '#f59e0b',
    assigned: '#8b5cf6',
    in_transit: '#0ea5e9',
    delivered: '#10b981',
    cancelled: '#ef4444'
  }

  const statusIcons = {
    ordered: '📝',
    processing: '✅',
    assigned: '🚚',
    in_transit: '🛵',
    delivered: '🎉'
  }

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
        <div className="spinner" style={{ width: 32, height: 32 }}></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Order not found</div>
        <Link to="/customer/orders" style={{ color: '#f97316', textDecoration: 'none' }}>
          ← Back to orders
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Back Button */}
      <Link 
        to="/customer/orders" 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 8, 
          color: '#64748b', 
          textDecoration: 'none',
          marginBottom: 24,
          fontSize: 14
        }}
      >
        ← Back to orders
      </Link>

      {/* Order Header */}
      <div style={{ 
        background: 'var(--panel)', 
        borderRadius: 12, 
        padding: 24, 
        border: '1px solid var(--border)',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>ORDER ID</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>#{order._id?.slice(-8).toUpperCase()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>TOTAL</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#f97316' }}>
              {order.currency || 'SAR'} {order.total?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: '#64748b' }}>
          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Tracking Timeline */}
      <div style={{ 
        background: 'var(--panel)', 
        borderRadius: 12, 
        padding: 24, 
        border: '1px solid var(--border)',
        marginBottom: 24
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, marginTop: 0 }}>Order Tracking</h2>
        
        <div style={{ position: 'relative', paddingLeft: 40 }}>
          {timeline.map((step, idx) => (
            <div key={idx} style={{ marginBottom: idx === timeline.length - 1 ? 0 : 32, position: 'relative' }}>
              {/* Connecting Line */}
              {idx !== timeline.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: -28,
                  top: 36,
                  width: 2,
                  height: 'calc(100% + 8px)',
                  background: step.completed ? '#10b981' : '#e2e8f0'
                }} />
              )}
              
              {/* Status Circle */}
              <div style={{
                position: 'absolute',
                left: -40,
                top: 0,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: step.completed ? statusColors[step.status] || '#10b981' : '#e2e8f0',
                display: 'grid',
                placeItems: 'center',
                fontSize: 12
              }}>
                {step.completed ? statusIcons[step.status] || '✓' : ''}
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{step.label}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {step.date && new Date(step.date).toLocaleString()}
                </div>
                {step.driver && (
                  <div style={{ 
                    marginTop: 8, 
                    padding: '8px 12px', 
                    background: 'rgba(139, 92, 246, 0.1)', 
                    borderRadius: 8,
                    fontSize: 13
                  }}>
                    🚚 Driver: <strong>{step.driver.name}</strong>
                    {step.driver.phone && <span style={{ marginLeft: 8, color: '#64748b' }}>{step.driver.phone}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Items */}
      <div style={{ 
        background: 'var(--panel)', 
        borderRadius: 12, 
        border: '1px solid var(--border)',
        overflow: 'hidden',
        marginBottom: 24
      }}>
        <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Order Items</h2>
        </div>
        {order.items?.map((item, idx) => (
          <div 
            key={idx} 
            style={{ 
              padding: 16, 
              borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Qty: {item.quantity}</div>
            </div>
            <div style={{ fontWeight: 700, color: '#f97316' }}>
              {order.currency || 'SAR'} {(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Address */}
      <div style={{ 
        background: 'var(--panel)', 
        borderRadius: 12, 
        padding: 20, 
        border: '1px solid var(--border)'
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, marginTop: 0 }}>Delivery Address</h2>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: '#64748b' }}>
          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{order.customerName}</div>
          <div>{order.address}</div>
          {order.area && <div>{order.area}</div>}
          <div>{order.city}, {order.orderCountry}</div>
          <div style={{ marginTop: 8 }}>📞 {order.phoneCountryCode} {order.customerPhone}</div>
        </div>
      </div>
    </div>
  )
}
