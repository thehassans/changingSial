import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/layout/Header'
import { apiGet } from '../../api'
import ProductCard from '../../components/ecommerce/ProductCard'
import ShoppingCart from '../../components/ecommerce/ShoppingCart'
import { categories } from '../../components/ecommerce/CategoryFilter'
import { detectCountryCode } from '../../utils/geo'
import { countries } from '../../components/ecommerce/CountrySelector'
import BannerSlider from '../../components/ecommerce/BannerSlider'

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

      {/* CJ-Style Functional Banner Section */}
      <section className="bg-[#f2f3f7] pb-8 pt-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[500px]">
            
            {/* Left: Quick Categories (Hidden on mobile/tablet for space, or visible as menu) */}
            <div className="hidden lg:flex lg:col-span-2 bg-white rounded-lg shadow-sm flex-col overflow-hidden border border-gray-100">
              <div className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm uppercase tracking-wide flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                Categories
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {topCategories.map(cat => (
                  <Link 
                    key={cat.id} 
                    to={`/catalog?category=${encodeURIComponent(cat.id)}`}
                    className="flex items-center px-4 py-3 hover:bg-orange-50 transition-colors group border-l-4 border-transparent hover:border-orange-500"
                  >
                    <span className="text-xl mr-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="text-sm text-gray-700 font-medium group-hover:text-orange-600">{cat.name}</span>
                    <svg className="w-4 h-4 ml-auto text-gray-300 group-hover:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                ))}
                <Link to="/categories" className="flex items-center px-4 py-3 text-sm text-orange-600 font-medium hover:bg-orange-50 border-t border-gray-50 mt-autp">
                  See All Categories
                </Link>
              </div>
            </div>

            {/* Center: Main Banner Slider & Search */}
            <div className="lg:col-span-8 flex flex-col gap-4 h-full relative group">
              {/* Search Bar Overlay (CJ Style) */}
              <div className="bg-white p-2 rounded-lg shadow-sm flex items-center border border-orange-200 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
                <div className="pl-3 pr-2 border-r border-gray-200 hidden sm:block">
                  <select className="text-sm bg-transparent border-none focus:ring-0 text-gray-600 font-medium cursor-pointer py-2">
                    <option>All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <input 
                  type="text" 
                  placeholder="Search 10,000+ products, SKUs, or keywords..." 
                  className="flex-1 border-none focus:ring-0 text-sm px-4 py-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                       window.location.href = `/catalog?search=${encodeURIComponent(e.target.value)}`
                    }
                  }}
                />
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center">
                  <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>

              {/* Slider Area */}
              <div className="flex-1 relative rounded-xl overflow-hidden shadow-md bg-gray-900 group">
                <BannerSlider />
                
                {/* Visual Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-8 left-8 right-8 z-20 text-white pointer-events-none hidden sm:block">
                   <div className="flex gap-4">
                     <div className="flex items-center bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                       <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                       Live Stock
                     </div>
                     <div className="flex items-center bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                       <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                       Wholesale Pricing
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Right: User / Auth Panel (CJ Style) */}
            <div className="hidden lg:flex lg:col-span-2 flex-col gap-4 h-full">
               {/* Auth Card */}
               <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-center border border-gray-100 flex-1">
                 <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4 text-3xl">
                   👤
                 </div>
                 <h3 className="font-bold text-gray-900 mb-1">Welcome!</h3>
                 <p className="text-xs text-gray-500 mb-6 px-2">Sign in to access exclusive wholesale prices.</p>
                 <div className="w-full space-y-3">
                   <Link to="/login" className="block w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-bold text-sm transition-colors shadow-lg shadow-orange-500/30">
                     Sign In
                   </Link>
                   <Link to="/register" className="block w-full py-2 bg-white text-orange-500 border border-orange-200 hover:bg-orange-50 rounded-md font-bold text-sm transition-colors">
                     Register
                   </Link>
                 </div>
               </div>

               {/* Quick Stats or Promo */}
               <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-sm p-6 text-white text-center flex-1 flex flex-col justify-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                 <h4 className="font-bold text-lg mb-2 relative z-10">Premium Member?</h4>
                 <p className="text-xs text-gray-400 mb-4 relative z-10">Get up to <span className="text-orange-400 font-bold">20% OFF</span> shipping fees.</p>
                 <Link to="/premium" className="inline-block py-2 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-md text-xs font-bold border border-white/20 transition-colors relative z-10">
                   Upgrade Now
                 </Link>
               </div>
            </div>
          </div>

          {/* Mobile Categories (Scrollable Pill List) */}
          <div className="lg:hidden mt-4 overflow-x-auto scrollbar-hide flex gap-3 pb-2">
             {categories.map(cat => (
               <Link 
                 key={cat.id} 
                 to={`/catalog?category=${encodeURIComponent(cat.id)}`}
                 className="flex-shrink-0 flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-sm font-medium text-gray-700 whitespace-nowrap"
               >
                 <span className="mr-2">{cat.icon}</span>
                 {cat.name}
               </Link>
             ))}
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
              <div className="text-sm text-gray-600 font-medium">{stat.l