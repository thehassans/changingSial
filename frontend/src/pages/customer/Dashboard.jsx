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
      <>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
        <style jsx>{`
          .dashboard-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 16px;
          }
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #f1f5f9;
            border-top-color: #f97316;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .dashboard-loading p {
            color: #64748b;
            font-size: 14px;
          }
        `}</style>
      </>
    )
  }

  const stats = profile?.stats || { totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, totalSpent: 0 }
  const customer = profile?.customer || {}

  const statusConfig = {
    new: { color: '#3b82f6', bg: '#eff6ff', label: 'New' },
    processing: { color: '#f59e0b', bg: '#fffbeb', label: 'Processing' },
    done: { color: '#10b981', bg: '#ecfdf5', label: 'Complete' },
    cancelled: { color: '#ef4444', bg: '#fef2f2', label: 'Cancelled' },
    delivered: { color: '#10b981', bg: '#ecfdf5', label: 'Delivered' },
    pending: { color: '#6b7280', bg: '#f9fafb', label: 'Pending' },
    assigned: { color: '#8b5cf6', bg: '#f5f3ff', label: 'Assigned' },
    in_transit: { color: '#0ea5e9', bg: '#f0f9ff', label: 'In Transit' }
  }

  return (
    <>
      <div className="customer-dashboard">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <div className="avatar">
              {(customer.firstName?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <h1>Welcome back, {customer.firstName || 'Customer'}! 👋</h1>
              <p>Track your orders and manage your account</p>
            </div>
          </div>
          <Link to="/catalog" className="shop-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card" style={{ '--accent': '#3b82f6' }}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalOrders}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>

          <div className="stat-card" style={{ '--accent': '#f59e0b' }}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.pendingOrders}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>

          <div className="stat-card" style={{ '--accent': '#10b981' }}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.deliveredOrders}</span>
              <span className="stat-label">Delivered</span>
            </div>
          </div>

          <div className="stat-card" style={{ '--accent': '#8b5cf6' }}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalSpent?.toFixed(0) || '0'}</span>
              <span className="stat-label">Total Spent</span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="orders-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/customer/orders" className="view-all">
              View All
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon">📦</div>
              <h3>No orders yet</h3>
              <p>Start shopping to see your orders here!</p>
              <Link to="/catalog" className="browse-btn">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order, index) => {
                const status = statusConfig[order.shipmentStatus || order.status] || statusConfig.pending
                return (
                  <Link 
                    key={order._id}
                    to={`/customer/orders/${order._id}`}
                    className="order-card"
                    style={{ '--delay': `${index * 0.1}s` }}
                  >
                    <div className="order-main">
                      <div className="order-info">
                        <span className="order-id">#{order._id?.slice(-8).toUpperCase()}</span>
                        <span className="order-date">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', day: 'numeric', year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <span 
                        className="order-status"
                        style={{ color: status.color, background: status.bg }}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div