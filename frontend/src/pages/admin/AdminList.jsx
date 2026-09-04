import { useEffect, useState } from 'react'

const AdminList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:5000/api') + '/product/list', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed')
      setProducts(data.products || [])
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const remove = async (id) => {
    if (!confirm('Delete product?')) return
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:5000/api') + '/product/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed')
      alert('Deleted')
      load()
    } catch (err) {
      alert(err.message || 'Failed')
    }
  }

  if (loading) return <div className="py-10">Loading...</div>
  if (error) return <div className="py-10 text-red-600">{error}</div>

  return (
    <div className="py-10">
      <h2 className="text-2xl font-semibold mb-4">Products</h2>
      {products.length === 0 ? <div>No products</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p._id} className="border p-3">
              <img src={p.images && p.images[0]} alt={p.name} className="w-full h-40 object-cover mb-2" />
              <h3 className="font-medium">{p.name}</h3>
              <p className="text-sm text-gray-600">₹{p.price}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => remove(p._id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminList
