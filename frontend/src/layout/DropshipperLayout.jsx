import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { apiGet } from '../api.js'

/* Ultra Premium Design System */
const STYLES = `
  :root {
    --ds-bg: #0f172a;
    --ds-panel: rgba(30, 41, 59, 0.7);
    --ds-glass: rgba(255, 255, 255, 0.03);
    --ds-border: rgba(255, 255, 255, 0.08);
    --ds-text-primary: #f8fafc;
    --ds-text-secondary: #94a3b8;
    --ds-accent: #8b5cf6;
    --ds-accent-glow: rgba(139, 92, 246, 0.5);
  }

  [data-theme='light'] {
     --ds-bg: #f8fafc;
     --ds-panel: rgba(255, 255, 255, 0.8);
     --ds-glass: rgba(0, 0, 0, 0.02);
     --ds-border: rgba(0, 0, 0, 0.06);
     --ds-text-primary: #0f172a;
     --ds-text-secondary: #64748b;
  }

  .ds-layout {
    display: flex;
    height: 100vh;
    background: var(--ds-bg);
    color: var(--ds-text-primary);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    overflow: hidden;
    position: relative;
  }
  
  /* Ambient Background Glow */
  .ds-glow-bg {
    position: absolute;
    width: 600px;
    height: 600px;
    top: -100px;
    left: -100px;
    background: radial-gradient(circle, var(--ds-accent-glow) 0%, transparent 70%);
    opacity: 0.15;
    pointer-events: none;
    z-index: 0;
  }

  .ds-sidebar {
    width: 260px;
    height: 100%;
    background: var(--ds-panel);
    backdrop-filter: blur(20px);
    border-right: 1px solid var(--ds-border);
    display: flex;
    flex-direction: column;
    z-index: 20;
    transition: transform 0.3s ease;
  }

  .ds-sidebar.mobile-hidden {
    display: none;
  }

  .ds-brand {
    padding: 32px 24px;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  [data-theme='light'] .ds-brand {
    background: linear-gradient(135deg, #0f172a 0%, #475569 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .ds-nav {
    flex: 1;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ds-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    color: var(--ds-text-secondary);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .ds-link:hover {
    background: var(--ds-glass);
    color: var(--ds-text-primary);
  }

  .ds-link.active {
    background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%);
    color: var(--ds-accent);
    border-left: 3px solid var(--ds-accent);
  }
  
  .ds-link.active::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--ds-accent);
    opacity: 0.05;
  }

  .ds-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 10;
    overflow: hidden;
  }

  .ds-header {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    border-bottom: 1px solid var(--ds-border);
    backdrop-filter: blur(10px);
  }

  .ds-user-menu {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .ds-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    display: grid;
    place-items: center;
    font-weight: 700;
    color: white;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
  }

  .ds-content {
    flex: 1;
    overflow-y: auto;
    padding: 32px;
  }

  /* Mobile Bottom Nav */
  .ds-bottom-nav {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--ds-border);
    z-index: 100;
    justify-content: space-around;
    align-items: center;
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  [data-theme='light'] .ds-bottom-nav {
    background: rgba(255, 255, 255, 0.9);
  }
  
  .ds-mobile-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: var(--ds-text-secondary);
    text-decoration: none;
    font-size: 10px;
    font-weight: 500;
    flex: 1;
    height: 100%;
    justify-content: center;
  }
  
  .ds-mobile-tab.active {
    color: var(--ds-accent);
  }

  @media (max-width: 768px) {
    .ds-sidebar { display: none; }
    .ds-bottom-nav { display: flex; }
    .ds-content { padding: 16px; padding-bottom: 80px; }
    .ds-header { padding: 0 16px; height: 60px; }
  }
  
  /* Scrollbar */
  .ds-content::-webkit-scrollbar {
    width: 6px;
  }
  .ds-content::-webkit-scrollbar-track {
    background: transparent;
  }
  .ds-content::-webkit-scrollbar-thumb {
    background: var(--ds-border);
    border-radius: 99px;
  }
`

