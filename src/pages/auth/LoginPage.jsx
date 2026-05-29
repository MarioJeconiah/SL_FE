import { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";

export default function LoginPage({ role, setPage }) {
  const { customers, setCurrentUser } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email wajib diisi";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Format email tidak valid";
    if (!password) e.password = "Password wajib diisi";
    else if (password.length < 6) e.password = "Password minimal 6 karakter";
    return e;
  };

  const handleLogin = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setApiError(""); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user = customers.find(c => c.email === email && c.password === password && c.role === role);
      if (!user) { setApiError("Email atau password salah."); return; }
      setCurrentUser(user);
      setPage(role === "admin" ? "admin-dashboard" : "user-dashboard");
    }, 800);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">{role === "admin" ? "🛡️" : "👕"}</div>
        <h2 className="auth-title">Masuk {role === "admin" ? "Admin" : "User"}</h2>
        <p className="auth-sub">Silakan masuk ke akun Anda</p>
        {role === "user" && <div className="alert alert-info" style={{ fontSize: 12 }}>Demo — Email: <b>ahmad@example.com</b> / Pass: <b>123456</b></div>}
        {role === "admin" && <div className="alert alert-info" style={{ fontSize: 12 }}>Demo — Email: <b>admin@laundryhub.com</b> / Pass: <b>admin123</b></div>}
        {apiError && <div className="alert alert-error">{apiError}</div>}
        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: "" })); }} />
          {errors.email && <div className="err">{errors.email}</div>}
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" placeholder="Masukkan password" value={password} onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: "" })); }} />
          {errors.password && <div className="err">{errors.password}</div>}
        </div>
        <button className="btn-primary full" onClick={handleLogin} disabled={loading}>{loading ? "Memproses…" : "Masuk"}</button>
        {role === "user" && <div className="auth-link">Belum punya akun? <button onClick={() => setPage("register")}>Daftar sekarang</button></div>}
        <div className="auth-link"><button onClick={() => setPage("role")}>← Kembali</button></div>
      </div>
    </div>
  );
}