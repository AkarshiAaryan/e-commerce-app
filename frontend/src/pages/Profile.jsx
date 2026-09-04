import { useEffect, useState } from 'react'
import { apiPost } from '../utils/api'

const Profile = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiPost('/user/me', {})
        setForm((prev) => ({ ...prev, name: res.user?.name || '', email: res.user?.email || '' }))
      } catch (err) {
        setError(err.message || 'Unable to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const payload = { name: form.name, email: form.email }
      if (form.password.trim()) payload.password = form.password

      const res = await apiPost('/user/profile', payload)
      setSuccess('Profile updated successfully')
      setForm((prev) => ({ ...prev, password: '' }))
      if (res.user?.name) setForm((prev) => ({ ...prev, name: res.user.name, email: res.user.email }))
    } catch (err) {
      setError(err.message || 'Unable to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="py-10">Loading profile...</div>

  return (
    <div className="py-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-900">My Profile</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-3 w-full" required />
        <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Email" className="border p-3 w-full" required />
        <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="New password" className="border p-3 w-full" />

        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}

        <button type="submit" disabled={saving} className="bg-black text-white px-6 py-3 disabled:opacity-60">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}

export default Profile
