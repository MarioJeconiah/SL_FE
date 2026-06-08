import { useState } from "react";
import { login as apiLogin, saveAuth, getCurrentUser } from "../services/authService";
import { useApp } from "../hooks/useApp";

export function LoginPage({ setPage }) {
  const { setCurrentUser } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiErr, setApiErr] = useState("");

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Username wajib diisi";
    if (!password) e.password = "Password wajib diisi";
    else if (password.length < 6) e.password = "Password minimal 6 karakter";
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setApiErr("");
    setLoading(true);
    try {
      const res = await apiLogin({ username: email, password });
      saveAuth(res);
      const user = getCurrentUser();
      setCurrentUser(user);
      const role = (user.role || "").toUpperCase();
      setPage(role === "OWNER" || role === "ADMIN" ? "admin-dashboard" : "user-dashboard");
    } catch (err) {
      setApiErr(err?.response?.data?.message || "Username atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <span className="sidebar-logo-dot" style={{ width: 12, height: 12 }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--on-dark)" }}>SmartLaundry</span>
        </div>
        <div className="auth-left-title">Laundry Management<br />System</div>
        <div className="auth-left-sub">One platform. Unlimited laundry operations.</div>
        <div className="auth-left-desc">Manage customers, transactions, services &amp; reports in one place.</div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-title">Selamat Datang</h2>
          <p className="auth-sub">Masuk untuk melanjutkan</p>
          {apiErr && <div className="alert alert-error">{apiErr}</div>}
          <div autoComplete="off">
            <input type="text" name="fakeusernameremembered" style={{ display: "none" }} readOnly autoComplete="username" />
            <input type="password" name="fakepasswordremembered" style={{ display: "none" }} readOnly autoComplete="new-password" />
            <div className="field">
              <label>Username</label>
              <input type="text" placeholder="Masukkan username" value={email} autoComplete="off" name="smartlaundry-user" onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: "" })); }} />
              {errors.email && <div className="err">{errors.email}</div>}
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="Masukkan password" value={password} autoComplete="new-password" name="smartlaundry-pass" onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: "" })); }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
              {errors.password && <div className="err">{errors.password}</div>}
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={handleLogin} disabled={loading}>
            {loading ? "Masuk…" : "login"}
          </button>
          <div className="auth-link-row">Belum punya akun? <button onClick={() => setPage("register")}>Register</button></div>
        </div>
      </div>
    </div>
  );
}