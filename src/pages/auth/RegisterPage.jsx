import { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";

export default function RegisterPage({ setPage }) {
  const { setCustomers } = useContext(AppContext);
  const [form, setForm] = useState({ name: "", email: "", phone: "", room: "", building: "", bag: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const upd = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(v => ({ ...v, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    if (!form.email.trim()) e.email = "Email wajib diisi";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Format email tidak valid";
    if (!form.phone.trim()) e.phone = "Nomor HP wajib diisi";
    if (!form.room.trim()) e.room = "Nomor kamar wajib diisi";
    if (!form.building.trim()) e.building = "Nama gedung wajib diisi";
    if (!form.bag.trim()) e.bag = "Nomor tas wajib diisi";
    if (!form.password) e.password = "Password wajib diisi";
    else if (form.password.length < 6) e.password = "Password minimal 6 karakter";
    if (form.password !== form.confirm) e.confirm = "Password tidak cocok";
    return e;
  };

  const handleRegister = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCustomers(prev => [...prev, {
        id: Date.now(),
        name: form.name,
        email: form.email,
        phone: form.phone,
        room: form.room,
        building: form.building,
        bagNumber: form.bag,
        password: form.password,
        role: "user"
      }]);
      setSuccess("Registrasi berhasil! Silakan masuk.");
      setTimeout(() => setPage("login-user"), 1500);
    }, 900);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">👕</div>
        <h2 className="auth-title">Buat Akun</h2>
        <p className="auth-sub">Bergabung dengan layanan laundry kami</p>
        {success && <div className="alert alert-success">{success}</div>}
        <div className="two-col">
          <div className="field"><label>Nama Lengkap</label><input placeholder="Ahmad Rizky" value={form.name} onChange={upd("name")} />{errors.name && <div className="err">{errors.name}</div>}</div>
          <div className="field"><label>Email</label><input type="email" placeholder="you@example.com" value={form.email} onChange={upd("email")} />{errors.email && <div className="err">{errors.email}</div>}</div>
          <div className="field"><label>No. HP</label><input placeholder="08123456789" value={form.phone} onChange={upd("phone")} />{errors.phone && <div className="err">{errors.phone}</div>}</div>
          <div className="field"><label>No. Kamar</label><input placeholder="B-204" value={form.room} onChange={upd("room")} />{errors.room && <div className="err">{errors.room}</div>}</div>
          <div className="field"><label>No. Tas</label><input placeholder="#247" value={form.bag} onChange={upd("bag")} />{errors.bag && <div className="err">{errors.bag}</div>}</div>
          <div className="field"><label>Gedung</label><input placeholder="Boys Hostel" value={form.building} onChange={upd("building")} />{errors.building && <div className="err">{errors.building}</div>}</div>
          <div className="field"><label>Password</label><input type="password" placeholder="Min. 6 karakter" value={form.password} onChange={upd("password")} />{errors.password && <div className="err">{errors.password}</div>}</div>
          <div className="field"><label>Konfirmasi Password</label><input type="password" placeholder="Ulangi password" value={form.confirm} onChange={upd("confirm")} />{errors.confirm && <div className="err">{errors.confirm}</div>}</div>
        </div>
        <button className="btn-primary full" onClick={handleRegister} disabled={loading}>{loading ? "Mendaftarkan…" : "Buat Akun"}</button>
        <div className="auth-link"><button onClick={() => setPage("login-user")}>← Kembali ke login</button></div>
      </div>
    </div>
  );
}