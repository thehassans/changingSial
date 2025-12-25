import React, { useEffect, useState, useRef, useCallback } from 'react'
import { apiGet } from '../../api'

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script'

export default function LiveMap({ orders = [], driverLocation, onSelectOrder }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const directionsRendererRef = useRef(null)
  const driverMarkerRef = useRef(null)
  
  const [apiKey, setApiKey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null) // distance, duration
  const [mapLoaded, setMapLoaded] = useState(false)

  // Load Google Maps API key from backend
  useEffect(() => {
    async function loadApiKey() {
      try {
        const res = await apiGet('/api/settings/maps-key')
        if (res?.apiKey) {
          setApiKey(res.apiKey)
        } else {
          setError('Google Maps API key not configured. Please add it in User Panel → API Setup.')
        }
      } catch (err) {
        setError('Failed to load Maps API key: ' + (err.message || 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    loadApiKey()
  }, [])

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) return
    
    // Check if script already exists
    if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
      if (window.google && window.google.maps) {
        setMapLoaded(true)
      }
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_MAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`
    script.async = true
    script.defer = true
    script.onload = () => setMapLoaded(true)
    script.onerror = () => setError('Failed to load Google Maps. Check your API key.')
    document.head.appendChild(script)
    
    return () => {
      // Don't remove script on unmount - it can be reused
    }
  }, [apiKey])

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) return
    
    const defaultCenter = driverLocation || { lat: 25.2048, lng: 55.2708 } // Dubai default
    
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      styles: getMapStyles(),
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false,
      zoomControl: true,
    })
    
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      map: mapInstanceRef.current,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#10b981',
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    })
    
  }, [mapLoaded, driverLocation])

  // Add driver marker
  useEffect(() => {
    if (!mapInstanceRef.current || !driverLocation || !window.google) return
    
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setPosition(driverLocation)
    } else {
      driverMarkerRef.current = new window.google.maps.Marker({
        position: driverLocation,
        map: mapInstanceRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        title: 'Your Location',
        zIndex: 1000
      })
    }
    
    // Center map on driver
    mapInstanceRef.current.panTo(driverLocation)
  }, [driverLocation, mapLoaded])

  // Add order markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return
    
    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
    
    const bounds = new window.google.maps.LatLngBounds()
    if (driverLocation) {
      bounds.extend(driverLocation)
    }
    
    orders.forEach((order, index) => {
      if (!order.locationLat || !order.locationLng) return
      
      const position = { lat: order.locationLat, lng: order.locationLng }
      bounds.extend(position)
      
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
          fillColor: selectedOrder?._id === order._id ? '#10b981' : '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1.8,
          anchor: new window.google.maps.Point(12, 22),
        },
        title: order.customerName || `Order #${index + 1}`,
        label: {
          text: String(index + 1),
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      })
      
      marker.addListener('click', () => {
        setSelectedOrder(order)
        onSelectOrder?.(order)
        showRoute(order)
      })
      
      markersRef.current.push(marker)
    })
    
    // Fit bounds if we have markers
    if (orders.length > 0 || driverLocation) {
      try {
        mapInstanceRef.current.fitBounds(bounds, { padding: 50 })
      } catch {}
    }
  }, [orders, driverLocation, mapLoaded, selectedOrder])

  // Show route to selected order
  const showRoute = useCallback(async (order) => {
    if (!mapInstanceRef.current || !driverLocation || !order.locationLat || !order.locationLng || !window.google) {
      return
    }
    
    const directionsService = new window.google.maps.DirectionsService()
    
    try {
      const result = await directionsService.route({
        origin: driverLocation,
        destination: { lat: order.locationLat, lng: order.locationLng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      })
      
      directionsRendererRef.current.setDirections(result)
      
      // Extract route info
      const leg = result.routes[0]?.legs[0]
      if (leg) {
        setRouteInfo({
          distance: leg.distance?.text || 'Unknown',
          duration: leg.duration?.text || 'Unknown',
          distanceValue: leg.distance?.value || 0,
          durationValue: leg.duration?.value || 0
        })
      }
    } catch (err) {
      console.error('Failed to get directions:', err)
      setRouteInfo(null)
    }
  }, [driverLocation])

  // Clear route
  const clearRoute = useCallback(() => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] })
    }
    setSelectedOrder(null)
    setRouteInfo(null)
  }, [])

  // Map styles (dark mode friendly)
  function getMapStyles() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    if (!isDark) return []
    
    return [
      { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
      { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c4a6e' }] },
      { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1e3a3a' }] },
    ]
  }

  if (loading) {
    return (
      <div style={{
        height: 400,
        display: 'grid',
        placeItems: 'center',
        background: 'var(--panel)',
        borderRadius: 16,
        border: '1px solid var(--border)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <div style={{ color: 'var(--muted)' }}>Loading map...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        padding: 24,
        background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 16,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🗺️</div>
        <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>Map Not Available</div>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>{error}</div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--panel)',
      borderRadius: 16,
      border: '1px solid var(--border)',
      overflow: 'hidden'
    }}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: 400,
          background: '#1e293b'
        }} 
      />
      
      {/* Route Info Panel */}
      {routeInfo && selectedOrder && (
        <div style={{
          padding: 16,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))',
          borderTop: '1px solid rgba(16,185,129,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          {/* Top row - Distance, ETA, Customer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>Distance</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{routeInfo.distance}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>ETA</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>{routeInfo.duration}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>Customer</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedOrder.customerName || 'Unknown'}</div>
            </div>
            <button
              onClick={clearRoute}
              style={{
                marginLeft: 'auto',
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                color: 'var(--text)',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              ✕ Clear
            </button>
          </div>
          
          {/* Bottom row - Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* WhatsApp */}
            <button
              onClick={() => {
                const phone = selectedOrder.customerPhone
                if (phone) {
                  const cleanPhone = phone.replace(/[^\d+]/g, '')
                  window.open(`https://wa.me/${cleanPhone}`, '_blank')
                }
              }}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13
              }}
            >
              💬 WhatsApp
            </button>
            
            {/* Call */}
            <button
              onClick={() => {
                if (selectedOrder.customerPhone) {
                  window.location.href = `tel:${selectedOrder.customerPhone}`
                }
              }}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13
              }}
            >
              📞 Call
            </button>
            
            {/* SMS */}
            <button
              onClick={() => {
                if (selectedOrder.customerPhone) {
                  window.location.href = `sms:${selectedO