import React, { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Chart from '../../components/Chart.jsx'
import LiveNumber from '../../components/LiveNumber.jsx'
import { API_BASE, apiGet } from '../../api.js'
import { io } from 'socket.io-client'
import { useToast } from '../../ui/Toast.jsx'
import { getCurrencyConfig, toAEDByCode, convert } from '../../util/currency'

// ============================================
// ULTRA-PREMIUM DASHBOARD STYLES
// ============================================

const PREMIUM_STYLES = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.15); }
    50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.25); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  
  .premium-fade-in { animation: fadeInUp 0.6s ease-out forwards; }
  .premium-fade-in-1 { animation-delay: 0.1s; opacity: 0; }
  .premium-fade-in-2 { animation-delay: 0.2s; opacity: 0; }
  .premium-fade-in-3 { animation-delay: 0.3s; opacity: 0; }
  .premium-fade-in-4 { animation-delay: 0.4s; opacity: 0; }
  .premium-fade-in-5 { animation-delay: 0.5s; opacity: 0; }
  .premium-fade-in-6 { animation-delay: 0.6s; opacity: 0; }
  
  .premium-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 2000px 100%;
    animation: shimmer 3s infinite linear;
  }
  
  .premium-glow { animation: pulse-glow 3s ease-in-out infinite; }
  .premium-float { animation: float 6s ease-in-out infinite; }
  
  .premium-glass {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  
  .premium-card-hover {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .premium-card-hover:hover {
    transform: translateY(-4px) scale(1.01);
  }
`

// --- Ultra-Premium KPI Card ---
const KpiCard = ({ icon, label, value, trend, loading = false, delay = 0 }) => (
  <div 
    className={`premium-fade-in premium-fade-in-${delay} premium-card-hover relative overflow-hidden rounded-3xl p-6 transition-all duration-500
      bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
      dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900
      shadow-2xl shadow-slate-900/20 dark:shadow-black/40
      border border-slate-700/50 dark:border-neutral-700/50
      hover:shadow-3xl hover:border-orange-500/30`}
  >
    {/* Animated gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 premium-shimmer"></div>
    
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
          <span className="text-2xl">{icon}</span>
        </div>
        <span className="text-sm font-semibold tracking-wider uppercase text-slate-400 dark:text-neutral-400">{label}</span>
      </div>
      
      {loading ? (
        <div className="h-12 w-28 animate-pulse rounded-xl bg-slate-700/50 dark:bg-neutral-700/50" />
      ) : (
        <p className="text-4xl font-black tracking-tight text-white">{value}</p>
      )}
      
      {trend && (
        <div
          className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
            trend.isPositive 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}
        >
          <span className="text-lg">{trend.isPositive ? '↗' : '↘'}</span>
          {Math.abs(trend.value)}% {trend.isPositive ? 'increase' : 'decrease'}
        </div>
      )}
    </div>
  </div>
)

// --- Ultra-Premium Card ---
const Card = ({ children, className = '', title, icon, delay = 1 }) => (
  <div
    className={`premium-fade-in premium-fade-in-${delay} premium-card-hover rounded-3xl p-6 transition-all duration-500
      bg-white dark:bg-neutral-900
      border border-slate-100 dark:border-neutral-800
      shadow-xl shadow-slate-200/50 dark:shadow-black/20
      hover:shadow-2xl hover:border-orange-200 dark:hover:border-orange-500/20
      ${className}`}
  >
    {title && (
      <div className="mb-6 flex items-center gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-500/20 dark:to-orange-500/10">
            <span className="text-xl">{icon}</span>
          </div>
        )}
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
      </div>
    )}
    {children}
  </div>
)

// --- Ultra-Premium Big Value Card ---
const BigValueCard = ({ icon, title, value, subtitle, loading, delay = 1 }) => (
  <Card title={title} icon={icon} delay={delay}>
    {loading ? (
      <div className="h-14 w-40 animate-pulse rounded-xl bg-slate-100 dark:bg-neutral-800" />
    ) : (
      <div className="space-y-2">
        <p className="text-5xl font-black bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">{value}</p>
        {subtitle && (
          <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">{subtitle}</p>
        )}
      </div>
    )}
  </Card>
)

// --- Ultra-Premium Pie Chart ---
const PieChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-800 dark:to-neutral-700" />
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercent = 0

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      <div className="relative shrink-0 premium-float">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/20 to-transparent blur-2xl"></div>
        <svg viewBox="0 0 100 100" className="w-48 h-48 rotate-[-90deg] drop-shadow-xl">
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
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700 ease-out"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
              />
            )
          })}
          <circle cx="50" cy="50" r="28" fill="white" className="dark:fill-neutral-900" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-black text-slate-800 dark:text-white">{total}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">Total</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3 group cursor-pointer">
            <div 
              className="h-4 w-4 rounded-full shadow-lg transition-transform group-hover:scale-125" 
              style={{ backgroundColor: item.color, boxShadow: `0 4px 12px ${item.color}40` }} 
            />
            <span className="text-sm font-medium text-slate-600 dark:text-neutral-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.label}</span>
            <span className="ml-auto text-sm font-bold text-slate-800 dark:text-white tabular-nums">
              {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Ultra-Premium Status Badge ---
const StatBadge = ({ label, value, color, to }) => {
  const content = (
    <div className="group flex items-center gap-3 rounded-2xl p-3 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-neutral-800/50 cursor-pointer">
      <div 
        className="h-3 w-3 rounded-full shadow-lg transition-all duration-300 group-hover:scale-150" 
        style={{ backgroundColor: color, boxShadow: `0 4px 12px ${color}40` }} 
      />
      <span className="text-sm font-medium text-slate-600 dark:text-neutral-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{label}</span>
      <span className="ml-auto text-base font-bold text-slate-800 dark:text-white tabular-nums">{value}</span>
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
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
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
        total: 0,
        pending: 0,
        assigned: 0,
        picked_up: 0,
        in_transit: 0,
        out_for_delivery: 0,
        delivered: 0,
        no_response: 0,
        returned: 0,
        cancelled: 0,
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
    const startDate = new Date(
      Date.UTC(selectedYear, selectedMonth - 1, 1, -UAE_OFFSET_HOURS, 0, 0, 0)
    )
    const endDate = new Date(
      Date.UTC(selectedYear, selectedMonth, 0, 23 - UAE_OFFSET_HOURS, 59, 59, 999)
    )
    return { from: startDate.toISOString(), to: endDate.toISOString() }
  }

  async function load() {
    const dateRange = getMonthDateRange()
    const dateParams = `from=${encodeURIComponent(dateRange.from)}&to=${encodeURIComponent(dateRange.to)}`

    const seq = (loadSeqRef.current = loadSeqRef.current + 1)
    try {
      loadAbortRef.current?.abort()
    } catch {}
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

    const cfgP = (currencyCfg ? Promise.resolve(currencyCfg) : getCurrencyConfig()).catch(
      () => null
    )
    const metricsP = apiGet(`/api/reports/user-metrics?${dateParams}`, {
      signal: controller.signal,
    }).catch(() => null)

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
      try {
        socket?.disconnect()
      } catch {}
    }
  }, [toast])

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <>
      <style>{PREMIUM_STYLES}</style>
      <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500">
        {/* Subtle gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-orange-50/30 via-white to-slate-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 pointer-events-none"></div>
        
        <div className="relative px-6 py-8">
          <div className="mx-auto max-w-[1700px] space-y-8">
            {/* Ultra-Premium Header */}
            <div className="premium-fade-in premium-fade-in-1 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-neutral-400">
                  Welcome back! Here's your business overview for {monthNames[selectedMonth - 1]} {selectedYear}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  className="rounded-2xl border-2 border-slate-100 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:border-orange-200 hover:shadow-xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:shadow-black/20 dark:hover:border-orange-500/50"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {monthNames.map((name, idx) => (
                    <option key={idx} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-2xl border-2 border-slate-100 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:border-orange-200 hover:shadow-xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:shadow-black/20 dark:hover:border-orange-500/50"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* KPI Cards Row - With staggered animations */}
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
              <KpiCard
                icon="📦"
                label="Total Orders"
                value={<LiveNumber value={statusTotals.total || 0} maximumFractionDigits={0} />}
                loading={loading}
                delay={1}
              />
              <KpiCard
                icon="💰"
                label="Revenue"
                value={
                  <span className="flex items-baseline gap-2">
                    <span className="text-lg font-medium opacity-60">AED</span>
                    <LiveNumber value={metrics?.profitLoss?.revenue || 0} maximumFractionDigits={0} />
                  </span>
                }
                loading={loading}
                delay={2}
              />
              <KpiCard
                icon="📦"
                label="Cost"
                value={
                  <span className="flex items-baseline gap-2">
                    <span className="text-lg font-medium opacity-60">AED</span>
                    <LiveNumber
                      value={metrics?.profitLoss?.purchaseCost || 0}
                      maximumFractionDigits={0}
                    />
                  </span>
                }
                loading={loading}
                delay={3}
              />
              <KpiCard
                icon="✅"
                label="Delivered"
                value={<LiveNumber value={statusTotals.delivered || 0} maximumFractionDigits={0} />}
                trend={
                  statusTotals.total > 0
                    ? {
                        value: Math.round((statusTotals.delivered / statusTotals.total) * 100),

                    isPositive: true,
                  }
                : null
            }
                loading={loading}
                delay={4}
              />
              <KpiCard
                icon="⏳"
                label="Pending"
                value={<LiveNumber value={statusTotals.pending || 0} maximumFractionDigits={0} />}
                loading={loading}
                delay={5}
              />
              <KpiCard
                icon={metrics?.profitLoss?.isProfit ? '📈' : '📉'}
                label={metrics?.profitLoss?.isProfit ? 'Net Profit' : 'Net Loss'}
                value={
                  <span className="flex items-baseline gap-2">
                    <span className="text-lg font-medium opacity-60">AED</span>
                    <LiveNumber
                      value={Math.abs(metrics?.profitLoss?.profit || 0)}
                      maximumFractionDigits={0}
                    />
                  </span>
                }
                loading={loading}
                delay={6}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Sales Trend Chart (2 cols) */}
              <Card title="Sales Trend" icon="📊" className="lg:col-span-2" delay={2}>
                <div className="h-[380px]">
                  {!hydrated || loading ? (
                    <div className="h-full w-full animate-pulse rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-neutral-800 dark:to-neutral-900" />
                  ) : (
                    <Chart analytics={analytics} />
                  )}
                </div>
              </Card>

              {/* Sales Summary */}
              <BigValueCard
                icon="💵"
                title="Sales"
                value={
                  <span className="flex items-baseline gap-2">
                    <LiveNumber value={sumAmountAED('amountDelivered')} maximumFractionDigits={0} />
                    <span className="text-xl font-medium text-slate-400 dark:text-neutral-500">
                      AED
                    </span>
                  </span>
                }
                subtitle="Total delivered amount"
                loading={loading}
                delay={3}
              />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Order Status Pie */}
              <Card title="Order Status" icon="📋" delay={4}>
                <PieChart data={pieData} loading={loading} />
              </Card>

              {/* Quick Stats */}
              <Card title="Order Breakdown" icon="📊" delay={5}>
                <div className="space-y-1">
                  <StatBadge
                    label="Open"
                    value={fmtNum(statusTotals.pending)}
                    color="#f59e0b"
                    to="/user/orders?ship=open"
                  />
                  <StatBadge
                    label="Assigned"
                    value={fmtNum(statusTotals.assigned)}
                    color="#3b82f6"
                    to="/user/orders?ship=assigned"
                  />
                  <StatBadge
                    label="Picked Up"
                    value={fmtNum(statusTotals.picked_up)}
                    color="#8b5cf6"
                    to="/user/orders?ship=picked_up"
                  />
                  <StatBadge
                    label="Out for Delivery"
                    value={fmtNum(statusTotals.out_for_delivery)}
                    color="#f97316"
                    to="/user/orders?ship=out_for_delivery"
                  />
                  <StatBadge
                    label="Delivered"
                    value={fmtNum(statusTotals.delivered)}
                    color="#10b981"
                    to="/user/orders?ship=delivered"
                  />
                  <StatBadge
                    label="Cancelled"
                    value={fmtNum(statusTotals.cancelled)}
                    color="#ef4444"
                    to="/user/orders?ship=cancelled"
                  />
                  <StatBadge
                    label="Returned"
                    value={fmtNum(statusTotals.returned)}
                    color="#64748b"
                    to="/user/orders?ship=returned"
                  />
                </div>
              </Card>

              {/* Country Breakdown */}
              <Card title="Countries" icon="🌍" delay={6}>
                <div className="space-y-1">
                  {COUNTRY_LIST.slice(0, 5).map((c) => {
                    const m = countryMetrics(c)
                    const flag = COUNTRY_INFO[c]?.flag
                    return (
                      <NavLink
                        key={c}
                        to={`/user/orders?country=${encodeURIComponent(c)}`}
                        className="group flex items-center justify-between rounded-2xl p-3 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-neutral-800/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl transition-transform group-hover:scale-125">{flag}</span>
                          <span className="text-sm font-semibold text-slate-700 dark:text-neutral-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {c}
                          </span>
                        </div>
                        <span className="text-base font-bold text-slate-800 dark:text-white tabular-nums">
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
    </>
  )
}
