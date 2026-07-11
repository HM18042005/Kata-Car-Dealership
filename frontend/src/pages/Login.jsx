import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { loading, error, execute } = useApi("/api/auth/login", { method: "POST" });

  useEffect(() => {
    if (token) navigate("/", { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await execute({ body: { email, password } });
      if (data?.access_token) {
        login(data.access_token);
        navigate("/", { replace: true });
      }
    } catch {
      // error state is already set by useApi; nothing else to do here
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <img src="/svgs/logo.svg" alt="" aria-hidden="true" className="w-10 h-10 text-slate-900" />
        <span className="font-extrabold text-2xl text-slate-900 tracking-tight">Kata Motors</span>
      </div>
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-teal-50 rounded-full">
            <img src="/svgs/login.svg" alt="" aria-hidden="true" className="w-8 h-8" style={{ filter: "invert(30%) sepia(80%) saturate(2000%) hue-rotate(150deg)" }} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Welcome Back</h1>
        <p className="text-center text-slate-500 mb-8 font-medium">Sign in to manage your inventory</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 text-slate-900 transition-shadow"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              required
              aria-describedby={error ? "password-error" : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus-visible:ring-2 text-slate-900 transition-shadow ${error ? "border-red-600 focus-visible:ring-red-600" : "border-slate-200 focus-visible:ring-teal-600"}`}
            />
            {error && (
              <p id="password-error" role="alert" className="text-red-600 text-sm mt-2 flex items-center gap-1.5 font-medium">
                <img src="/svgs/alert-circle.svg" alt="" aria-hidden="true" className="w-4 h-4" style={{ filter: "invert(20%) sepia(90%) saturate(3000%) hue-rotate(350deg)" }} />
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? <img src="/svgs/spinner.svg" alt="" aria-hidden="true" className="w-5 h-5 animate-spin invert" /> : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-8">
          Don't have an account? <Link to="/register" className="text-teal-600 font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </main>
  );
}
