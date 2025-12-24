import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function PremiumHeroBanner() {
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setOffset({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="ultra-premium-hero">
      <div className="hero-background">
        <div className="mesh-gradient"></div>
        <div className="mesh-overlay"></div>
      </div>

      <div className="hero-content">
        <div 
          className="hero-badge-container"
          style={{ transform: `translate(${offset.x * -0.5}px, ${offset.y * -0.5}px)` }}
        >
          <div className="hero-badge">
            <span className="badge-glow"></span>
            <span className="badge-icon">💎</span>
            <span className="badge-text">Official Buysial Store</span>
          </div>
        </div>
        
        <h1 
          className="hero-title"
          style={{ transform: `translate(${offset.x * -0.2}px, ${offset.y * -0.2}px)` }}
        >
          Elevate Your
          <br />
          <span className="gradient-text">Lifestyle Today</span>
        </h1>
        
        <p 
          className="hero-description"
          style={{ transform: `translate(${offset.x * -0.1}px, ${offset.y * -0.1}px)` }}
        >
          Discover an exclusive collection of premium products at wholesale prices. 
          Curated for excellence, delivered with care across the Gulf.
        </p>

        <div className="hero-actions">
          <Link to="/catalog" className="btn-ultra-primary">
            <span>Start Shopping</span>
            <div className="btn-shine"></div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link to="/about" className="btn-ultra-secondary">
            <span>Our Story</span>
          </Link>
        </div>

        <div 
          className="hero-stats-glass"
          style={{ transform: `translate(${offset.x * 0.1}px, ${offset.y * 0.1}px)` }}
        >
          <div className="stat-item">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Premium Products</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Expert Support</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">Fast</div>
            <div className="stat-label">Regional Delivery</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">Authentic Brands</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ultra-premium-hero {
          position: relative;
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          overflow: hidden;
          margin-bottom: 40px;
          border-radius: 0 0 40px 40px;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
        }

        .hero-background {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: #0f172a;
          overflow: hidden;
        }

        .mesh-gradient {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: 
            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
            radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
            radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%), 
            radial-gradient(at 0% 50%, hsla(339,49%,30%,1) 0, transparent 50%), 
            radial-gradient(at 100% 50%, hsla(339,49%,30%,1) 0, transparent 50%), 
            radial-gradient(at 0% 100%, hsla(339,49%,30%,1) 0, transparent 50%), 
            radial-gradient(at 50% 100%, hsla(225,39%,30%,1) 0, transparent 50%), 
            radial-gradient(at 100% 100%, hsla(253,16%,7%,1) 0, transparent 50%);
          filter: blur(80px);
          animation: meshMove 20s ease-in-out infinite alternate;
        }

        .mesh-overlay {
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          opacity: 0.4;
          mix-blend-mode: overlay;
        }

        .hero-content {
          position: relative;
          z-index: 10;
          max-width: 1000px;
          text-align: center;
          width: 100%;
        }

        .hero-badge-container {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
          transition: transform 0.1s ease-out;
        }

        .hero-badge {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 24px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 100px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          animation: float 6s ease-in-out infinite;
        }

        .badge-glow {
          position: absolute;
          inset: -2px;
          border-radius: 100px;
          background: linear-gradient(90deg, #f093fb, #f5576c, #4facfe);
          z-index: -1;
          opacity: 0.5;
          filter: blur(8px);
          animation: glowPulse 3s ease-in-out infinite;
        }

        .badge-text {
          color: white;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .hero-title {
          font-size: 72px;
          font-weight: 800;
          color: white;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -2px;
          transition: transform 0.1s ease-out;
        }

        .gradient-text {
          background: linear-gradient(to right, #fff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
          display: inline-block;
        }

        .gradient-text::after {
          content: '';
          position: absolute;
          bottom: 10px;
          left: 0;
          width: 100%;
          height: 8px;
          background: #a5b4fc;
          opacity: 0.3;
          z-index: -1;
          transform: skewX(-10deg);
        }

        .hero-description {
          font-size: 20px;
          color: #cbd5e1;
          max-width: 680px;
          margin: 0 auto 48px;
          line-height: 1.6;
          font-weight: 300;
          transition: transform 0.1s ease-out;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 64px;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .btn-ultra-primary {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 18px 40px;
          background: white;
          color: #0f172a;
          border-radius: 16px;
          font-weight: 700;
          font-size: 18px;
          text-decoration: none;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .btn-ultra-primary:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .btn-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.8) 50%,
            rgba(255,255,255,0) 100%
          );
          transform: skewX(-25deg);
          animation: shine 3s infinite;
        }

        .btn-ultra-primary svg {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
        }

        .btn-ultra-primary:hover svg {
          transform: translateX(4px);
        }

        .btn-ultra-secondary {
          display: inline-flex;
          align-items: center;
          padding: 18px 40px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border-radius: 16px;
          font-weight: 600;
          font-size: 18px;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .btn-ultra-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .hero-stats-glass {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
          align-items: center;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 32px;
          max-width: 900px;
          margin: 0 auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          transition: transform 0.1s ease-out;
        }

        .stat-item {
          text-align: center;
          transition: transform 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-5px);
        }

        .stat-number {
          font-size: 36px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #94a3b8;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent);
        }

        @keyframes meshMove {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-20px, -20px) scale(1.1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes shine {
          0% { left: -100%; opacity: 0; }
          20% { opacity: 0.5; }
          100% { left: 200%; opacity: 0; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Mobile Responsive */
        @media (max-width: 992px) {
          .hero-title { font-size: 56px; }
          .hero-stats-glass {
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
          .stat-divider { display: none; }
        }

        @media (max-width: 768px) {
          .ultra-premium-hero { padding: 60px 16px; min-height: auto; }
          .hero-title { font-size: 42px; letter-spacing: -1px; }
          .hero-description { font-size: 16px; margin-bottom: 32px; }
          .hero-actions { flex-direction: column; gap: 12px; margin-bottom: 40px; }
          .btn-ultra-primary, .btn-ultra-secondary { width: 100%; justify-content: center; padding: 16px; }
          
          .hero-stats-glass {
            padding: 20px;
            border-radius: 20px;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .stat-number { font-size: 28px; }
          .stat-label { font-size: 12px; }
        }

        @media (max-width: 480px) {
          .hero-title { font-size: 32px; }
          .hero-stats-glass { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

