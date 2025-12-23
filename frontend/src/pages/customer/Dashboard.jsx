import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../../api'

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          apiGet('/api/ecommerce/customer/profile'),
          apiGet('/api/ecommerce/customer/orders?limit=5')
        ])
        setProfile(profileRes)
        setOrders(ordersRes.orders || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
        <div className="spinner" style={{ width: 32, height: 32 }}></div>
      </div>
    )
  }

  const stats = profile?.stats || { totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, totalSpent: 0 }
  const customer = profile?.customer || {}

  const statusColors = {
    new: '#3b82f6',
    processing: '#f59e0b',
    done: '#10b981',
    cancelled: '#ef4444',
    delivered: '#10b981',
    pending: '#6b7280',
    assigned: '#8b5cf6',
    in_transit: '#0ea5e9'
  }

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Welcome back, {customer.firstName || 'Customer'}! 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: 15 }}>
          Track your orders and manage your account
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 16, 
        marginBottom: 32 
      }}>
        <div style={{ 
          background: 'var(--panel)', 
          borderRadius: 12, 
          padding: 20, 
          border: '1px solid var(--border)' 
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
            Total Orders
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#3b82f6' }}>
            {stats.totalOrders}
          </div>
        </div>

        <div style={{ 
          background: 'var(--panel)', 
          borderRadius: 12, 
          padding: 20, 
          border: '1px solid var(--border)' 
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
            Pending
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f59e0b' }}>
            {stats.pendingOrders}
          </div>
        </div>

        <div style={{ 
          background: 'var(--panel)', 
          borderRadius: 12, 
          padding: 20, 
          border: '1px solid var(--border)' 
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
            Delivered
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>
            {stats.deliveredOrders}
          </div>
        </div>

        <div style={{ 
          background: 'var(--panel)', 
          borderRadius: 12, 
          padding: 20, 
          border: '1px solid var(--border)' 
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
            Total Spent
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#8b5cf6' }}>
            {stats.totalSpent?.toFixed(2) || '0.00'}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{ 
        background: 'var(--panel)', 
        borderRadius: 12, 
        border: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Recent Orders</h2>
          <Link 
            to="/customer/orders" 
            style={{ fontSize: 13, color: '#f97316', textDecoration: 'none', fontWeight: 600 }}
          >
            View All →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No orders yet</div>
            <p style={{ fontSize: 14, marginBottom: 16 }}>Start shopping to see your orders here!</p>
            <Link 
              to="/catalog" 
              style={{ 
                display: 'inline-block',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: 'white',
                padding: '10px 24px',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14
              }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div>
            {orders.map((order) => (
              <Link 
                key={order._id}
                to={`/customer/orders/${order._id}`}
                style={{ 
                  display: 'block',
                  padding: 20, 
                  borderBottom: '1px solid var(--border)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--panel-2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = ''}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      Order #{order._id?.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <div style={{ 
                    padding: '4px 10px', 
                    borderRadius: 20, 
                    fontSize: 11, 
                    fontWeight: 600,
                    background: `${statusColors[order.shipmentStatus || order.status] || '#6b7280'}20`,
                    color: statusColors[order.shipmentStatus || order.status] || '#6b7280'
                  }}>
                    {(order.shipmentStatus || order.status)?.replace(/_/g, ' ').toUpperCase()}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    {order.items?.length || 0} item(s)
                  </div>
                  <div style={{ fontWeight: 700, color: '#f97316' }}>
                    {order.currency || 'SAR'} {order.total?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
