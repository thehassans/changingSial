import React, { useEffect, useState, useMemo } from 'react'
import { apiGet, apiPost } from '../../api'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function DropshipperSubmitOrder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preSelectedProductId = searchParams.get('product')

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({
     customerName: '',
     customerPhone: '',
     phoneCountryCode: '+971',
     orderCountry: 'UAE',
     city: '',
     customerAddress: '',
     productId: preSelectedProductId || '',
     quantity: 1,
     total: '', // COD Amount
     details: ''
  })
  
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
     async function load(){
        try {
           const res = await apiGet('/api/products')
           setProducts(res.products || [])
           if (preSelectedProductId) {
              const p = (res.products || []).find(x => x._id === preSelectedProductId)
              if (p) {
                 setSelectedProduct(p)
                 setForm(f => ({...f, total: p.price}))
              }
           }
        } catch (err) {
           console.error(err)
        }
     }
     load()
  }, [preSelectedProductId])

  const estimatedProfit = useMemo(() => {
     if (!selectedProduct) return 0
     const cod = Number(form.total) || 0
     const cost = Number(selectedProduct.dropshippingPrice || selectedProduct.price || 0)
     const qty = Number(form.quantity) || 1
     // Simple calculation: Profit = COD - (Cost * Qty)
     // Note: Shipping might be extra, ignoring for now or assuming included in COD
     return (cod - (cost * qty)).toFixed(2)
  }, [form.total, form.quantity, selectedProduct])

  function onChange(e) {
     const { name, value } = e.target
     setForm(f => ({...f, [name]: value}))
     if (name === 'productId') {
        const p = products.find(x => x._id === value)
        setSelectedProduct(p)
        if (p) setForm(f => ({...f, total: p.price, quantity: 1}))
     }
  }

  async function submit(e) {
     e.preventDefault()
     setLoading(true)
     setMsg('')
     try {
        await apiPost('/api/orders', {
           ...form,
           // Ensure items array is sent if backend expects it
           items: [{ productId: form.productId, quantity: Number(form.quantity) }]
        })
        setMsg('✅ Order Submitted Successfully!')
        setTimeout(() => navigate('/dropshipper/orders'), 1500)
     } catch (err) {
        setMsg('❌ ' + (err.message || 'Failed'))
     } finally {
        setLoading(false)
     }
  }

  const COUNTRY_OPTS = [
    { key: 'UAE', name: 'UAE', code: '+971' },
    { key: 'OM', name: 'Oman', code: '+968' },
    { key: 'KSA', name: 'KSA', code: '+966' },
    { key: 'BH', name: 'Bahrain', code: '+973' },
    { key: 'KW', name: 'Kuwait', code: '+965' },
    { key: 'QA', name: 'Qatar', code: '+974' },
    { key: 'IN', name: 'India', code: '+91' },
  ]

  return (
    <div style={{maxWidth: 800, margin: '0 auto'}}>
       <h1 className="gradient" style={{fontSize: 28, fontWeight: 700}}>Create New Order</h1>
       
       <div className="card" style={{padding: 32, display: 'grid', gap: 24}}>
          {/* Customer Details */}
          <div>
             <div style={{fontSize: 16, fontWeight: 700, marginBottom: 16}}>Customer Details</div>
             <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                <div>
                   <label className="label">Customer Name</label>
                   <input className="input" name="customerName" value={form.customerName} onChange={onChange} required />
                </div>
                <div>
                   <label className="label">Phone Number</label>
                   <div style={{display: 'flex', gap: 8}}>
                      <select 
                        className="input" 
                        style={{width: 100}}
                        name="phoneCountryCode"
                        value={form.phoneCountryCode}
                        onChange={e => {
                           const c = COUNTRY_OPTS.find(x => x.code === e.target.value)
                           setForm(f => ({...f, phoneCountryCode: e.target.value, orderCountry: c?.name || 'UAE'}))
                        }}
                      >
                         {COUNTRY_OPTS.map(c => <option key={c.code} value={c.code}>{c.code} ({c.name})</option>)}
                      </select>
                      <input className="input" name="customerPhone" value={form.customerPhone} onChange={onChange} required placeholder="50xxxxxxx" />
                   </div>
                </div>
                <div style={{gridColumn: '1 / -1'}}>
                   <label className="label">Address (City, Area, Street)</label>
                   <textarea className="input" name="customerAddress" value={form.customerAddress} onChange={onChange} required rows={3} />
                </div>
                <div>
                   <label className="label">City</label>
                   <input className="input" name="city" value={form.city} onChange={onChange} required />
                </div>
                <div>
                    <label className="label">Country</label>
                    <input className="input" value={form.orderCountry} readOnly style={{background: '#f9fafb'}} />
                </div>
             </div>
          </div>

          <div style={{height: 1, background: 'var(--border)'}}></div>

          {/* Order Details */}
          <div>
             <div style={{fontSize: 16, fontWeight: 700, marginBottom: 16}}>Order Details</div>
             <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                <div style={{gridColumn: '1 / -1'}}>
                   <label className="label">Select Product</label>
                   <select className="input" name="productId" value={form.productId} onChange={onChange} required>
                      <option value="">-- Select Product --</option>
                      {products.map(p => (
                         <option key={p._id} value={p._id}>{p.name} (Stock: {p.inStock ? 'Yes' : 'No'})</option>
                      ))}
                   </select>
                </div>

                {selectedProduct && (
                   <div style={{gridColumn: '1 / -1', background: 'var(--panel-2)', padding: 16, borderRadius: 8, display: 'flex', gap: 24, fontSize: 13}}>
                      <div>
                         <span style={{opacity: 0.7}}>Base Price:</span> <b>{selectedProduct.baseCurrency} {selectedProduct.price}</b>
                      </div>
                      <div>
                         <span style={{opacity: 0.7}}>Your Cost:</span> <b style={{color: '#10b981'}}>{selectedProduct.baseCurrency} {selectedProduct.dropshippingPrice || selectedProduct.price}</b>
                      </div>
                   </div>
                )}

                <div>
                   <label className="label">Quantity</label>
                   <input className="input" type="number" min="1" name="quantity" value={form.quantity} onChange={onChange} required />
                </div>
                <div>
                   <label className="label">COD Amount (Total to Collect)</label>
                   <input className="input" type="number" min="0" step="0.01" name="total" value={form.total} onChange={onChange} required />
                   <div style={{fontSize: 12, marginTop: 4, color: 'var(--muted)'}}>Include shipping if applicable in this amount</div>
                </div>
             </div>
          </div>

          {selectedProduct && (
             <div style={{background: 'linear-gradient(135deg, #10b98110, #34d39910)', padding: 20, borderRadius: 12, border: '1px solid #10b98130'}}>
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{fontWeight: 600, color: '#065f46'}}>Estimated Profit</div>
                    <div style={{fontSize: 24, fontWeight: 800, color: '#059669'}}>
                       {selectedProduct.baseCurrency} {estimatedProfit}
                    </div>
                 </div>
                 <div style={{fontSize: 12, opacity: 0.8, marginTop: 4, color: '#065f46'}}>
                    (Subject to final delivery confirmation)
                 </div>
             </div>
          )}

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8}}>
             <button type="button" className="btn secondary" onClick={() => navigate('/dropshipper/dashboard')}>Cancel</button>
             <button className="btn" onClick={submit} disabled={loading || !selectedProduct}>
                {loading ? 'Submitting...' : 'Submit Order'}
             </button>
          </div>

          {msg && (
             <div style={{
                padding: 16, borderRadius: 8, textAlign: 'center', fontWeight: 600,
                background: msg.includes('✅') ? '#d1fae5' : '#fee2e2',
                color: msg.includes('✅') ? '#065f46' : '#991b1b'
             }}>
                {msg}
             </div>
          )}
       </div>
    </div>
  )
}
