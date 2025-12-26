import React, { useEffect, useState, useRef, useCallback } from 'react'
import { apiGet } from '../../api'
import { io } from 'socket.io-client'

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script-insights'

// Country coordinates for map centering
const COUNTRY_CENTERS = {
  'All': { lat: 24.5, lng: 54.5, zoom: 5 },
  'KSA': { lat: 24.7136, lng: 46.6753, zoom: 6 },
  'UAE': { lat: 25.2048, lng: 55.2708, zoom: 7 },
  'Oman': { lat: 21.4735, lng: 55.9754, zoom: 6 },
  'Bahrain': { lat: 26.0667, lng: 50.5577, zoom: 10 },
  'India': { lat: 20.5937, lng: 78.9629, zoom: 5 },
  'Kuwait': { lat: 29.3759, lng: 47.9774, zoom: 8 },
  'Qatar': { lat: 25.2854, lng: 51.531, zoom: 9 },
}

// Status colors for order markers
const STATUS_COLORS = {
  pending: '#f59e0b',
  assigned: '#3b82f6',
  picked_up: '#8b5cf6',
  out_for_delivery: '#f97316',
  delivered: '#10b981',
  cancelled: '#ef4444',
  returned: '#64748b',
}

// Icons
const Icons = {
  filter: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  driver: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  order: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  refresh: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  truck: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
  globe: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
}

