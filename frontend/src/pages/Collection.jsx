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
  const [searchInput, setSearchInput] = useState('')
  const [availableCategories, setAvailableCategories] = useState(['Men', 'Women', 'Kids'])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiPost('/product/list', {})
        if (res && res.products) setProducts(res.products)
        // fetch categories if backend provides
        try {
          const catRes = await apiPost('/product/categories', {})
          if (catRes && Array.isArray(catRes.categories) && catRes.categories.length) setAvailableCategories(catRes.categories)
        } catch (e) {}
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
    <div className="py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      <aside className="border p-4">
        <div className="mb-4">
          <input
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); onQueryChange(e.target.value) }}
            placeholder="Search products"
            className="w-full border p-2"
            aria-label="Search products"
          />
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Category</h4>
          {availableCategories.map((c) => (
            <label key={c} className="block text-sm">
              <input
                type="checkbox"
                checked={categoryFilter.includes(c)}
                onChange={() => setCategoryFilter((prev) => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                className="mr-2"
              />
              {c}
            </label>
          ))}
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Subcategory</h4>
          {['Topwear', 'Bottomwear', 'Winterwear'].map((s) => (
            <label key={s} className="block text-sm">
              <input
                type="checkbox"
                checked={subFilter.includes(s)}
                onChange={() => setSubFilter((prev) => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                className="mr-2"
              />
              {s}
            </label>
          ))}
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Sort</h4>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border p-2 w-full">
            <option value="relevant">Sort by Relevant</option>
            <option value="low-high">Sort by Low to High</option>
            <option value="high-low">Sort by High to Low</option>
          </select>
        </div>

        <div>
          <button onClick={() => { setCategoryFilter([]); setSubFilter([]); setSearchInput(''); setQuery(''); setSort('relevant') }} className="text-sm text-gray-600">Clear filters</button>
        </div>
      </aside>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.length === 0 && <div className="col-span-full">No products found</div>}
          {filtered.map(p => (
            <div key={p._id} className="border p-3">
              <img src={p.images && p.images[0]} alt={p.name} className="h-40 w-full object-cover mb-2" />
              <h3 className="font-medium">{p.name}</h3>
              <p className="text-sm text-gray-600">₹{p.price}</p>
              <Link to={`/product/${p._id}`} className="text-blue-600">View</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )

}