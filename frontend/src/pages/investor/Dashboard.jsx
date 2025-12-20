import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import './Dashboard.css'

export default function InvestorDashboard() {
  const { user } = useOutletContext()
  const [graphData, setGraphData] = useState([])
  const [dailyProfit, setDailyProfit] = useState(0)

  // Initialize mock historical data
  useEffect(() => {
    const initialData = []
    const baseValue = 1500
    const now = new Date()
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      initialData.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: baseValue + Math.random() * 200 - 100
      })
    }
    setGraphData(initialData)
    // Set initial daily profit based on last value (simulated)
    setDailyProfit(initialData[initialData.length - 1].value * 0.15) // Approx 15% of value as dummy daily profit base
  }, [])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGraphData(currentData => {
        const lastValue = currentData[currentData.length - 1].value
        const newValue = lastValue + (Math.random() * 40 - 20) // Random walk
        const now = new Date()
        const newEntry = {
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: Math.max(1000, newValue) // Prevent negative or too low
        }
        
        // Update daily profit display to match the "live" feeling
        setDailyProfit(p => p + (Math.random() * 2 - 1)) 

        const newData = [...currentData.slice(1), newEntry]
        return newData
      })
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [])

  if (!user?.investorProfile) {
    return (
      <div className="investor-dashboard loading">
        <div className="id-loader">
          <div className="spinner"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  const { investorProfile, firstName } = user
  const { 
    investmentAmount, 
    earnedProfit, 
    currency 
  } = investorProfile

  // Calculate a simulated "Daily Profit" if not provided, or use the live simulation
  // For the display, let's use the live fluctuating one for "Today's Live Profit" effect
  const displayDailyProfit = Math.abs(dailyProfit).toFixed(2)

  return (
    <div className="investor-dashboard">
      <div className="id-background-overlay" />
      
      {/* Header Section */}
      <div className="id-header">
        <div className="id-welcome">
          <span className="id-greeting">Good day,</span>
          <h1 className="id-name">{firstName}</h1>
        </div>
        <div className="id-live-indicator">
          <span className="blink-dot"></span>
          Live Market
        </div>
      </div>

      {/* Main Hero Section with Graph */}
      <div className="id-hero-section">
        <div className="id-chart-container">
          <div className="id-chart-header">
            <h3>Performance Analytics</h3>
            <div className="id-chart-legend">
              <span className="legend-item"><span className="dot profit"></span>Profit Trends</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={graphData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={val => `${currency} ${Math.round(val)}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="id-stats-grid">
        {/* Daily Profit - The Star */}
        <div className="id-stat-card premium-glow">
          <div className="id-stat-icon gold">
             ⚡
          </div>
          <div className="id-stat-content">
            <span className="id-stat-label">Daily Profit</span>
            <div className="id-stat-value highlight">
              +{displayDailyProfit} <span className="currency">{currency}</span>
            </div>
            <div className="id-stat-trend positive">
              ↑ 4.2% from yesterday
            </div>
          </div>
        </div>

        {/* Total Investment */}
        <div className="id-stat-card glass">
          <div className="id-stat-icon blue">
             💎
          </div>
          <div className="id-stat-content">
            <span className="id-stat-label">Total Investment</span>
            <div className="id-stat-value">
              {Number(investmentAmount).toLocaleString()} <span className="currency">{currency}</span>
            </div>
            <div className="id-stat-sub">Active Portfolio</div>
          </div>
        </div>

        {/* Total Earned */}
        <div className="id-stat-card glass">
          <div className="id-stat-icon green">
             💰
          </div>
          <div className="id-stat-content">
            <span className="id-stat-label">Total Earned</span>
            <div className="id-stat-value">
              {Number(earnedProfit).toLocaleString()} <span className="currency">{currency}</span>
            </div>
            <div className="id-stat-sub">Lifetime Earnings</div>
          </div>
        </div>
      </div>

      {/* Recent Live Activity List (Mocked for Visuals) */}
      <div className="id-activity-feed">
        <h3>Live Market Activity</h3>
        <div className="activity-list">
          {[1,2,3].map((_, i) => (
             <div key={i} className="activity-item">
               <div className="activity-icon">📈</div>
               <div className="activity-info">
                 <span className="activity-title">Market Fluctuation Update</span>
                 <span className="activity-time">{i * 15 + 2} mins ago</span>
               </div>
               <div className="activity-amount positive">
                 +{Math.floor(Math.random() * 50 + 10)} {currency}
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  )
}
