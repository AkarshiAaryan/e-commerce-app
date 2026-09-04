import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { apiPost } from '../utils/api'
import { useShop } from '../context/ShopContext'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clearCart } = useShop()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const orderId = searchParams.get('orderId')
    if (!sessionId || !orderId) {
      setError('Missing payment identifiers')
      setLoading(false)
      return
    }

    const verify = async () => {
      try {
        const res = await apiPost('/order/verifyStripe', { sessionId, orderId })
        if (res && res.success) {
          clearCart()
          navigate('/orders')
        } else {
          setError((res && res.message) || 'Payment verification failed')
        }
      } catch (err) {
        setError(err.message || 'Verification error')
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [])

  if (loading) return <div className="py-10">Verifying payment...</div>
  if (error) return <div className="py-10 text-red-600">{error}</div>
  return null
}

export default PaymentSuccess