export default function DropshipperLayout() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  )
  const navigate = useNavigate()
  
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark'
    } catch {
      return 'dark'
    }
  })
  
  const [me, setMe] = useState(() => { try{ return JSON.parse(localStorage.getItem('me')||'{}') }catch{ return {} } })

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme)
    } catch {}
    const root = document.documentElement
    if (theme === 'dark') root.setAttribute('data-theme', 'dark')
    else root.removeAttribute('data-theme')
  }, [theme])

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    (async () => {
      try{
        const r = await apiGet('/api/users/me')
        setMe(r?.user||{})
      }catch{}
    })()
  }, [])

  function doLogout() {
    try { localStorage.removeItem('token'); localStorage.removeItem('me') } catch {}
    try { navigate('/login', { replace: true }) } catch {}
    setTimeout(() => { try { window.location.assign('/login') } catch {} }, 30)
  }

  const links = [
    { to: '/dropshipper/dashboard', label: 'Overview', icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { to: '/dropshipper/products', label: 'Products', icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )},
    { to: '/dropshipper/submit-order', label: 'New Order', icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    )},
    { to: '/dropshipper/orders', label: 'My Orders', icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { to: '/dropshipper/finances', label: 'Earnings', icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
  ]

  return (
    <>
      <style>{STYLES}</style>
      <div className="ds-layout">
        <div className="ds-glow-bg" />
        
        {/* Sidebar */}
        {!isMobile && (
          <aside className="ds-sidebar">
            <div className="ds-brand">
              <span>Buysial</span>
            </div>
            <nav className="ds-nav">
              {links.map(l => (
                <NavLink key={l.to} to={l.to} className={({isActive}) => `ds-link ${isActive?'active':''}`}>
                  {l.icon}
                  <span>{l.label}</span>
                </NavLink>
              ))}
            </nav>
            <div style={{padding: 24}}>
              <div style={{
                padding: 16, borderRadius: 12, background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                border: '1px solid var(--ds-border)', display: 'flex', flexDirection: 'column', gap: 8
              }}>
                 <div style={{fontSize:12, fontWeight:600, color:'var(--ds-accent)'}}>PRO TIPS</div>
                 <div style={{fontSize:11, color:'var(--ds-text-secondary)', lineHeight: 1.4}}>
                   Maintain a high delivery rate to unlock exclusive products and faster payouts.
                 </div>
              </div>
            </div>
          </aside>
        )}

        <main className="ds-main">
          {/* Header */}
          <header className="ds-header">
             <div style={{display:'flex', alignItems:'center', gap: 12}}>
               {isMobile && (
                  <div className="ds-brand" style={{padding:0}}>
                    <img src="/logo.png" alt="Buysial" style={{height: '28px', width: 'auto'}} />
                  </div>
               )}
             </div>

             <div className="ds-user-menu">
               <button 
                 onClick={() => setTheme(t => t==='dark'?'light':'dark')}
                 style={{background:'transparent', border:'none', fontSize:20, cursor:'pointer', padding:8}}
               >
                 {theme==='dark'?'🌙':'☀️'}
               </button>
               
               <div style={{textAlign:'right', display: isMobile?'none':'block'}}>
                 <div style={{fontSize:14, fontWeight:600}}>{me.firstName}</div>
                 <div style={{fontSize:12, color:'var(--ds-text-secondary)'}}>Dropshipper</div>
               </div>
               
               <div className="ds-avatar">
                 {me.firstName?.[0] || 'D'}
               </div>

               <button 
                 onClick={doLogout}
                 style={{
                   background: 'rgba(239, 68, 68, 0.1)', color:'#ef4444', border:'none', 
                   padding:'8px 12px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', marginLeft: 8
                 }}
               >
                 Exit
               </button>
             </div>
          </header>

          <div className="ds-content">
            <Outlet />
          </div>
        </main>

        {/* Mobile Tab Bar */}
        {isMobile && (
          <nav className="ds-bottom-nav">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} className={({isActive})=> `ds-mobile-tab ${isActive?'active':''}`}>
                {React.cloneElement(l.icon, { width: 24, height: 24 })}
                <span>{l.label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </>
  )
}
