import { Navigate } from 'react-router-dom'

const AdminRoute = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
  if (!token) return <Navigate to="/admin/login" replace />
  return children
}

export default AdminRoute
