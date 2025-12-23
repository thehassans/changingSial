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
           items: [{ productId: form.productId, quantity: Number(form.quantity) }]
        })
        setMsg('success')
        setTimeout(() => navigate('/dropshipper/orders'), 1500)
     } catch (err) {
        setMsg('error: ' + (err.message || 'Failed'))
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
    <div style={{maxWidth: 900, margin: '0 auto'}}>
       {/* Premium Header with Gradient */}
       <div style={{marginBottom: 32}}>
         <h1 style={{
           fontSize: 32, 
           fontWeight: 800, 
           background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
           WebkitBackgroundClip: 'text',
           WebkitTextFillColor: 'transparent',
           marginBottom: 8
         }}>Create New Order</h1>
         <p style={{fontSize: 14, color: 'var(--text-secondary)', margin: 0}}>
           Fill in customer and product details to submit a new order
         </p>
       </div>
       
       {/* Premium Glassmorphic Form Card */}
       <div style={{
         background: 'var(--panel)',
         border: '1px solid var(--border)',
         borderRadius: 16,
         overflow: 'hidden',
         boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
       }}>
         <form onSubmit={submit}>
           {/* Customer Details Section */}
           <div style={{padding: 32, borderBottom: '1px solid var(--border)'}}>
             <div style={{
               display: 'flex', 
               alignItems: 'center', 
               gap: 12, 
               marginBottom: 24
             }}>
               <div style={{
                 width: 40,
                 height: 40,
                 borderRadius: 10,
                 background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 fontSize: 18,
                 boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
               }}>
                 👤
               </div>
               <div>
                 <div style={{fontSize: 18, fontWeight: 700}}>Customer Details</div>
                 <div style={{fontSize: 12, color: 'var(--text-secondary)'}}>Enter customer information</div>
               </div>
             </div>
             
             <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20}}>
               <div>
                 <label className="label" style={{fontWeight: 600, marginBottom: 8, display: 'block'}}>Customer Name</label>
                 <input 
                   className="input" 
                   name="customerName" 
                   value={form.customerName} 
                   onChange={onChange} 
                   required 
                   placeholder="Enter full name"
                   style={{width: '100%'}}
                 />
               </div>
               <div>
                 <label className="label" style={{fontWeight: 600, marginBottom: 8, display: 'block'}}>Phone Number</label>
                 <div style={{display: 'flex', gap: 8}}>
                   <select 
                     className="input" 
                     style={{width: 120}}
                     name="phoneCountryCode"
                     value={form.phoneCountryCode}
                     onChange={e => {
                        const c = COUNTRY_OPTS.find(x => x.code === e.target.value)
                        setForm(f => ({...f, phoneCountryCode: e.target.value, orderCountry: c?.name || 'UAE'}))
                     }}
                   >
                      {COUNTRY_OPTS.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                   </select>
                   <input 
                     className="input" 
                     name="customerPhone" 
                     value={form.customerPhone} 
                     onChange={onChange} 
                     required 
                     placeholder="50xxxxxxx"
                     style={{flex: 1}}
                   />
                 </div>
               </div>
               <div style={{gridColumn: '1 / -1'}}>
                 <label className="label" style={{fontWeight: 600, marginBottom: 8, display: 'block'}}>Full Address</label>
                 <textarea 
                   className="input" 
                   name="customerAddress" 
                   value={form.customerAddress} 
                   onChange={onChange} 
                   required 
                   rows={3}
                   placeholder="Building, Street, Area..."
                   style={{width: '100%', resize: 'vertical'}}
                 />
               </div>
               <div>
                 <label className="label" style={{fontWeight: 600, marginBottom: 8, display: 'block'}}>City</label>
                 <input 
                   className="input" 
                   name="city" 
                   value={form.city} 
                   onChange={onChange} 
                   required 
                   placeholder="e.g. Dubai"
                   style={{width: '100%'}}
                 />
               </div>
               <div>
                 <label className="label" style={{fontWeight: 600, marginBottom: 8, display: 'block'}}>Country</label>
                 <input 
                   className="input" 
                   value={form.orderCountry} 
                   readOnly 
                   style={{width: '100%', background: 'var(--panel-2)', cursor: 'not-allowed'}} 
                 />
               </div>
             </div>
           </div>

           {/* Order Details Section */}
           <div style={{padding: 32, borderBottom: '1px solid var(--border)'}}>
             <div style={{
               display: 'flex', 
               alignItems: 'center', 
               gap: 12, 
               marginBottom: 24
             }}>
               <div style={{
                 width: 40,
                 height: 40,
                 borderRadius: 10,
                 background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 fontSize: 18,
                 boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
               }}>
                 📦
               </div>
               <div>
                 <div style={{fontSize: 18, fontWeight: 700}}>Order Details</div>
                 <div style={{fontSize: 12, color: 'var(--text-secondary)'}}>Select product and quantity</div>
               </div>
             </div>
             
             <div style={{display: 'grid', gap: 20}}>
               <div>
                 <label className="label" style={{fontWeight: 600, marginBottom: 8, display: 'block'}}>Select Product</label>
                 <select 
                   className="input" 
                   name="productId" 
                   value={form.productId} 
                   onChange={onChange} 
                   required
                   style={{width: '100%', padding: 12}}
                 >
                   <option value="">-- Choose a product --</option>
                   {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.inStock ? '✓ In Stock' : '✗ Out of Stock'})</option>
                   ))}
                 </select>
               </div>

               {selectedProduct && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05))',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    padding: 20, 
                    borderRadius: 12, 
                    display: 'flex', 
                    gap: 32, 
                    flexWrap: 'wrap'
                  }}>
                    <div>
                      <div style={{fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4}}>Retail Price</div>
                      <div style={{fontSize: 20, fontWeight: 800, color: 'var(--text-primary)'}}>{selectedProduct.baseCurrency} {selectedProduct.price}</div>
                    </div>
                    <div>
                      <div style={{fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4}}>Your Cost</div>
                      <div style={{fontSize: 20, fontWeight: 800, color: '#10b981'}}>{selectedProduct.baseCurrency} {selectedProduct.dropshippingPrice || selectedProduct.price}</div>
                    </div>
                    <div>
                      <div style={{fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4}}>Potential Margin</div>
                      <div style={{fontSize: 20, fontWeight: 800, color: '#8b5cf6'}}>
                        {selectedProduct.baseCurrency} {(Number(selectedProduct.price) - Number(selectedProduct.dropshippingPrice || selectedProduct.price)).toFixed(2)}
                      </div>
                    </div>
                  </div>
               )}

               <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20}}>
                 <div>
                   <label className="label" style={{fontWeight: 600, marginBottom: 8, display: 'block'}}>Quantity</label>
                   <input 
                     className="input" 
                     type="number" 
                     min="1" 
                     name="quantity" 
                     value={form.quantity} 
                     onChange={onChange} 
                     required 
                     style={{width: '100%'}}
                   />
                 </div>
                 <div>
                   <label className="label" style={{fontWeight: 600, marginBottom: 8, display: 'block'}}>COD Amount (Total)</label>
                   <input 
                     className="input" 
                     type="number" 
                     min="0" 
                     step="0.01" 
                     name="total" 
                     value={form.total} 
                     onChange={onChange} 
                     required 
                     placeholder="0.00"
                     style={{width: '100%'}}
                   />
                   <div style={{fontSize: 11, marginTop: 6, color: 'var(--text-secondary)'}}>Include shipping if applicable</div>
                 </div>
               </div>
             </div>
           </div>

           {/* Profit Estimate Banner */}
           {selectedProduct && (
              <div style={{
                padding: 24,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
                borderBottom: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16}}>
                  <div>
                    <div style={{fontSize: 12, fontWeight: 600, color: '#065f46', textTransform: 'uppercase', marginBottom: 4}}>Estimated Profit</div>
                    <div style={{fontSize: 11, color: 'var(--text-secondary)'}}>Subject to final delivery confirmation</div>
                  </div>
                  <div style={{
                    fontSize: 32, 
                    fontWeight: 900, 
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em'
                  }}>
                    {selectedProduct.baseCurrency} {estimatedProfit}
                  </div>
                </div>
              </div>
           )}

           {/* Action Buttons */}
           <div style={{padding: 32, display: 'flex', justifyContent: 'flex-end', gap: 12}}>
             <button 
               type="button" 
               className="btn secondary" 
               onClick={() => navigate('/dropshipper/dashboard')}
               style={{minWidth: 120}}
             >
               Cancel
             </button>
             <button 
               type="submit"
               className="btn primary" 
               disabled={loading || !selectedProduct}
               style={{
                 minWidth: 160,
                 background: loading ? 'var(--panel-2)' : 'linear-gradient(135deg, #10b981, #059669)',
                 boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
               }}
             >
               {loading ? (
                 <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                   <span className="spinner" style={{width: 14, height: 14}}></span>
                   Submitting...
                 </span>
               ) : '✓ Submit Order'}
             </button>
           </div>
         </form>

         {/* Success/Error Message */}
         {msg && (
            <div style={{
              padding: 20,
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 14,
              background: msg === 'success' ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)',
              color: msg === 'success' ? '#065f46' : '#991b1b',
              borderTop: '1px solid ' + (msg === 'success' ? '#10b981' : '#ef4444')
            }}>
              {msg === 'success' ? '✅ Order submitted successfully! Redirecting...' : msg}
            </div>
         )}
       </div>
    </div>
  )
}
