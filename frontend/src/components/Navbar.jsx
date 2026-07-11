import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 flex justify-between items-center shadow-sm">
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" aria-label="Go to dashboard">
        <img src="/svgs/logo.svg" alt="" aria-hidden="true" className="w-8 h-8" />
        <span className="font-bold text-xl text-slate-900 tracking-tight">Kata Motors</span>
      </Link>
      
      <div className="flex items-center gap-6">
        {user ? (
          <>
            {user.role === "admin" && (
              <Link to="/admin" className="flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors">
                <img src="/svgs/shield.svg" alt="" aria-hidden="true" className="w-5 h-5" />
                Admin
              </Link>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              <img src="/svgs/logout.svg" alt="" aria-hidden="true" className="w-5 h-5" />
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            <img src="/svgs/login.svg" alt="" aria-hidden="true" className="w-5 h-5" />
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
