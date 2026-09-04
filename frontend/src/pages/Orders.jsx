import { useEffect, useState } from 'react'
import { apiPost } from '../utils/api'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiPost('/order/userorders', {})
        setOrders(res.orders || [])
      } catch (err) {
        setError(err.message || 'Unable to fetch orders')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <div className="py-10">Loading orders...</div>
  if (error) return <div className="py-10 text-red-600">{error}</div>

  return (
    <div className="py-10">
      <h2 className="text-2xl font-semibold mb-6">My Orders</h2>

      {orders.length === 0 ? (
        <div>No orders yet.</div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order._id} className="border p-5">
              <div className="flex justify-between gap-4 flex-wrap border-b pb-3 mb-3">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">{order._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{order.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">₹{order.amount}</p>
                </div>
              </div>

              <div className="space-y-3">
                {(order.items || []).map((item, i) => (
                  <div key={`${order._id}-${i}`} className="flex items-center gap-4">
                    <img src={item.image || 'https://placehold.co/80x80?text=Item'} alt={item.name} className="w-16 h-16 object-cover border" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity} • Size: {item.size || 'N/A'}</p>
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

export default Orders
