import React, { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Chart from '../../components/Chart.jsx'
import LiveNumber from '../../components/LiveNumber.jsx'
import { API_BASE, apiGet } from '../../api.js'
import { io } from 'socket.io-client'
import { useToast } from '../../ui/Toast.jsx'
import { getCurrencyConfig, toAEDByCode, convert } from '../../util/currency'

// ============================================
// PREMIUM MINIMAL DASHBOARD - SVG ICONS
// ============================================

// Premium SVG Icons
const Icons = {
  orders: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  revenue: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  cost: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  delivered: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pending: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  profit: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  loss: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  sales: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  arrowUp: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
    </svg>
  ),
  arrowDown: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
    </svg>
  ),
}

// Premium Minimal KPI Card - ALWAYS LIGHT THEME
const KpiCard = ({ icon, label, value, trend, loading = false, iconColor = 'text-orange-600', iconBg = 'bg-orange-50' }) => (
  <div 
    className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-lg"
    style={{ 
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
    }}
  >
    <div className="flex items-start justify-between mb-4">
      <div 
        className={`flex items-center justify-center w-10 h-10 rounded-xl ${iconColor}`}
        style={{ backgroundColor: iconBg === 'bg-orange-50' ? '#fff7ed' : iconBg }}
      >
        {icon}
      </div>
      <span className="text-xs font-medium tracking-wide uppercase" style={{ color: '#94a3b8' }}>{label}</span>
    </div>
    
    {loading ? (
      <div className="h-10 w-24 animate-pulse rounded-lg" style={{ backgroundColor: '#f1f5f9' }} />
    ) : (
      <p className="text-3xl font-bold" style={{ color: '#0f172a' }}>{value}</p>
    )}
    
    {trend && (
      <div className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium ${
        trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
      }`}>
        {trend.isPositive ? Icons.arrowUp : Icons.arrowDown}
        <span>{Math.abs(trend.value)}% {trend.isPositive ? 'increase' : 'decrease'}</span>
      </div>
    )}
  </div>
)

// Premium Minimal Card - ALWAYS LIGHT THEME
const Card = ({ children, className = '', title, icon }) => (
  <div 
    className={`rounded-2xl p-5 transition-all duration-300 hover:shadow-lg ${className}`}
    style={{ 
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
    }}
  >
    {title && (
      <div className="mb-5 flex items-center gap-3">
        {icon && (
          <div 
            className="flex items-center justify-center w-9 h-9 rounded-lg text-orange-600"
            style={{ backgroundColor: '#fff7ed' }}
          >
            {icon}
          </div>
        )}
        <h3 className="text-base font-semibold" style={{ color: '#1e293b' }}>{title}</h3>
      </div>
    )}
    {children}
  </div>
)

// Premium Big Value Card - ALWAYS LIGHT THEME
const BigValueCard = ({ icon, title, value, subtitle, loading }) => (
  <Card title={title} icon={icon}>
    {loading ? (
      <div className="h-12 w-32 animate-pulse rounded-lg" style={{ backgroundColor: '#f1f5f9' }} />
    ) : (
      <div className="space-y-1">
        <p className="text-4xl font-bold" style={{ color: '#0f172a' }}>{value}</p>
        {subtitle && (
          <p className="text-sm" style={{ color: '#64748b' }}>{subtitle}</p>
        )}
      </div>
    )}
  </Card>
)

// Minimal Pie Chart - ALWAYS LIGHT THEME
const PieChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="h-40 w-40 animate-pulse rounded-full" style={{ backgroundColor: '#f1f5f9' }} />
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercent = 0

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <svg viewBox="0 0 100 100" className="w-40 h-40 rotate-[-90deg]">
          {data.map((item, i) => {
            const percent = total > 0 ? (item.value / total) * 100 : 0
            const offset = cumulativePercent
            cumulativePercent += percent
            if (percent === 0) return null
            const circumference = 2 * Math.PI * 38
            const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`
            const strokeDashoffset = -(offset / 100) * circumference
            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke={item.color}
                strokeWidth="18"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            )
          })}
          <circle cx="50" cy="50" r="29" fill="#ffffff" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: '#0f172a' }}>{total}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>Total</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm" style={{ color: '#475569' }}>{item.label}</span>
            <span className="ml-auto text-sm font-semibold" style={{ color: '#0f172a' }}>
              {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Status Badge - ALWAYS LIGHT THEME
const StatBadge = ({ label, value, color, to }) => {
  const content = (
    <div 
      className="flex items-center gap-2 rounded-lg p-2 transition-colors"
      style={{ ':hover': { backgroundColor: '#f8fafc' } }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm" style={{ color: '#475569' }}>{label}</span>
      <span className="ml-auto text-sm font-semibold" style={{ color: '#0f172a' }}>{value}</span>
    </div>
  )
  return to ? <NavLink to={to}>{content}</NavLink> : content
}

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [currencyCfg, setCurrencyCfg] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const toast = useToast()
  const loadSeqRef = useRef(0)
  const loadAbortRef = useRef(null)
  const monthDebounceRef = useRef(null)
  const reloadTimerRef = useRef(null)

  // Cache utilities
  const cacheKey = (type, params) => `dashboard_${type}_${params}`
  const cacheGet = (type, params) => {
    try {
      const cached = sessionStorage.getItem(cacheKey(type, params))
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  }
  const cacheSet = (type, params, data) => {
    try {
      sessionStorage.setItem(cacheKey(type, params), JSON.stringify(data))
    } catch (e) {
      console.warn('Cache storage failed:', e)
    }
  }

  // Constants
  const COUNTRY_LIST = ['KSA', 'UAE', 'Oman', 'Bahrain', 'India', 'Kuwait', 'Qatar']
  const COUNTRY_INFO = {
    KSA: { flag: '🇸🇦', cur: 'SAR' },
    UAE: { flag: '🇦🇪', cur: 'AED' },
    Oman: { flag: '🇴🇲', cur: 'OMR' },
    Bahrain: { flag: '🇧🇭', cur: 'BHD' },
    India: { flag: '🇮🇳', cur: 'INR' },
    Kuwait: { flag: '🇰🇼', cur: 'KWD' },
    Qatar: { flag: '🇶🇦', cur: 'QAR' },
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const fmtNum = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })
  const fmtAmt = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })

  const countryMetrics = (c) => {
    if (!metrics?.countries || !metrics.countries[c]) return {}
    return metrics.countries[c]
  }

  const toAED = (amount, countryCode) => {
    try {
      return toAEDByCode(Number(amount || 0), String(countryCode || 'AED'), currencyCfg)
    } catch {
      return 0
    }
  }

  const sumCurrencyMapAED = (map) => {
    try {
      return Object.entries(map || {}).reduce(
        (s, [code, val]) => s + toAEDByCode(Number(val || 0), String(code || 'AED'), currencyCfg),
        0
      )
    } catch {
      return 0
    }
  }

  const sumAmountAED = (key) => {
    try {
      return COUNTRY_LIST.reduce((s, c) => s + toAED(countryMetrics(c)[key] || 0, c), 0)
    } catch {
      return 0
    }
  }

  const statusTotals = useMemo(() => {
    if (metrics?.statusTotals) return metrics.statusTotals
    return COUNTRY_LIST.reduce(
      (acc, c) => {
        const m = countryMetrics(c)
        acc.total += Number(m.orders || 0)
        acc.pending += Number(m.pending || 0)
        acc.assigned += Number(m.assigned || 0)
        acc.picked_up += Number(m.pickedUp || 0)
        acc.in_transit += Number(m.transit || 0)
        acc.out_for_delivery += Number(m.outForDelivery || 0)
        acc.delivered += Number(m.delivered || 0)
        acc.no_response += Number(m.noResponse || 0)
        acc.returned += Number(m.returned || 0)
        acc.cancelled += Number(m.cancelled || 0)
        return acc
      },
      {
        total: 0, pending: 0, assigned: 0, picked_up: 0, in_transit: 0,
        out_for_delivery: 0, delivered: 0, no_response: 0, returned: 0, cancelled: 0,
      }
    )
  }, [metrics, COUNTRY_LIST])

  const pieData = useMemo(
    () => [
      { label: 'Delivered', value: statusTotals.delivered || 0, color: '#10b981' },
      { label: 'Assigned', value: statusTotals.assigned || 0, color: '#3b82f6' },
      { label: 'Cancelled', value: statusTotals.cancelled || 0, color: '#ef4444' },
      { label: 'Returned', value: statusTotals.returned || 0, color: '#64748b' },
    ],
    [statusTotals]
  )

  const getMonthDateRange = () => {
    const UAE_OFFSET_HOURS = 4
    const startDate = new Date(Date.UTC(selectedYear, selectedMonth - 1, 1, -UAE_OFFSET_HOURS, 0, 0, 0))
    const endDate = new Date(Date.UTC(selectedYear, selectedMonth, 0, 23 - UAE_OFFSET_HOURS, 59, 59, 999))
    return { from: startDate.toISOString(), to: endDate.toISOString() }
  }

  async function load() {
    const dateRange = getMonthDateRange()
    const dateParams = `from=${encodeURIComponent(dateRange.from)}&to=${encodeURIComponent(dateRange.to)}`

    const seq = (loadSeqRef.current = loadSeqRef.current + 1)
    try { loadAbortRef.current?.abort() } catch {}
    const controller = new AbortController()
    loadAbortRef.current = controller

    const cachedMetrics = cacheGet('metrics', dateParams)
    if (cachedMetrics) {
      setMetrics(cachedMetrics)
      setLoading(false)
      setHydrated(true)
    } else {
      setLoading(true)
    }

    const cachedAnalytics = cacheGet('analytics', dateParams)
    if (cachedAnalytics) setAnalytics(cachedAnalytics)

    const cfgP = (currencyCfg ? Promise.resolve(currencyCfg) : getCurrencyConfig()).catch(() => null)
    const metricsP = apiGet(`/api/reports/user-metrics?${dateParams}`, { signal: controller.signal }).catch(() => null)

    try {
      const [cfg, metricsRes] = await Promise.all([cfgP, metricsP])
      if (loadSeqRef.current !== seq) return
      setCurrencyCfg(cfg)
      if (metricsRes) {
        setMetrics(metricsRes)
        cacheSet('metrics', dateParams, metricsRes)
      }
      setHydrated(true)
      setLoading(false)

      apiGet(`/api/orders/analytics/last7days?${dateParams}`, { signal: controller.signal })
        .then((res) => {
          if (loadSeqRef.current !== seq) return
          if (res) {
            setAnalytics(res)
            cacheSet('analytics', dateParams, res)
          }
        })
        .catch(() => {})
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (monthDebounceRef.current) clearTimeout(monthDebounceRef.current)
    monthDebounceRef.current = setTimeout(load, 250)
    return () => clearTimeout(monthDebounceRef.current)
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    let socket
    try {
      const token = localStorage.getItem('token') || ''
      socket = io(API_BASE || undefined, {
        path: '/socket.io',
        transports: ['polling'],
        upgrade: false,
        auth: { token },
        withCredentials: true,
      })
      const scheduleLoad = () => {
        if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current)
        reloadTimerRef.current = setTimeout(load, 450)
      }
      socket.on('orders.changed', scheduleLoad)
      socket.on('reports.userMetrics.updated', scheduleLoad)
      socket.on('orders.analytics.updated', scheduleLoad)
      socket.on('finance.drivers.updated', scheduleLoad)
    } catch {}
    return () => {
      try { socket?.disconnect() } catch {}
    }
  }, [toast])

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: '#f8fafc' }}>
      <div className="px-6 py-6">
        <div className="mx-auto max-w-[1600px] space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Dashboard</h1>
              <p className="mt-1 text-sm" style={{ color: '#64748b' }}>
                Welcome back! Here's your business overview for {monthNames[selectedMonth - 1]} {selectedYear}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                style={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  color: '#334155'
                }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx + 1}>{name}</option>
                ))}
              </select>
              <select
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                style={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  color: '#334155'
                }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <KpiCard
              icon={Icons.orders}
              label="Total Orders"
              value={<LiveNumber value={statusTotals.total || 0} maximumFractionDigits={0} />}
              loading={loading}
            />
            <KpiCard
              icon={Icons.revenue}
              label="Revenue"
              iconColor="text-emerald-600"
              iconBg="#ecfdf5"
              value={
                <span className="flex items-baseline gap-1">
                  <span className="text-lg" style={{ color: '#94a3b8' }}>AED</span>
                  <LiveNumber value={metrics?.profitLoss?.revenue || 0} maximumFractionDigits={0} />
                </span>
              }
              loading={loading}
            />
            <KpiCard
              icon={Icons.cost}
              label="Cost"
              iconColor="text-rose-600"
              iconBg="#fef2f2"
              value={
                <span className="flex items-baseline gap-1">
                  <span className="text-lg" style={{ color: '#94a3b8' }}>AED</span>
                  <LiveNumber value={metrics?.profitLoss?.purchaseCost || 0} maximumFractionDigits={0} />
                </span>
              }
              loading={loading}
            />
            <KpiCard
              icon={Icons.delivered}
              label="Delivered"
              iconColor="text-green-600"
              iconBg="#f0fdf4"
              value={<LiveNumber value={statusTotals.delivered || 0} maximumFractionDigits={0} />}
              trend={
                statusTotals.total > 0
                  ? { value: Math.round((statusTotals.delivered / statusTotals.total) * 100), isPositive: true }
                  : null
              }
              loading={loading}
            />
            <KpiCard
              icon={Icons.pending}
              label="Pending"
              iconColor="text-amber-600"
              iconBg="#fffbeb"
              value={<LiveNumber value={statusTotals.pending || 0} maximumFractionDigits={0} />}
              loading={loading}
            />
            <KpiCard
              icon={metrics?.profitLoss?.isProfit ? Icons.profit : Icons.loss}
              label={metrics?.profitLoss?.isProfit ? 'Net Profit' : 'Net Loss'}
              iconColor={metrics?.profitLoss?.isProfit ? 'text-emerald-600' : 'text-rose-600'}
              iconBg={metrics?.profitLoss?.isProfit ? '#ecfdf5' : '#fef2f2'}
              value={
                <span className="flex items-baseline gap-1">
                  <span className="text-lg" style={{ color: '#94a3b8' }}>AED</span>
                  <LiveNumber value={Math.abs(metrics?.profitLoss?.profit || 0)} maximumFractionDigits={0} />
                </span>
              }
              loading={loading}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Sales Trend Chart */}
            <Card title="Sales Trend" icon={Icons.chart} className="lg:col-span-2">
              <div className="h-[350px]">
                {!hydrated || loading ? (
                  <div className="h-full w-full animate-pulse rounded-lg" style={{ backgroundColor: '#f1f5f9' }} />
                ) : (
                  <Chart analytics={analytics} />
                )}
              </div>
            </Card>

            {/* Sales Summary */}
            <BigValueCard
              icon={Icons.sales}
              title="Sales"
              value={
                <span className="flex items-baseline gap-2">
                  <LiveNumber value={sumAmountAED('amountDelivered')} maximumFractionDigits={0} />
                  <span className="text-lg font-normal" style={{ color: '#94a3b8' }}>AED</span>
                </span>
              }
              subtitle="Total delivered amount"
              loading={loading}
            />
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Order Status Pie */}
            <Card title="Order Status" icon={Icons.clipboard}>
              <PieChart data={pieData} loading={loading} />
            </Card>

            {/* Quick Stats */}
            <Card title="Order Breakdown" icon={Icons.chart}>
              <div className="space-y-1">
                <StatBadge label="Open" value={fmtNum(statusTotals.pending)} color="#f59e0b" to="/user/orders?ship=open" />
                <StatBadge label="Assigned" value={fmtNum(statusTotals.assigned)} color="#3b82f6" to="/user/orders?ship=assigned" />
                <StatBadge label="Picked Up" value={fmtNum(statusTotals.picked_up)} color="#8b5cf6" to="/user/orders?ship=picked_up" />
                <StatBadge label="Out for Delivery" value={fmtNum(statusTotals.out_for_delivery)} color="#f97316" to="/user/orders?ship=out_for_delivery" />
                <StatBadge label="Delivered" value={fmtNum(statusTotals.delivered)} color="#10b981" to="/user/orders?ship=delivered" />
                <StatBadge label="Cancelled" value={fmtNum(statusTotals.cancelled)} color="#ef4444" to="/user/orders?ship=cancelled" />
                <StatBadge label="Returned" value={fmtNum(statusTotals.returned)} color="#64748b" to="/user/orders?ship=returned" />
              </div>
            </Card>

            {/* Country Breakdown */}
            <Card title="Countries" icon={Icons.globe}>
              <div className="space-y-1">
                {COUNTRY_LIST.slice(0, 5).map((c) => {
                  const m = countryMetrics(c)
                  const flag = COUNTRY_INFO[c]?.flag
                  return (
                    <NavLink
                      key={c}
                      to={`/user/orders?country=${encodeURIComponent(c)}`}
                      className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{flag}</span>
                        <span className="text-sm font-medium" style={{ color: '#334155' }}>{c}</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                        {fmtNum(m?.orders || 0)}
                      </span>
                    </NavLink>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
