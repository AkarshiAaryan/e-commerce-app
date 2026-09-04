import { useState, useRef } from 'react'

const AdminAdd = () => {
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Men', subCategory: 'Topwear', sizes: [], bestSeller: false })
  const [images, setImages] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const fileRef = useRef()

  const handleFile = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length + previewUrls.length > 4) {
      alert('Maximum 4 images allowed')
      return
    }
    setImages((prev) => [...prev, ...files])
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviewUrls((prev) => [...prev, ...urls])
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    if (!form.name || !form.description || !form.price) return setMessage('Please fill required fields')
    if (images.length === 0) return setMessage('At least one image required')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('description', form.description)
      fd.append('price', form.price)
      fd.append('category', form.category)
      fd.append('subCategory', form.subCategory)
      fd.append('sizes', form.sizes.join(','))
      fd.append('bestSeller', form.bestSeller ? 'true' : 'false')
      images.forEach((f) => fd.append('images', f))

      const token = localStorage.getItem('adminToken')
      const res = await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:5000/api') + '/product/add', {
        method: 'POST',
        headers: token ? { Authorization: 'Bearer ' + token } : {},
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')
      setMessage('Product added')
      setForm({ name: '', description: '', price: '', category: 'Men', subCategory: 'Topwear', sizes: [], bestSeller: false })
      setImages([])
      setPreviewUrls([])
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setMessage(err.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleSize = (s) => {
    setForm((prev) => ({ ...prev, sizes: prev.sizes.includes(s) ? prev.sizes.filter(x => x !== s) : [...prev.sizes, s] }))
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h2 className="text-2xl font-semibold mb-4">Add Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Name" className="border p-3 w-full" required />
        <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Description" className="border p-3 w-full" required />
        <input value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} placeholder="Price" type="number" step="0.01" className="border p-3 w-full" required />

        <div className="flex gap-4">
          <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="border p-2">
            <option>Men</option>
            <option>Women</option>
            <option>Kids</option>
          </select>
          <select value={form.subCategory} onChange={(e) => setForm({...form, subCategory: e.target.value})} className="border p-2">
            <option>Topwear</option>
            <option>Bottomwear</option>
            <option>Winterwear</option>
          </select>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.bestSeller} onChange={(e) => setForm({...form, bestSeller: e.target.checked})} /> Best Seller</label>
        </div>

        <div>
          <p className="mb-2">Sizes</p>
          <div className="flex gap-2">
            {['S','M','L','XL','XXL'].map(s => (
              <button key={s} type="button" onClick={() => toggleSize(s)} className={`px-3 py-1 border ${form.sizes.includes(s) ? 'bg-black text-white' : ''}`}>{s}</button>
            ))}
          </div>
        </div>

        <div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFile} />
          <div className="flex gap-2 mt-3">
            {previewUrls.map((u, i) => (
              <div key={i} className="relative">
                <img src={u} alt={`preview-${i}`} className="w-24 h-24 object-cover border" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-0 right-0 bg-red-600 text-white px-1">x</button>
              </div>
            ))}
          </div>
        </div>

        {message && <div className="text-sm text-gray-700">{message}</div>}

        <button disabled={loading} type="submit" className="bg-black text-white px-5 py-3">{loading ? 'Adding...' : 'Add Product'}</button>
      </form>
    </div>
  )
}

export default AdminAdd
