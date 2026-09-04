import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { apiPost } from '../utils/api'

const PaymentCancel = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    // Optionally notify backend to cancel pending order or leave as pending
    // For now just navigate to orders with a message
    navigate('/orders')
  }, [])

  return <div className="py-10">Payment canceled. Redirecting to orders...</div>
}

export default PaymentCancel
