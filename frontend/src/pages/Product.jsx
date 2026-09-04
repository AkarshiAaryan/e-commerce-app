import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiPost } from '../utils/api'
import { useShop } from '../context/ShopContext'
import { toast } from 'react-toastify'

const Product = () => {
  const { productId } = useParams()
  const { addToCart } = useShop()
  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiPost('/product/single', { id: productId })
        setProduct(res.product)
        if (res.product?.sizes?.length) setSelectedSize(res.product.sizes[0])
      } catch (err) {
        setError(err.message || 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (productId) load()
  }, [productId])

  // related products
  const [related, setRelated] = useState([])
  useEffect(() => {
    const loadRelated = async () => {
      try {
        if (!product) return
        const res = await apiPost('/product/list', { category: product.category, subCategory: product.subCategory })
        const list = (res && res.products) || []
        const filtered = list.filter((p) => p._id !== product._id).slice(0, 5)
        setRelated(filtered)
      } catch (err) {
        // ignore
      }
    }
    loadRelated()
  }, [product])

  if (loading) return <div className="py-10">Loading product...</div>
  if (error) return <div className="py-10 text-red-600">{error}</div>
  if (!product) return <div className="py-10">Product not found</div>

  const images = Array.isArray(product.images) && product.images.length ? product.images : ['https://placehold.co/600x600?text=No+Image']

  return (
    <div className="py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <img src={images[0]} alt={product.name} className="w-full h-[500px] object-cover border" />
          <div className="flex gap-3 mt-4 overflow-x-auto">
            {images.map((img, index) => (
              <img key={index} src={img} alt={`${product.name} ${index + 1}`} className="w-20 h-20 object-cover border" />
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <p className="text-sm uppercase text-gray-500">{product.category}</p>
          <h1 className="text-3xl font-semibold mt-2">{product.name}</h1>
          <p className="text-2xl mt-4">₹{product.price}</p>

          <div className="mt-6">
            <p className="font-medium mb-2">Select Size</p>
            <div className="flex gap-2 flex-wrap">
              {(product.sizes || []).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`border px-3 py-2 text-sm ${selectedSize === size ? 'bg-black text-white' : 'bg-white text-black'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex border">
              <button type="button" className="px-3 py-2" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
              <span className="px-3 py-2 min-w-[50px] text-center">{quantity}</span>
              <button type="button" className="px-3 py-2" onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!selectedSize && (product.sizes || []).length) {
                  toast.error('Please select a size')
                  return
                }
                addToCart(product, selectedSize, quantity)
              }}
              className="bg-black text-white px-6 py-3"
            >
              Add to cart
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p className="font-medium text-gray-800">Description</p>
            <p className="mt-2">{product.description}</p>
          </div>

          <div className="mt-6">
            <Link to="/collection" className="text-sm text-blue-600">← Continue shopping</Link>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Related products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <div key={p._id} className="border p-2">
                <img src={p.images && p.images[0]} alt={p.name} className="w-full h-36 object-cover mb-2" />
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-sm">₹{p.price}</p>
                <Link to={`/product/${p._id}`} className="text-blue-600 text-sm">View</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Product
