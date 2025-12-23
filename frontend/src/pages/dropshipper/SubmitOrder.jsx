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
                 <label className="label" style={{fontWeight: 600, marginBottom: