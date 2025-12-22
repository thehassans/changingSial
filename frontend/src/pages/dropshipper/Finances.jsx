import React, { useEffect, useState } from 'react'
import { apiGet } from '../../api'

export default function DropshipperFinances() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiGet('/api/dropshippers/finances')
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div style={{padding: 20}}>Loading finances...</div>

  return (
    <div style={{display: 'grid', gap: 24}}>
       <h1 className="gradient" style={{fontSize: 28, fontWeight: 700, margin: 0}}>Financial Overview</h1>

       <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16}}>
          <div className="card brand-gradient" style={{color: 'white', padding: 24}}>
             <div style={{opacity: 0.8, fontWeight: 500}}>Total Earnings</div>
             <div style={{fontSize: 32, fontWeight: 800}}>AED {data?.totalProfit?.toFixed(2)}</div>
             <div style={{marginTop: 8, fontSize: 13, opacity: 0.8}}>Lifetime earnings from delivered orders</div>
          </div>
          
          <div className="card" style={{padding: 24, borderLeft: '4px solid #10b981'}}>
             <div style={{color: 'var(--muted)', fontWeight: 500}}>Paid Out</div>
             <div style={{fontSize: 32, fontWeight: 800, color: '#10b981'}}>AED {data?.totalPaid?.toFixed(2)}</div>
          </div>

          <div className="card" style={{padding: 24, borderLeft: '4px solid #f59e0b'}}>
             <div style={{color: 'var(--muted)', fontWeight: 500}}>Pending Payout</div>
             <div style={{fontSize: 32, fontWeight: 800, color: '#f59e0b'}}>AED {data?.totalUnpaid?.toFixed(2)}</div>
          </div>
       </div>

       <div className="card" style={{padding: 0, overflow: 'hidden'}}>
          <div style={{padding: '16px 24px', borderBottom: '1px solid var(--border)', fontWeight: 600}}>
             Earning History (Delivered Orders)
          </div>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
               <thead style={{background: 'var(--panel-2)', fontSize: 13, textTransform: 'uppercase', color: 'var(--muted)'}}>
                  <tr>
                     <th style={{padding: 16, textAlign: 'left'}}>Order ID</th>
                     <th style={{padding: 16, textAlign: 'left'}}>Date</th>
                     <th style={{padding: 16, textAlign: 'left'}}>Status</th>
                     <th style={{padding: 16, textAlign: 'right'}}>Profit</th>
                     <th style={{padding: 16, textAlign: 'center'}}>Payout</th>
                  </tr>
               </thead>
               <tbody>
                  {data?.orders?.length > 0 ? (
                     data.orders.map(o => (
                        <tr key={o._id} style={{borderBottom: '1px solid var(--border)'}}>
                           <td style={{padding: 16, fontWeight: 500}}>#{o.orderId}</td>
                           <td style={{padding: 16, fontSize: 13}}>
                              {new Date(o.createdAt).toLocaleDateString()}
                           </td>
                           <td style={{padding: 16}}>
                              <span className="badge success">Delivered</span>
                           </td>
                           <td style={{padding: 16, textAlign: 'right', fontWeight: 600, color: '#10b981'}}>
                              AED {o.dropshipperProfit?.amount?.toFixed(2)}
                           </td>
                           <td style={{padding: 16, textAlign: 'center'}}>
                              {o.dropshipperProfit?.isPaid ? (
                                <span className="badge success">PAID</span>
                              ) : (
                                <span className="badge warn">PENDING</span>
                              )}
                           </td>
                        </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan={5} style={{padding: 32, textAlign: 'center', opacity: 0.5}}>No earnings yet</td>
                     </tr>
                  )}
               </tbody>
            </table>
          </div>
       </div>
    </div>
  )
}
