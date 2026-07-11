import { Routes, Route } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
      <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
