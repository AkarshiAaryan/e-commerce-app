import { Link, useNavigate } from 'react-router-dom'
import { useShop } from '../context/ShopContext'

const Cart = () => {
  const navigate = useNavigate()
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useShop()

  if (!cartItems.length) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <Link to="/collection" className="inline-block mt-6 text-blue-600">Continue shopping</Link>
      </div>
    )
  }

  return (
    <div className="py-10">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex gap-4 border p-4 rounded">
              <img src={item.image} alt={item.name} className="w-28 h-28 object-cover" />
              <div className="flex-1">
                <h3 className="font-medium text-lg">{item.name}</h3>
                <p className="text-sm text-gray-600">Size: {item.size || 'N/A'}</p>
                <p className="mt-2">₹{item.price}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex border">
                    <button type="button" className="px-2 py-1" onClick={() => updateQuantity(item.productId, item.size, -1)}>-</button>
                    <span className="px-3 py-1">{item.quantity}</span>
                    <button type="button" className="px-2 py-1" onClick={() => updateQuantity(item.productId, item.size, 1)}>+</button>
                  </div>
                  <button type="button" className="text-red-600" onClick={() => removeFromCart(item.productId, item.size)}>Remove</button>
                </div>
              </div>
              <div className="font-medium">₹{item.price * item.quantity}</div>
            </div>
          ))}
        </div>

        <div className="border p-5 h-fit">
          <h3 className="text-xl font-semibold">Order Summary</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{cartTotal}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
            <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>₹{cartTotal}</span></div>
          </div>
          <button type="button" onClick={() => navigate('/place-order')} className="mt-6 w-full bg-black text-white py-3">
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart
