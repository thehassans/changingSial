import React, { useEffect, useState, useCallback } from 'react'
import { apiGet } from '../../api'
import LiveMap from '../../components/driver/LiveMap'

export default function DriverLiveMapPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [driverLocation, setDriverLocation] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Get driver's current location
  const refreshLocation = useCallback(() => {
    if (!('geolocation' in navigator)) return
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({ 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          })
        },
        (error) => {
          console.log('Location access denied:', error)
        },
        { enableHighAccuracy: true }
      )
    } catch {}
  }, [])

  // Load orders
  const loadOrders = useCallback(async () => {
    try {
      const data = await apiGet('/api/orders/driver/assigned')
      const ordersWithLocation = (data.orders || []).filter(
        o => o.locationLat && o.locationLng
      )
      setOrders(ordersWithLocation)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    refreshLocation()
    loadOrders()
  }, [refreshLocation, loadOrders])

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      loadOrders()
      refreshLocation()
    }, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, loadOrders, refreshLocation])

  // Watch location continuously
  useEffect(() => {
    if (!('geolocation' in navigator)) return
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setDriverLocation({ 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        })
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    )
    
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  if (loading) {
    return (
      <div style={{ 
        display: 'grid', 
        placeItems: 'center', 
        height: 'calc(100vh - 150px)',
        gap: 16
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'grid',
          placeItems: 'center',
          animation: 'pulse 1.5s infinite'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <div style={{ color: 'var(--muted)', fontWeight: 500 }}>Loading live map...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h1 style={{ 
            fontSize: 28, 
            fontWeight: 800, 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            🗺️ Live Map
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 14 }}>
            Real-time view of all your delivery locations
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: autoRefresh ? 'rgba(16,185,129,0.1)' : 'var(--panel)',
              color: autoRefresh ? '#10b981' : 'var(--text)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            {autoRefresh ? '✓' : '○'} Auto Refresh
          </button>
          
          {/* Manual Refresh */}
          <button
            onClick={() => { loadOrders(); refreshLocation(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
            }}
          >
            🔄 Refresh Now
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <div style={{
          padding: '12px 20px',
          background: 'var(--panel)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <div style={{ 
            width: 10, 
            height: 10, 
            borderRadius: '50%', 
            background: '#10b981',
            boxShadow: '0 0 8px rgba(16,185,129,0.5)'
          }} />
          <span style={{ fontWeight: 600 }}>{orders.length}</span>
          <span style={{ color: 'var(--muted)' }}>Active Orders</span>
        </div>
        
        {driverLocation && (
          <div style={{
            padding: '12px 20px',
            background: 'var(--panel)',
            borderRadius: 12,
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <div style={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              background: '#3b82f6',
              boxShadow: '0 0 8px rgba(59,130,246,0.5)'
            }} />
            <span style={{ color: 'var(--muted)' }}>Location Active</span>
          </div>
        )}
        
        {lastUpdated && (
          <div style={{
            padding: '12px 20px',
            background: 'var(--panel)',
            borderRadius: 12,
            border: '1px solid var(--border)',
            color: 'var(--muted)',
            fontSize: 13
          }}>
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Full Size Map */}
      <div style={{ 
        flex: 1,
        minHeight: 'calc(100vh - 300px)',
        borderRadius: 16,
        overflow: 'hidden'
      }}>
        <LiveMap 
          orders={orders}
          driverLocation={driverLocation}
          onSelectOrder={(order) => setSelectedOrder(order)}
        />
      </div>

      {/* Selected Order Quick View */}
      {selectedOrder && (
        <div style={{
          padding: 20,
          background: 'var(--panel)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {selectedOrder.invoiceNumber 
                ? `#${selectedOrder.invoiceNumber}` 
                : `Order #${(selectedOrder._id || '').slice(-5)}`}
            </div>
            <div style={{ color: 'var(--muted)', marginTop: 4 }}>
              {selectedOrder.customerName || 'Customer'} • {selectedOrder.customerAddress || selectedOrder.city || 'No address'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                const lat = selectedOrder.locationLat
                const lng = selectedOrder.locationLng
                if (lat && lng) {
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
                }
              }}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🧭 Navigate
            </button>
            <button
              onClick={() => {
                if (selectedOrder.customerPhone) {
                  window.location.href = `tel:${selectedOrder.customerPhone}`
                }
              }}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                color: 'var(--text)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📞 Call
            </button>
          </div>
        </div>
      )}

      {/* No Orders State */}
      {orders.length === 0 && (
        <div style={{
          padding: 40,
          textAlign: 'center',
          color: 'var(--muted)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No orders with locations</div>
          <div style={{ fontSize: 14 }}>Your assigned orders will appear on the map when they have location data</div>
        </div>
      )}
    </div>
  )
}
