import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { apiPost } from '../utils/api'

const Collection = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryFilter, setCategoryFilter] = useState([])
  const [subFilter, setSubFilter] = useState([])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('relevant')

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

  // Derived filtered list
  const filtered = useMemo(() => {
    let out = products.slice()
    if (categoryFilter.length) out = out.filter(p => categoryFilter.includes(p.category))
    if (subFilter.length) out = out.filter(p => subFilter.includes(p.subCategory))
    if (query && query.trim()) {
      const q = query.trim().toLowerCase()
      out = out.filter(p => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))
    }
    if (sort === 'low-high') out.sort((a,b) => a.price - b.price)
    if (sort === 'high-low') out.sort((a,b) => b.price - a.price)
    return out
  }, [products, categoryFilter, subFilter, query, sort])

  // search debounce
  const debounce = (fn, ms = 300) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) } }
  const onQueryChange = useCallback(debounce((v) => setQuery(v), 300), [])

  if (loading) return <div>Loading products...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-6">
      {filtered.length === 0 && <div>No products found</div>}
      {filtered.map(p => (
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
