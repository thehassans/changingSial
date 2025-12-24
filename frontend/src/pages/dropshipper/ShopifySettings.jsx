import React, { useEffect, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '../../api'
import { Link } from 'react-router-dom'

export default function ShopifySettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState(null)
  const [listedProducts, setListedProducts] = useState([])
  const [msg, setMsg] = useState({ text: '', type: '' })
  
  const [form, setForm] = useState({
    shopDomain: '',
    apiKey: '',
    apiSecret: '',
    accessToken: ''
  })
  
  useEffect(() => {
    loadSettings()
    loadListedProducts()
  }, [])
  
  async function loadSettings() {
    try {
      const data = await apiGet('/api/dropshippers/shopify/settings')
      setSettings(data)
      if (data.shopDomain) {
        setForm(f => ({ ...f, shopDomain: data.shopDomain }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  async function loadListedProducts() {
    try {
      const data = await apiGet('/api/dropshippers/shopify/listed-products')
      setListedProducts(data.products || [])
    } catch (err) {
      console.error(err)
    }
  }
  
  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMsg({ text: '', type: '' })
    
    try {
      const response = await apiPost('/api/dropshippers/shopify/settings', form)
      setMsg({ text: response.message || 'Shopify connected successfully!', type: 'success' })
      await loadSettings()
      setForm({ shopDomain: form.shopDomain, apiKey: '', apiSecret: '', accessToken: '' })
    } catch (err) {
      setMsg({ text: err.message || 'Failed to connect to Shopify', type: 'error' })
    } finally {
      setSaving(false)
    }
  }
  
  async function handleUnlist(productId) {
    if (!confirm('Remove this product from your Shopify store?')) return
    
    try {
      await apiDelete(`/api/dropshippers/shopify/unlist/${productId}`)
      setMsg({ text: 'Product unlisted successfully!', type: 'success' })
      await loadListedProducts()
    } catch (err) {
      setMsg({ text: err.message || 'Failed to unlist product', type: 'error' })
    }
  }
  
  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: 400, color: 'var(--ds-text-secondary)' }}>
        <div className="spinner" style={{ border: '3px solid var(--ds-border)', borderTopColor: 'var(--ds-accent)' }} />
      </div>
    )
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: 'var(--ds-text-primary)' }}>
          Shopify Integration
        </h1>
        <p style={{ color: 'var(--ds-text-secondary)', marginTop: 8, fontSize: 16 }}>
          Connect your Shopify store to list products directly from BuySial
        </p>
      </div>
      
      {/* Connection Status */}
      <div style={{
        padding: 24,
        background: settings?.connected 
          ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.05))' 
          : 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(220,38,38,0.05))',
        border: `1px solid ${settings?.connected ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: settings?.connected ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 24
        }}>
          {settings?.connected ? '✓' : '⚠'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ds-text-primary)' }}>
            {settings?.connected ? 'Connected to Shopify' : 'Not Connected'}
          </div>
          {settings?.shopDomain && (
            <div style={{ fontSize: 14, color: 'var(--ds-text-secondary)', marginTop: 4 }}>
              Store: <span style={{ fontWeight: 600 }}>{settings.shopDomain}</span>
              {settings.lastSync && (
                <> • Last synced: {new Date(settings.lastSync).toLocaleString()}</>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Message */}
      {msg.text && (
        <div style={{
          padding: 16,
          borderRadius: 12,
          background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          color: msg.type === 'success' ? '#10b981' : '#ef4444',
          fontWeight: 500
        }}>
          {msg.text}
        </div>
      )}
      
      {/* Credentials Form */}
      <form onSubmit={handleSave} style={{
        background: 'var(--ds-panel)',
        border: '1px solid var(--ds-border)',
        borderRadius: 16,
        padding: 32
      }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: 'var(--ds-text-primary)' }}>
          Shopify Credentials
        </h3>
        
        <div style={{ display: 'grid', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ds-text-secondary)', marginBottom: 8 }}>
              Shop Domain *
            </label>
            <input
              type="text"
              required
              value={form.shopDomain}
              onChange={e => setForm({ ...form, shopDomain: e.target.value })}
              placeholder="yourstore.myshopify.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--ds-border)',
                borderRadius: 12,
                background: 'var(--ds-glass)',
                color: 'var(--ds-text-primary)',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ds-text-secondary)', marginBottom: 8 }}>
              API Key *
            </label>
            <input
              type="text"
              required
              value={form.apiKey}
              onChange={e => setForm({ ...form, apiKey: e.target.value })}
              placeholder="Enter API Key"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--ds-border)',
                borderRadius: 12,
                background: 'var(--ds-glass)',
                color: 'var(--ds-text-primary)',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ds-text-secondary)', marginBottom: 8 }}>
              API Secret *
            </label>
            <input
              type="password"
              required
              value={form.apiSecret}
              onChange={e => setForm({ ...form, apiSecret: e.target.value })}
              placeholder="Enter API Secret"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--ds-border)',
                borderRadius: 12,
                background: 'var(--ds-glass)',
                color: 'var(--ds-text-primary)',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ds-text-secondary)', marginBottom: 8 }}>
              Admin API Access Token *
            </label>
            <input
              type="password"
              required
              value={form.accessToken}
              onChange={e => setForm({ ...form, accessToken: e.target.value })}
              placeholder="shpat_xxxxx"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--ds-border)',
                borderRadius: 12,
                background: 'var(--ds-glass)',
                color: 'var(--ds-text-primary)',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: 12,
              background: saving ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              fontWeight: 600,
              fontSize: 14,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 12px rgba(99,102,241,0.3)',
              transition: '0.2s'
            }}
          >
            {saving ? 'Testing Connection...' : settings?.connected ? 'Update Connection' : 'Connect Shopify'}
          </button>
        </div>
      </form>
      
      {/* Instructions */}
      <div style={{
        background: 'var(--ds-panel)',
        border: '1px solid var(--ds-border)',
        borderRadius: 16,
        padding: 32
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: 'var(--ds-text-primary)' }}>
          How to Get Shopify API Credentials
        </h3>
        <ol style={{ margin: 0, paddingLeft: 20, color: 'var(--ds-text-secondary)', lineHeight: 1.8, fontSize: 14 }}>
          <li>Go to your Shopify Admin → Settings → Apps and sales channels</li>
          <li>Click "Develop apps" → "Create an app"</li>
          <li>Name it "BuySial Integration" and create the app</li>
          <li>Go to "Configuration" tab → Configure Admin API scopes</li>
          <li>Enable: <code style={{ background: 'var(--ds-glass)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>write_products</code>, <code style={{ background: 'var(--ds-glass)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>read_products</code></li>
          <li>Save → Go to "API credentials" tab → Install app</li>
          <li>Copy the Admin API access token (starts with "shpat_")</li>
          <li>Paste all credentials above and click Connect</li>
        </ol>
      </div>
      
      {/* Listed Products */}
      {listedProducts.length > 0 && (
        <div style={{
          background: 'var(--ds-panel)',
          border: '1px solid var(--ds-border)',
          borderRadius: 16,
          overflow: 'hidden'
        }}>
          <div style={{ padding: 24, borderBottom: '1px solid var(--ds-border)' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ds-text-primary)' }}>
              Listed Products ({listedProducts.length})
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--ds-glass)', borderBottom: '1px solid var(--ds-border)' }}>
                  <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--ds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                  <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--ds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
                  <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--ds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Listed</th>
                  <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--ds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listedProducts.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--ds-border)' }}>
                    <td style={{ padding: 16, fontSize: 14, fontWeight: 600, color: 'var(--ds-text-primary)' }}>
                      {p.productName}
                    </td>
                    <td style={{ padding: 16, fontSize: 14, color: 'var(--ds-text-secondary)' }}>
                      {p.currency} {p.retailPrice}
                    </td>
                    <td style={{ padding: 16, fontSize: 13, color: 'var(--ds-text-secondary)' }}>
                      {new Date(p.listedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 16 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a
                          href={p.shopifyUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '6px 12px',
                            background: 'var(--ds-glass)',
                            border: '1px solid var(--ds-border)',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'var(--ds-accent)',
                            textDecoration: 'none'
                          }}
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleUnlist(p.productId)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#ef4444',
                            cursor: 'pointer'
                          }}
                        >
                          Unlist
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
