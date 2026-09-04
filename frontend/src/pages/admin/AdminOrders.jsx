import { useEffect, useState } from 'react'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:5000/api') + '/order/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed')
      setOrders(data.orders || [])
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:5000/api') + '/order/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: JSON.stringify({ orderId, status })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed')
      alert('Updated')
      load()
    } catch (err) {
      alert(err.message || 'Failed')
    }
  }

  if (loading) return <div className="py-10">Loading orders...</div>
  if (error) return <div className="py-10 text-red-600">{error}</div>

  return (
    <div className="py-10">
      <h2 className="text-2xl font-semibold mb-4">All Orders</h2>
      {orders.length === 0 ? <div>No orders yet</div> : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o._id} className="border p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">{o._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{o.userId?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">₹{o.amount}</p>
                </div>
              </div>

              <div className="mt-3">
                <label className="text-sm">Status</label>
                <select defaultValue={o.status} onChange={(e) => updateStatus(o._id, e.target.value)} className="border p-2 ml-2">
                  {['Order Placed','Packing','Shipped','Out for Delivery','Delivered','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="mt-3">
                {(o.items || []).map((it, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={it.image || 'https://placehold.co/80x80'} alt={it.name} className="w-16 h-16 object-cover" />
                    <div>
                      <p className="font-medium">{it.name}</p>
                      <p className="text-sm">Qty: {it.quantity} • Size: {it.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminOrders
