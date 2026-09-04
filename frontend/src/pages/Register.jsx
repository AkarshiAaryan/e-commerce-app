import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../utils/api'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await apiPost('/user/register', { name, email, password })
      if (res && res.token) {
        localStorage.setItem('token', res.token)
        navigate('/')
      } else {
        setError('Registration failed')
      }
    } catch (err) {
      setError(err.message || 'Registration error')
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h2 className="text-2xl mb-4">Register</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="p-2 border" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="p-2 border" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="p-2 border" />
        <button className="p-2 bg-black text-white">Create account</button>
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  )
}

export default Register
