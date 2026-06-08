import { useState, useEffect } from "react";
import { getAllServices, createService, updateService, deleteService } from "../services/laundryService";
import { formatRp } from "../utils/helpers";
import { DashboardShell } from "../components/DashboardShell";
import { PageLoading } from "../components/PageLoading";
import { Modal } from "../components/Modal";
import { useApp } from "../hooks/useApp";

export function AdminServices({ setPage }) {
  const { services, setServices } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editSvc, setEditSvc] = useState(null);
  const [form, setForm] = useState({ serviceName: "", serviceType: "REGULAR", pricePerKg: "", estimatedHours: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const upd = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(v => ({ ...v, [k]: "" })); };

  useEffect(() => {
    getAllServices().then(data => setServices(Array.isArray(data) ? data : (data.content || []))).catch(console.error).finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.serviceName.trim()) e.serviceName = "Nama wajib diisi";
    if (!form.pricePerKg) e.pricePerKg = "Harga wajib diisi";
    else if (isNaN(form.pricePerKg) || Number(form.pricePerKg) <= 0) e.pricePerKg = "Harga harus angka positif";
    if (!form.estimatedHours) e.estimatedHours = "Durasi wajib diisi";
    else if (isNaN(form.estimatedHours) || Number(form.estimatedHours) <= 0) e.estimatedHours = "Durasi harus angka positif";
    return e;
  };

  const handleAdd = async () => {
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const created = await createService({ serviceName: form.serviceName, serviceType: form.serviceType, pricePerKg: Number(form.pricePerKg), estimatedHours: Number(form.estimatedHours) });
      setServices(p => [...p, created]);
      setForm({ serviceName: "", serviceType: "REGULAR", pricePerKg: "", estimatedHours: "" }); setErrors({}); setShowAdd(false);
    } catch (err) { setErrors({ serviceName: err?.response?.data?.message || "Gagal menyimpan layanan." }); }
    finally { setSaving(false); }
  };

  const openEdit = s => { setEditSvc(s); setForm({ serviceName: s.serviceName, serviceType: s.serviceType, pricePerKg: String(s.pricePerKg), estimatedHours: String(s.estimatedHours) }); setErrors({}); };

  const handleEdit = async () => {
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const updated = await updateService(editSvc.id, { serviceName: form.serviceName, serviceType: form.serviceType, pricePerKg: Number(form.pricePerKg), estimatedHours: Number(form.estimatedHours) });
      setServices(p => p.map(s => s.id === editSvc.id ? (updated || { ...s, ...form, pricePerKg: Number(form.pricePerKg), estimatedHours: Number(form.estimatedHours) }) : s));
      setEditSvc(null); setForm({ serviceName: "", serviceType: "REGULAR", pricePerKg: "", estimatedHours: "" });
    } catch (err) { setErrors({ serviceName: err?.response?.data?.message || "Gagal memperbarui layanan." }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await deleteService(id); setServices(p => p.filter(x => x.id !== id)); }
    catch (err) { console.error(err); }
  };

  const serviceFormFields = (
    <>
      <div className="field"><label>Nama Layanan</label><input placeholder="Cuci Reguler" value={form.serviceName} onChange={upd("serviceName")} />{errors.serviceName && <div className="err">{errors.serviceName}</div>}</div>
      <div className="two-col">
        <div className="field"><label>Tipe Layanan</label><select value={form.serviceType} onChange={upd("serviceType")}><option value="REGULAR">REGULAR</option><option value="EXPRESS">EXPRESS</option><option value="PREMIUM">PREMIUM</option></select></div>
        <div className="field"><label>Harga Per Kg (Rp)</label><input type="number" placeholder="7000" min="0" value={form.pricePerKg} onChange={upd("pricePerKg")} />{errors.pricePerKg && <div className="err">{errors.pricePerKg}</div>}</div>
      </div>
      <div className="field"><label>Estimasi Jam</label><input type="number" placeholder="3" min="1" value={form.estimatedHours} onChange={upd("estimatedHours")} />{errors.estimatedHours && <div className="err">{errors.estimatedHours}</div>}</div>
    </>
  );

  return (
    <DashboardShell role="admin" setPage={setPage} activeNav="admin-services">
      <div className="page-header">
        <div><div className="page-title">Layanan</div><div className="page-sub">Kelola jenis dan harga layanan laundry</div></div>
        <button className="btn btn-primary" onClick={() => { setShowAdd(true); setForm({ serviceName: "", serviceType: "REGULAR", pricePerKg: "", estimatedHours: "" }); setErrors({}); }}>+ Tambah Layanan</button>
      </div>
      {loading ? <PageLoading /> : (
        <div className="pricing-grid" style={{ marginBottom: 20 }}>
          {services.map((s, i) => (
            <div key={s.id} className={"pricing-card" + (i === 1 ? " featured" : "")}>
              {i === 1 && <span className="badge badge-popular" style={{ marginBottom: 12, display: "inline-block" }}>{s.serviceType}</span>}
              <div style={{ fontWeight: 600, fontSize: 18, color: "var(--ink)", letterSpacing: "-0.3px" }}>{s.serviceName}</div>
              <div className="pricing-price">{formatRp(s.pricePerKg)}<span style={{ fontSize: 16, fontWeight: 400, color: "var(--steel)" }}>/kg</span></div>
              <div style={{ fontSize: 13, color: "var(--steel)", marginBottom: 20 }}>⏱ {s.estimatedHours} jam</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showAdd && <Modal title="Tambah Layanan" onClose={() => setShowAdd(false)} footer={<><button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Batal</button><button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving ? "Menyimpan…" : "Simpan"}</button></>}>{serviceFormFields}</Modal>}
      {editSvc && <Modal title="Edit Layanan" onClose={() => setEditSvc(null)} footer={<><button className="btn btn-secondary" onClick={() => setEditSvc(null)}>Batal</button><button className="btn btn-primary" onClick={handleEdit} disabled={saving}>{saving ? "Menyimpan…" : "Simpan"}</button></>}>{serviceFormFields}</Modal>}
    </DashboardShell>
  );
}