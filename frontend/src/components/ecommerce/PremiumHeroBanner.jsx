import React from 'react'
import { Link } from 'react-router-dom'

export default function PremiumHeroBanner() {
  return (
    <div className="premium-hero-banner">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-icon">✨</span>
          <span className="badge-text">Premium Quality Products</span>
        </div>
        
        <h1 className="hero-title">
          Discover Quality Products
          <br />
          <span className="gradient-text">at Unbeatable Prices</span>
        </h1>
        
        <p className="hero-description">
          Your trusted marketplace for wholesale and retail shopping across the Gulf region
        </p>

        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-value">10,000+</div>
            <div className="stat-label">Products</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">50,000+</div>
            <div className="stat-label">Monthly Orders</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">500+</div>
            <div className="stat-label">Active Brands</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">10+</div>
            <div className="stat-label">Countries</div>
          </div>
        </div>

        <div className="hero-actions">
          <Link to="/catalog" className="btn-primary">
            <span>Shop Now</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link to="/about" className="btn-secondary">
            <span>Learn More</span>
          </Link>
        </div>
      </div>

      <div className="hero-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>

      <style jsx>{`
        .premium-hero-banner {
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          padding: 80px 24px 100px;
          overflow: hidden;
          margin-bottom: 40px;
        }

        .hero-content {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          z-index: 2;
          text-align: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 8px 20px;
          border-radius: 50px;
          margin-bottom: 24px;
          animation: fadeInDown 0.8s ease-out;
        }

        .badge-icon {
          font-size: 18px;
        }

        .badge-text {
          color: white;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.5px;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          color: white;
          margin: 0 0 24px 0;
          line-height: 1.2;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .gradient-text {
          background: linear-gradient(90deg, #ffd89b 0%, #19547b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
          max-width: 600px;
          margin: 0 auto 40px;
          line-height: 1.6;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 32px;
          max-width: 800px;
          margin: 0 auto 48px;
          padding: 32px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: white;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 0.8s ease-out 0.8s both;
        }

        .btn-primary,
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .btn-primary {
          background: white;
          color: #764ba2;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }

        .btn-primary svg {
          width: 20px;
          height: 20px;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .hero-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 1;
        }

        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: float 20s infinite ease-in-out;
        }

        .circle-1 {
          width: 400px;
          height: 400px;
          top: -200px;
          right: -100px;
          animation-delay: 0s;
        }

        .circle-2 {
          width: 300px;
          height: 300px;
          bottom: -150px;
          left: -75px;
          animation-delay: -7s;
        }

        .circle-3 {
          width: 200px;
          height: 200px;
          top: 50%;
          left: 10%;
          animation-delay: -14s;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .premium-hero-banner {
            padding: 60px 20px 80px;
          }

          .hero-title {
            font-size: 32px;
          }

          .hero-description {
            font-size: 16px;
          }

          .hero-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            padding: 24px;
          }

          .stat-value {
            font-size: 24px;
          }

          .stat-label {
            font-size: 12px;
          }

          .btn-primary,
          .btn-secondary {
            padding: 14px 28px;
            font-size: 14px;
            width: 100%;
            justify-content: center;
          }

          .decoration-circle {
            opacity: 0.5;
          }

          .circle-1 {
            width: 250px;
            height: 250px;
          }

          .circle-2 {
            width: 180px;
            height: 180px;
          }

          .circle-3 {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 28px;
          }

          .hero-stats {
            grid-template-columns: 1fr;
          }

          .stat-item {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  )
}