const LiveTrackingView = () => {
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [apiKey, setApiKey] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [orders, setOrders] = useState([])
  const [selectedCountry, setSelectedCountry] = useState('All')
  const [selectedDriver, setSelectedDriver] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [showDrivers, setShowDrivers] = useState(true)
  const [showOrders, setShowOrders] = useState(true)
  const [stats, setStats] = useState({ drivers: 0, orders: 0, delivered: 0, inTransit: 0 })
  
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const socketRef = useRef(null)

  // Load Google Maps API key
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const res = await apiGet('/api/google-maps/key')
        if (res?.apiKey) {
          setApiKey(res.apiKey)
        }
      } catch (err) {
        console.error('Failed to load Maps API key:', err)
      }
    }
    loadApiKey()
  }, [])

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) return
    if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
      if (window.google?.maps) setMapLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_MAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`
    script.async = true
    script.defer = true
    script.onload = () => setMapLoaded(true)
    script.onerror = () => console.error('Failed to load Google Maps')
    document.head.appendChild(script)
  }, [apiKey])

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return

    const center = COUNTRY_CENTERS[selectedCountry] || COUNTRY_CENTERS['All']
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: center.lat, lng: center.lng },
      zoom: center.zoom,
      styles: getMapStyles(),
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    })
  }, [mapLoaded])

  // Update map center when country changes
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const center = COUNTRY_CENTERS[selectedCountry] || COUNTRY_CENTERS['All']
    mapInstanceRef.current.panTo({ lat: center.lat, lng: center.lng })
    mapInstanceRef.current.setZoom(center.zoom)
  }, [selectedCountry])

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Load drivers
      const driversRes = await apiGet('/api/drivers')
      const driversList = Array.isArray(driversRes) ? driversRes : driversRes?.drivers || []
      setDrivers(driversList)

      // Load orders with filters
      let orderParams = '?limit=500'
      if (selectedCountry !== 'All') orderParams += `&country=${selectedCountry}`
      if (selectedStatus !== 'All') orderParams += `&status=${selectedStatus}`
      
      const ordersRes = await apiGet(`/api/orders${orderParams}`)
      const ordersList = Array.isArray(ordersRes) ? ordersRes : ordersRes?.orders || []
      setOrders(ordersList)

      // Calculate stats
      const filteredDrivers = driversList.filter(d => 
        selectedCountry === 'All' || d.country === selectedCountry
      )
      const delivered = ordersList.filter(o => o.status === 'delivered').length
      const inTransit = ordersList.filter(o => ['assigned', 'picked_up', 'out_for_delivery'].includes(o.status)).length

      setStats({
        drivers: filteredDrivers.length,
        orders: ordersList.length,
        delivered,
        inTransit
      })
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedCountry, selectedStatus])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Update markers on map
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    // Filter drivers
    const filteredDrivers = drivers.filter(d => {
      if (selectedCountry !== 'All' && d.country !== selectedCountry) return false
      if (selectedDriver !== 'All' && d._id !== selectedDriver) return false
      return d.lastLocation?.lat && d.lastLocation?.lng
    })

    // Filter orders
    const filteredOrders = orders.filter(o => {
      if (selectedCountry !== 'All' && o.country !== selectedCountry) return false
      if (selectedStatus !== 'All' && o.status !== selectedStatus) return false
      if (selectedDriver !== 'All' && o.driver !== selectedDriver) return false
      return o.location?.lat && o.location?.lng
    })

    // Add driver markers
    if (showDrivers) {
      filteredDrivers.forEach(driver => {
        if (!driver.lastLocation?.lat || !driver.lastLocation?.lng) return
        
        const marker = new window.google.maps.Marker({
          position: { lat: driver.lastLocation.lat, lng: driver.lastLocation.lng },
          map: mapInstanceRef.current,
          title: driver.name || 'Driver',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 150px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">${driver.name || 'Driver'}</h3>
              <p style="color: #666; font-size: 12px;">${driver.phone || ''}</p>
              <p style="color: #666; font-size: 12px;">Country: ${driver.country || 'N/A'}</p>
              <p style="color: #666; font-size: 12px;">Active Orders: ${driver.activeOrders || 0}</p>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker)
        })

        markersRef.current.push(marker)
      })
    }

    // Add order markers
    if (showOrders) {
      filteredOrders.forEach(order => {
        if (!order.location?.lat || !order.location?.lng) return
        
        const color = STATUS_COLORS[order.status] || '#64748b'
        const marker = new window.google.maps.Marker({
          position: { lat: order.location.lat, lng: order.location.lng },
          map: mapInstanceRef.current,
          title: order.orderId || 'Order',
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: color,
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 180px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">Order #${order.orderId || order._id?.slice(-6)}</h3>
              <p style="color: #666; font-size: 12px;">Customer: ${order.customerName || 'N/A'}</p>
              <p style="font-size: 12px;"><span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color}; margin-right: 4px;"></span>${order.status}</p>
              <p style="color: #666; font-size: 12px;">${order.city || ''}, ${order.country || ''}</p>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker)
        })

        markersRef.current.push(marker)
      })
    }
  }, [drivers, orders, selectedCountry, selectedDriver, selectedStatus, showDrivers, showOrders, mapLoaded])

  // WebSocket for real-time updates
  useEffect(() => {
    try {
      const token = localStorage.getItem('token') || ''
      socketRef.current = io(undefined, {
        path: '/socket.io',
        transports: ['polling'],
        upgrade: false,
        auth: { token },
        withCredentials: true,
      })

      socketRef.current.on('driver.location.updated', () => loadData())
      socketRef.current.on('orders.changed', () => loadData())
    } catch (err) {
      console.error('WebSocket error:', err)
    }

    return () => {
      try { socketRef.current?.disconnect() } catch {}
    }
  }, [loadData])

  // Map styles (light mode)
  const getMapStyles = () => [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e4f5' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ]

  return (
    <div className="h-[calc(100vh-200px)] flex" style={{ backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0' }}>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#f0f9ff' }}>
            <p className="text-2xl font-bold text-blue-600">{stats.drivers}</p>
            <p className="text-xs text-blue-700">Active Drivers</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#f0fdf4' }}>
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-xs text-green-700">Delivered</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#fff7ed' }}>
            <p className="text-2xl font-bold text-orange-600">{stats.inTransit}</p>
            <p className="text-xs text-orange-700">In Transit</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#faf5ff' }}>
            <p className="text-2xl font-bold text-purple-600">{stats.orders}</p>
            <p className="text-xs text-purple-700">Total Orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1e293b' }}>
            {Icons.filter}
            <span>Filters</span>
          </div>

          {/* Country Filter */}
          <div>
            <label className="text-xs font-medium" style={{ color: '#64748b' }}>Country</label>
            <select
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="All">All Countries</option>
              {Object.keys(COUNTRY_CENTERS).filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Driver Filter */}
          <div>
            <label className="text-xs font-medium" style={{ color: '#64748b' }}>Driver</label>
            <select
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
            >
              <option value="All">All Drivers</option>
              {drivers.map(d => (
                <option key={d._id} value={d._id}>{d.name || d.phone || 'Driver'}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs font-medium" style={{ color: '#64748b' }}>Order Status</label>
            <select
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>

        {/* Toggle Layers */}
        <div className="space-y-2">
          <div className="text-xs font-medium" style={{ color: '#64748b' }}>Map Layers</div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showDrivers}
              onChange={(e) => setShowDrivers(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm" style={{ color: '#334155' }}>
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              Show Drivers
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOrders}
              onChange={(e) => setShowOrders(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm" style={{ color: '#334155' }}>
              <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
              Show Orders
            </span>
          </label>
        </div>

        {/* Refresh Button */}
        <button
          onClick={loadData}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ backgroundColor: '#f97316', color: '#ffffff' }}
        >
          {Icons.refresh}
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>

        {/* Status Legend */}
        <div className="space-y-2">
          <div className="text-xs font-medium" style={{ color: '#64748b' }}>Status Legend</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="capitalize" style={{ color: '#475569' }}>{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p style={{ color: '#64748b' }}>Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Map Overlay Stats */}
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="px-3 py-2 rounded-lg shadow-lg flex items-center gap-2" style={{ backgroundColor: '#ffffff' }}>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium" style={{ color: '#334155' }}>{stats.drivers} Drivers</span>
          </div>
          <div className="px-3 py-2 rounded-lg shadow-lg flex items-center gap-2" style={{ backgroundColor: '#ffffff' }}>
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm font-medium" style={{ color: '#334155' }}>{stats.orders} Orders</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveTrackingView
