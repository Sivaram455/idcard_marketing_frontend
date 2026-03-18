import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../auth/authService";
import { useAuth } from "../auth/AuthContext";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      const role = user.role;
      if (role === "admin" || role === "GMMC_ADMIN") navigate("/admin-portal");
      else if (role === "SUPPORT" || role === "DEVELOPER") navigate("/ticketing");
      else if (role === "marketer" || role === "agent") navigate("/marketing");
      else if (role === "printer" || role === "PRINTER") navigate("/idcard/requests");
      else navigate("/idcard/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      if (!result.success) {
        setError(result.message || "Invalid credentials.");
        return;
      }
      login(result.user);
      const role = result.user?.role;
      if (role === "admin" || role === "GMMC_ADMIN") navigate("/admin-portal");
      else if (role === "SUPPORT" || role === "DEVELOPER") navigate("/ticketing");
      else if (role === "marketer" || role === "agent") navigate("/marketing");
      else if (role === "printer" || role === "PRINTER") navigate("/idcard/requests");
      else navigate("/idcard/dashboard");
    } catch {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 antialiased">
      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 mb-6">
            <Shield className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Please enter your details to continue.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-100 disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign in to portal"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
          Authorized personnel only. Secure connection.
        </p>
      </div>
    </div>
  );
}