import React, { useEffect, useState } from 'react'
import { apiGet, API_BASE } from '../../api'
import { useNavigate } from 'react-router-dom'

export default function DropshipperProducts(){
  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function load(){
    setLoading(true)
    try{
      const data = await apiGet('/api/products')
      const list = data.products||[]
      list.sort((a,b)=> String(a.name||'').localeCompare(String(b.name||'')))
      setRows(list)
    }catch(_e){ setRows([]) }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ load() },[])

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 32}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20}}>
            <div>
               <h1 style={{fontSize: 32, fontWeight: 800, margin: 0, 
                 background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', 
                 WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
               }}>
                 Product Catalog
               </h1>
               <div style={{color: 'var(--ds-text-secondary)', marginTop: 8, fontSize:16}}>
                 High-quality products ready for you to sell.
               </div>
            </div>
            
            <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
               <div style={{position: 'relative'}}>
                 <input 
                   placeholder="Search products..." 
                   value={query} 
                   onChange={e=>setQuery(e.target.value)}
                   style={{
                     minWidth: 280,
                     background: 'var(--ds-glass)', 
                     border: '1px solid var(--ds-border)',
                     padding: '12px 16px', borderRadius: 12,
                     color: 'var(--ds-text-primary)',
                     outline: 'none',
                     backdropFilter: 'blur(10px)'
                   }}
                 />
                 <div style={{position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', opacity:0.5}}>🔍</div>
               </div>
               <button 
                 onClick={load} 
                 style={{
                   background: 'var(--ds-panel)', border:'1px solid var(--ds-border)', 
                   color: 'var(--ds-text-primary)', padding: '12px', borderRadius: 12, cursor: 'pointer'
                 }}
               >
                 🔄
               </button>
            </div>
        </div>

        {loading ? (
           <div style={{display:'grid', placeItems:'center', height:'400px', color:'var(--ds-text-secondary)'}}>
             <div className="spinner"></div>
           </div>
        ) : (
           <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24}}>
              {rows
                .filter(p => !query || p.name.toLowerCase().includes(query.toLowerCase()))
                .map(p => {
                 const firstImg = (p.images && p.images[0]) || p.imagePath || ''
                 const cost = p.dropshippingPrice || p.price || 0
                 const profit = (p.price || 0) - cost
                 const hasProfit = profit > 0

                 return (
                    <div key={p._id} style={{
                       background: 'var(--ds-panel)', backdropFilter: 'blur(10px)',
                       border: '1px solid var(--ds-border)', borderRadius: 20,
                       overflow: 'hidden', display: 'flex', flexDirection: 'column',
                       transition: 'transform 0.2s',
                       position: 'relative'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                       <div style={{height: 220, background: '#1e293b', position: 'relative', overflow:'hidden'}}>
                          {firstImg ? (
                             <img src={`${API_BASE}${firstImg}`} alt={p.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                          ) : (
                             <div style={{width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#64748b'}}>No Image</div>
                          )}
                          <div style={{position: 'absolute', top: 12, right: 12}}>
                             {p.inStock ? (
                                <span style={{
                                  background: 'rgba(16, 185, 129, 0.9)', color:'white', backdropFilter:'blur(4px)',
                                  padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
                                }}>IN STOCK</span>
                             ) : (
                                <span style={{
                                  background: 'rgba(239, 68, 68, 0.9)', color:'white', backdropFilter:'blur(4px)',
                                  padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
                                }}>SOLD OUT</span>
                             )}
                          </div>
                          
                          {/* Country Badge */}
                          {p.madeInCountry && (
                             <div style={{
                                position: 'absolute', bottom: 12, left: 12,
                                background: 'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)',
                                padding: '4px 10px', borderRadius: 8, fontSize: 11,
                                color: 'white', display:'flex', alignItems:'center', gap:4
                             }}>
                               📍 {p.madeInCountry}
                             </div>
                          )}
                       </div>
                       
                       <div style={{padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 16}}>
                          <div>
                             <div style={{fontSize: 11, textTransform: 'uppercase', color: 'var(--ds-accent)', fontWeight: 700, letterSpacing:'0.05em'}}>
                               {p.category}
                             </div>
                             <div style={{fontSize: 18, fontWeight: 700, margin: '4px 0', color: 'var(--ds-text-primary)'}}>
                               {p.name}
                             </div>
                          </div>

                          <div style={{
                             marginTop: 'auto', background: 'var(--ds-glass)', 
                             borderRadius: 12, padding: 16, border: '1px solid var(--ds-border)',
                             display: 'grid', gap: 8
                          }}>
                             <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 14}}>
                                <span style={{color:'var(--ds-text-secondary)'}}>Retail Price</span>
                                <span style={{fontWeight: 600, color:'var(--ds-text-primary)'}}>
                                   {p.baseCurrency} {p.price?.toFixed(2)}
                                </span>
                             </div>
                             
                             <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 14}}>
                                <span style={{color:'var(--ds-text-secondary)'}}>Dropship Cost</span>
                                <span style={{fontWeight: 700, color: 'var(--ds-accent)'}}>
                                   {p.baseCurrency} {cost.toFixed(2)}
                                </span>
                             </div>

                             <div style={{
                               borderTop: '1px solid var(--ds-border)', paddingTop: 8, marginTop: 4,
                               display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                             }}>
                                <span style={{fontSize: 12, color:'var(--ds-text-secondary)'}}>Potential Profit</span>
                                <span style={{fontSize: 14, fontWeight: 700, color: '#10b981'}}>
                                   +{p.baseCurrency} {profit.toFixed(2)}
                                </span>
                             </div>
                          </div>

                          <button 
                            onClick={() => navigate(`/dropshipper/submit-order?product=${p._id}`)}
                            disabled={!p.inStock}
                            style={{
                               background: !p.inStock ? 'var(--ds-border)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                               color: 'white', border: 'none', padding: '14px', borderRadius: 12,
                               fontWeight: 600, cursor: !p.inStock ? 'not-allowed' : 'pointer',
                               boxShadow: !p.inStock ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.3)',
                               transition: '0.2s'
                            }}
                          >
                             {p.inStock ? 'Start Selling' : 'Unavailable'}
                          </button>
                       </div>
                    </div>
                 )
              })}
           </div>
        )}
    </div>
  )
}
