import { useState } from 'react'
import { useShop } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../utils/api'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { syncLocalCartToServer } = useShop()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await apiPost('/user/login', { email, password })
      if (res && res.token) {
        localStorage.setItem('token', res.token)
        try { await syncLocalCartToServer() } catch (e) { }
        navigate('/')
      } else {
        setError('Login failed')
      }
    } catch (err) {
      setError(err.message || 'Login error')
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h2 className="text-2xl mb-4">Login</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="p-2 border" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="p-2 border" />
        <button className="p-2 bg-black text-white">Login</button>
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  )
}

export default Login
