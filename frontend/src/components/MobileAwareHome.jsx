import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCatalog from '../pages/ecommerce/ProductCatalog.jsx'

export default function MobileAwareHome() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if running in Capacitor (mobile app)
    const isCapacitor = typeof window.Capacitor !== 'undefined'
    
    if (isCapacitor) {
      // Mobile app: redirect to login
      navigate('/login', { replace: true })
    }
    // Web: stay on product catalog (no action needed)
  }, [navigate])

  // Show product catalog for web users
  return <ProductCatalog />
}
