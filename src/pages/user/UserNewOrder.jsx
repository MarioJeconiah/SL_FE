import { useState, useContext } from "react";
import Sidebar from "../../components/common/Sidebar";
import { formatRp, today, addDays } from "../../utils/helper";
import { AppContext } from "../../context/AppContext";

export default function UserNewOrder({ setPage }) {
  const { services, setOrders, currentUser } = useContext(AppContext);
  const [form, setForm] = useState({ serviceId: "", weight: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const upd = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(v => ({ ...v, [k]: "" })); };

  const selectedService = services.find(s => s.id === Number(form.serviceId));
  const total = selectedService && form.weight ? selectedService.price * Number(form.weight) : 0;

  const validate = () => {
    const e = {};
    if (!form.serviceId) e.serviceId = "Pilih layanan";
    if (!form.weight) e.weight = "Berat wajib diisi";
    else if (isNaN(form.weight) || Number(form.weight) <= 0) e.weight = "Berat harus angka positif";
    else if (Number(form.weight) > 50) e.weight = "Berat maksimal 50 kg";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const svc = services.find(s => s.id === Number(form.serviceId));
    const newOrder = {
      id: Date.now(),
      customerId: currentUser.id,
      customerName: currentUser.name,
      bagNumber: currentUser.bagNumber,
      serviceId: svc.id,
      serviceName: svc.name,
      weight: Number(form.weight),
      totalPrice: svc.price * Number(form.weight),
      status: "Menunggu",
      paymentStatus: "Belum Bayar",
      createdAt: today(),
      estimatedDone: addDays(today(), parseInt(svc.duration)),
      notes: form.notes,
    };
    setOrders(prev => [...prev, newOrder]);
    setSuccess("Pesanan berhasil dibuat!");
    setForm({ serviceId: "", weight: "", notes: "" });
    setTimeout(() => { setSuccess(""); setPage("user-orders"); }, 1500);
  };

  return (
    <div className="layout">
      <Sidebar active="user-new-order" setPage={setPage} role="user" />
      <div className="main">
        <div className="page-title">Buat Pesanan</div>
        <div className="page-sub">Ajukan laundry baru Anda</div>
        {success && <div className="alert alert-success">{success}</div>}
        <div className="card" style={{ maxWidth: 520 }}>
          <div className="field">
            <label>Layanan</label>
            <select value={form.serviceId} onChange={upd("serviceId")}>
              <option value="">-- Pilih Layanan --</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} — {formatRp(s.price)}/{s.unit} ({s.duration})</option>)}
            </select>
            {errors.serviceId && <div className="err">{errors.serviceId}</div>}
          </div>
          <div className="field">
            <label>Berat (kg)</label>
            <input type="number" placeholder="Contoh: 3" min="0.1" max="50" step="0.1" value={form.weight} onChange={upd("weight")} />
            {errors.weight && <div className="err">{errors.weight}</div>}
          </div>
          <div className="field">
            <label>Catatan (opsional)</label>
            <textarea placeholder="Pisahkan baju putih, dll." value={form.notes} onChange={upd("notes")} />
          </div>
          {total > 0 && (
            <div style={{ background: "#eff6ff", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#4b5563" }}>Estimasi Total</span>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: "#2563eb" }}>{formatRp(total)}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-secondary" onClick={() => setPage("user-dashboard")}>Batal</button>
            <button className="btn-primary" onClick={handleSubmit}>Buat Pesanan</button>
          </div>
        </div>
      </div>
    </div>
  );
}