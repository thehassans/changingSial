import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/layout/Header'
import { apiGet } from '../../api'
import ProductCard from '../../components/ecommerce/ProductCard'
import ShoppingCart from '../../components/ecommerce/ShoppingCart'
import { categories } from '../../components/ecommerce/CategoryFilter'
import { detectCountryCode } from '../../utils/geo'
import { countries } from '../../components/ecommerce/CountrySelector'

export default function Home(){
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState({})
  const [selectedCountry, setSelectedCountry] = useState(() => {
    try { return localStorage.getItem('selected_country') || 'SA' } catch { return 'SA' }
  })

  useEffect(()=>{
    let alive = true
    ;(async()=>{
      try{
        setLoading(true)
        // Try to fetch newest products; fallback to any
        const qs = new URLSearchParams()
        qs.set('page','1'); qs.set('limit','8'); qs.set('sort','newest')
        const res = await apiGet(`/api/products/public?${qs.toString()}`)
        let list = Array.isArray(res?.products)? res.products: []
        // Filter products by selected country availability
        try{
          const selectedCountryName = countries.find(c => c.code === selectedCountry)?.name
          list = list.filter(p => {
            if (!Array.isArray(p.availableCountries) || p.availableCountries.length === 0) return true
            return selectedCountryName ? p.availableCountries.includes(selectedCountryName) : true
          })
        }catch{}
        if (alive) setFeatured(list.slice(0,8))
      }catch{
        if (alive) setFeatured([])
      }finally{ if (alive) setLoading(false) }
    })()
    return ()=>{ alive = false }
  },[selectedCountry])

  // Persist selected country
  useEffect(()=>{
    try { localStorage.setItem('selected_country', selectedCountry) } catch {}
  },[selectedCountry])

  // On first visit, auto-detect country if none saved
  useEffect(() => {
    (async () => {
      try {
        const saved = localStorage.getItem('selected_country')
        if (!saved) {
          const code = await detectCountryCode()
          setSelectedCountry(code)
          try { localStorage.setItem('selected_country', code) } catch {}
        }
      } catch {}
    })()
  }, [])

  // Load category usage counts for hiding empty categories
  useEffect(() => {
    let alive = true
    ;(async()=>{
      try{
        const res = await apiGet('/api/products/public/categories-usage')
        if (alive) setCategoryCounts(res?.counts || {})
      }catch{
        if (alive) setCategoryCounts({})
      }
    })()
    return ()=>{ alive = false }
  }, [])

  const topCategories = categories
    .filter(c => c.id !== 'all')
    .filter(c => (categoryCounts?.[c.id] || 0) > 0)
    .slice(0, 8)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header onCartClick={() => setIsCartOpen(true)} />

      {/* Ultra-Premium Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-black z-0"></div>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40">
            <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-orange-500 blur-[120px] animate-pulse"></div>
            <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-600 blur-[120px] animate-pulse delay-1000"></div>
            <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-purple-600 blur-[120px] animate-pulse delay-2000"></div>
          </div>
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 z-0"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            {/* Hero Content */}
            <div className="flex-1 text-center lg:text-left space-y-8 animate-fadeInUp">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-orange-400 text-sm font-medium mb-4">
                <span className="flex h-2 w-2 relative mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                The Future of Dropshipping
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight text-white leading-[1.1]">
                Elevate Your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-indigo-500">
                  Lifestyle
                </span>
              </h1>
              
              <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                Discover a curated collection of premium products from top global brands. Fast delivery across the Gulf, verified quality, and unbeatable wholesale prices.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
                <Link 
                  to="/catalog" 
                  className="group relative inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-1 transition-all duration-300"
                >
                  Shop Collection
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link 
                  to="/about" 
                  className="px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:border-white/20"
                >
                  Our Story
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Verified Quality
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  24h Dispatch
                </div>
              </div>
            </div>

            {/* Hero Visual/Card */}
            <div className="flex-1 w-full relative hidden lg:block perspective-1000">
              <div className="relative w-full aspect-square max-w-lg mx-auto transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-700 ease-out">
                {/* Glass Card 1 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-2xl border border-white/20 shadow-2xl p-6 flex flex-col justify-between z-20 animate-float">
                  <div className="flex justify-between items-start">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500"></div>
                    <div className="px-3 py-1 rounded-full bg-white/10 text-xs text-white uppercase tracking-wider">New Arrival</div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 bg-white/20 rounded-full"></div>
                    <div className="h-4 w-1/2 bg-white/10 rounded-full"></div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl opacity-80 blur-lg animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-60 blur-lg animate-pulse delay-700"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { number: '10,000+', label: 'Products', icon: '📦', color: 'from-orange-500 to-orange-600' },
            { number: '50,000+', label: 'Monthly Orders', icon: '🛒', color: 'from-blue-500 to-blue-600' },
            { number: '500+', label: 'Active Brands', icon: '⭐', color: 'from-purple-500 to-purple-600' },
            { number: '10+', label: 'Countries', icon: '🌍', color: 'from-green-500 to-green-600' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-xl p-6 text-center hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                {stat.number}
              </div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse through our diverse range of product categories
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {topCategories.map(cat => (
              <Link 
                key={cat.id} 
                to={`/catalog?category=${encodeURIComponent(cat.id)}`} 
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border border-gray-100 group text-center"
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{cat.icon}</div>
                <span className="font-bold text-lg text-gray-900">{cat.name}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link 
              to="/categories" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              View All Categories
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">New Arrivals</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our latest products fresh from top brands
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-600 mb-6">Check back soon for new arrivals!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map(p => (
                <ProductCard key={p._id} product={p} selectedCountry={selectedCountry} onAddToCart={() => setIsCartOpen(true)} />
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link 
              to="/catalog" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Browse All Products
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Shop With Us?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the best in e-commerce with our premium services
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '✓', title: 'Verified Quality', desc: 'All products quality-checked and verified' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Quick shipping across the Gulf region' },
              { icon: '💰', title: 'Best Prices', desc: 'Competitive wholesale & retail pricing' },
              { icon: '💬', title: '24/7 Support', desc: 'Always here to help with your orders' },
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20 text-4xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shopping Cart Sidebar */}
      <ShoppingCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  )
}
