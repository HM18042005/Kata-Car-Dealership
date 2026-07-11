import { Routes, Route } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'

// Placeholder imports for pages
const Login = () => <div className="animate-fade-in p-4">Login Page</div>
const Register = () => <div className="animate-fade-in p-4">Register Page</div>
const Dashboard = () => <div className="animate-fade-in p-4">Dashboard</div>
const Admin = () => <div className="animate-fade-in p-4">Admin Panel</div>
const NotFound = () => <div className="animate-fade-in p-4">404 Not Found</div>

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
