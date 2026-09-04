import { createContext, useContext, useEffect, useMemo, useState } from 'react'

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
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

      return [
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
    })
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
