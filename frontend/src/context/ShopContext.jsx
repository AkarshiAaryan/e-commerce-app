import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { apiGet, apiPost } from '../utils/api'

const ShopContext = createContext(null)
const STORAGE_KEY = 'shop_cart'

const readCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    return []
  }
}

export const ShopContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(readCart)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
    // If user is authenticated, persist cart to server (best-effort)
    const token = localStorage.getItem('token')
    if (token) {
      ;(async () => {
        try {
          await apiPost('/user/cart', { cartData: cartItems })
        } catch (err) {
          console.warn('Failed to sync cart to server', err)
        }
      })()
    }
  }, [cartItems])

  const addToCart = (product, size = '', quantity = 1) => {
    if (!product || !product._id) return

    const productId = product._id
    const normalizedSize = size || product.sizes?.[0] || ''

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === productId && item.size === normalizedSize
      )

      if (existingIndex >= 0) {
        return prev.map((item, index) => {
          if (index === existingIndex) {
            return { ...item, quantity: item.quantity + quantity }
          }
          return item
        })
      }

      const next = [
        ...prev,
        {
          productId,
          name: product.name,
          price: Number(product.price) || 0,
          image: Array.isArray(product.images) ? product.images[0] : Array.isArray(product.image) ? product.image[0] : '',
          size: normalizedSize,
          quantity: Number(quantity) || 1,
        },
      ]
      return next
    })
    toast.success('Product added to cart')
  }

  const updateQuantity = (productId, size, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId && item.size === size) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId, size) => {
    setCartItems((prev) => prev.filter((item) => !(item.productId === productId && item.size === size)))
  }

  const clearCart = () => setCartItems([])

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cartItems]
  )

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [cartItems]
  )

  // Sync local cart with server-side cart on login
  const syncLocalCartToServer = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      setSyncing(true)
      const serverRes = await apiGet('/user/cart')
      const serverCart = (serverRes && serverRes.cartData) || []
      const local = readCart()
      // merge local and server carts by productId+size, summing quantities
      const map = new Map()
      const pushItem = (it) => {
        const key = `${it.productId}__${it.size || ''}`
        const existing = map.get(key) || { ...it }
        existing.quantity = (existing.quantity || 0) + Number(it.quantity || 0)
        map.set(key, existing)
      }
      local.forEach(pushItem)
      serverCart.forEach(pushItem)
      const merged = Array.from(map.values())
      setCartItems(merged)
      // persist merged cart to server
      await apiPost('/user/cart', { cartData: merged })
      toast.success('Cart synced')
    } catch (err) {
      console.warn('Sync error', err)
    } finally {
      setSyncing(false)
    }
  }

  const logout = async () => {
    try {
      // persist current cart to server if token present
      const token = localStorage.getItem('token')
      if (token) {
        await apiPost('/user/cart', { cartData: cartItems })
      }
    } catch (err) {
      console.warn('Failed to persist cart on logout', err)
    }
    localStorage.removeItem('token')
    setCartItems([])
    toast.info('Logged out')
    // also remove adminToken if present
    localStorage.removeItem('adminToken')
  }

  return (
    <ShopContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        syncLocalCartToServer,
        logout,
        syncing,
      }}
    >
      {children}
    </ShopContext.Provider>
  )
}

export const useShop = () => {
  const context = useContext(ShopContext)
  if (!context) {
    throw new Error('useShop must be used within a ShopContextProvider')
  }
  return context
}
