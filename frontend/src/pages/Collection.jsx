import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiPost } from '../utils/api'

const Collection = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiPost('/product/list', {})
        if (res && res.products) setProducts(res.products)
      } catch (err) {
        setError(err.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div>Loading products...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-6">
      {products.length === 0 && <div>No products yet</div>}
      {products.map(p => (
        <div key={p._id} className="border p-3">
          <img src={p.images && p.images[0]} alt={p.name} className="h-40 w-full object-cover mb-2" />
          <h3 className="font-medium">{p.name}</h3>
          <p className="text-sm text-gray-600">${p.price}</p>
          <Link to={`/product/${p._id}`} className="text-blue-600">View</Link>
        </div>
      ))}
    </div>
  )
}

export default Collection
