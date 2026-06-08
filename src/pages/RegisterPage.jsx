import { useState } from "react";
import { register as apiRegister } from "../services/authService";

export function RegisterPage({ setPage }) {
  const [form, setForm] = useState({
    businessName: "",
    ownerUsername: "",
    ownerPassword: "",
    ownerFullName: "",
    ownerConfirm: "",
    employeeUsername: "",
    employeePassword: "",
    employeeFullName: "",
    confirm: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const upd = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(v => ({ ...v, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.businessName.trim()) e.businessName = "Nama bisnis wajib diisi";
    if (!form.ownerUsername.trim()) e.ownerUsername = "Username pemilik wajib diisi";
    if (!form.ownerPassword) e.ownerPassword = "Password pemilik wajib diisi";
    else if (form.ownerPassword.length < 6) e.ownerPassword = "Password minimal 6 karakter";
    if (!form.ownerFullName.trim()) e.ownerFullName = "Nama lengkap pemilik wajib diisi";
    if (form.ownerPassword && form.ownerConfirm && form.ownerPassword !== form.ownerConfirm) e.ownerConfirm = "Konfirmasi password pemilik tidak cocok";
    if (!form.employeeUsername.trim()) e.employeeUsername = "Username karyawan wajib diisi";
    if (!form.employeePassword) e.employeePassword = "Password karyawan wajib diisi";
    else if (form.employeePassword.length < 6) e.employeePassword = "Password minimal 6 karakter";
    if (!form.employeeFullName.trim()) e.employeeFullName = "Nama lengkap karyawan wajib diisi";
    if (form.employeePassword && form.confirm && form.employeePassword !== form.confirm) e.confirm = "Konfirmasi password karyawan tidak cocok";
    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      await apiRegister({
        businessName: form.businessName,
        ownerUsername: form.ownerUsername,
        ownerPassword: form.ownerPassword,
        ownerFullName: form.ownerFullName,
        employeeUsername: form.employeeUsername,
        employeePassword: form.employeePassword,
        employeeFullName: form.employeeFullName,
      });
      setSuccess("Registrasi berhasil! Silakan login.");
      setTimeout(() => setPage("login"), 1500);
    } catch (err) {
      setErrors({ businessName: err?.response?.data?.message || "Registrasi gagal. Coba lagi." });
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
        <div className="auth-left-title">Daftarkan<br />Bisnis Anda</div>
        <div className="auth-left-sub">Sistem Manajemen Laundry</div>
        <div className="auth-left-desc">Buat akun bisnis laundry Anda dan mulai kelola pesanan, pelanggan, dan laporan dalam satu platform.</div>
      </div>
      <div className="auth-right" style={{ width: 520 }}>
        <div className="auth-card" style={{ maxWidth: 460 }}>
          <h2 className="auth-title">Buat Akun</h2>
          <p className="auth-sub">Siapkan bisnis laundry Anda</p>
          {success && <div className="alert alert-success">{success}</div>}
          <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--hairline)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--steel)", textTransform: "uppercase", marginBottom: 12 }}>Informasi Bisnis</div>
            <div className="field"><label>Nama Bisnis</label><input placeholder="Laundry ABC" value={form.businessName} onChange={upd("businessName")} />{errors.businessName && <div className="err">{errors.businessName}</div>}</div>
          </div>
          <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--hairline)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--steel)", textTransform: "uppercase", marginBottom: 12 }}>Akun Pemilik</div>
            <div className="two-col">
              <div className="field"><label>Username</label><input placeholder="owner123" autoComplete="off" value={form.ownerUsername} onChange={upd("ownerUsername")} />{errors.ownerUsername && <div className="err">{errors.ownerUsername}</div>}</div>
              <div className="field"><label>Nama Lengkap</label><input placeholder="Ahmad Rizky" value={form.ownerFullName} onChange={upd("ownerFullName")} />{errors.ownerFullName && <div className="err">{errors.ownerFullName}</div>}</div>
              <div className="field"><label>Password</label><input type="password" placeholder="Min. 6 karakter" autoComplete="new-password" value={form.ownerPassword} onChange={upd("ownerPassword")} />{errors.ownerPassword && <div className="err">{errors.ownerPassword}</div>}</div>
              <div className="field"><label>Konfirmasi Password</label><input type="password" placeholder="Ulangi password pemilik" autoComplete="new-password" value={form.ownerConfirm} onChange={upd("ownerConfirm")} />{errors.ownerConfirm && <div className="err">{errors.ownerConfirm}</div>}</div>
            </div>
          </div>
          <div style={{ marginBottom: 16, paddingBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--steel)", textTransform: "uppercase", marginBottom: 12 }}>Akun Karyawan</div>
            <div className="two-col">
              <div className="field"><label>Username</label><input placeholder="employee123" autoComplete="off" value={form.employeeUsername} onChange={upd("employeeUsername")} />{errors.employeeUsername && <div className="err">{errors.employeeUsername}</div>}</div>
              <div className="field"><label>Nama Lengkap</label><input placeholder="Budi Santoso" value={form.employeeFullName} onChange={upd("employeeFullName")} />{errors.employeeFullName && <div className="err">{errors.employeeFullName}</div>}</div>
              <div className="field"><label>Password</label><input type="password" placeholder="Min. 6 karakter" autoComplete="new-password" value={form.employeePassword} onChange={upd("employeePassword")} />{errors.employeePassword && <div className="err">{errors.employeePassword}</div>}</div>
              <div className="field"><label>Konfirmasi Password</label><input type="password" placeholder="Ulangi password karyawan" autoComplete="new-password" value={form.confirm} onChange={upd("confirm")} />{errors.confirm && <div className="err">{errors.confirm}</div>}</div>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={handleRegister} disabled={loading}>
            {loading ? "Mendaftar…" : "register"}
          </button>
          <div className="auth-link-row">Sudah punya akun? <button onClick={() => setPage("login")}>login</button></div>
        </div>
      </div>
    </div>
  );
}