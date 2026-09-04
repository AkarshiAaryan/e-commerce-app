import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../utils/api'
import { useShop } from '../context/ShopContext'

const defaultForm = {
  firstName: '',
  lastName: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zipcode: '',
  phone: '',
}

const PlaceOrder = () => {
  const navigate = useNavigate()
  const { cartItems, cartTotal, clearCart } = useShop()
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!cartItems.length) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <button type="button" onClick={() => navigate('/collection')} className="mt-6 bg-black text-white px-5 py-3">
          Shop now
        </button>
      </div>
    )
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size || '',
        })),
        address: form,
        amount: cartTotal,
        paymentMethod: 'COD',
      }

      const res = await apiPost('/order/place', payload)
      if (res && res.success) {
        clearCart()
        navigate('/orders')
      }
    } catch (err) {
      setError(err.message || 'Unable to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-2xl font-semibold">Shipping details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" className="border p-3" required />
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" className="border p-3" required />
          </div>

          <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Email" className="border p-3 w-full" required />
          <input name="street" value={form.street} onChange={handleChange} placeholder="Street address" className="border p-3 w-full" required />

          <div className="grid gap-4 sm:grid-cols-3">
            <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="border p-3" required />
            <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="border p-3" required />
            <input name="zipcode" value={form.zipcode} onChange={handleChange} placeholder="ZIP code" className="border p-3" required />
          </div>

          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border p-3 w-full" required />

          {error && <div className="text-red-600">{error}</div>}

          <button type="submit" disabled={loading} className="bg-black text-white px-6 py-3 disabled:opacity-60">
            {loading ? 'Placing order...' : 'Place order'}
          </button>
        </form>

        <div className="border p-5 h-fit">
          <h3 className="text-xl font-semibold">Order summary</h3>
          <div className="mt-4 space-y-3">
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex justify-between gap-3 text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₹{cartTotal}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaceOrder
