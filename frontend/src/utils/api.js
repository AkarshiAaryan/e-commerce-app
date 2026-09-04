const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

async function apiFetch(path, opts = {}) {
  const url = API_BASE + path
  const headers = Object.assign({}, opts.headers || {}, { 'Content-Type': 'application/json' })
  const token = localStorage.getItem('token')
  if (token) headers['Authorization'] = 'Bearer ' + token
  const body = opts.body ? JSON.stringify(opts.body) : undefined
  const res = await fetch(url, { method: opts.method || 'POST', headers, body })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const err = new Error((data && data.message) || 'API error')
    err.response = data
    throw err
  }
  return data
}

export const apiPost = (path, body) => apiFetch(path, { method: 'POST', body })
export const apiGet = (path) => apiFetch(path, { method: 'GET' })

export default { apiPost, apiGet }
