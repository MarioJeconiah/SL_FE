import { useState, useContext } from "react";
import Sidebar from "../../components/common/Sidebar";
import Modal from "../../components/common/Modal";
import { formatRp } from "../../utils/helper";
import { AppContext } from "../../context/AppContext";

export default function AdminServices({ setPage }) {
  const { services, setServices } = useContext(AppContext);
  const [showAdd, setShowAdd] = useState(false);
  const [editSvc, setEditSvc] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", unit: "kg", duration: "" });
  const [errors, setErrors] = useState({});

  const upd = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(v => ({ ...v, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    if (!form.price) e.price = "Harga wajib diisi";
    else if (isNaN(form.price) || Number(form.price) <= 0) e.price = "Harga harus angka positif";
    if (!form.duration.trim()) e.duration = "Durasi wajib diisi";
    return e;
  };

  const handleAdd = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setServices(prev => [...prev, {
      id: Date.now(),
      name: form.name,
      price: Number(form.price),
      unit: form.unit,
      duration: form.duration
    }]);
    setForm({ name: "", price: "", unit: "kg", duration: "" });
    setErrors({});
    setShowAdd(false);
  };

  const openEdit = (s) => {
    setEditSvc(s);
    setForm({ name: s.name, price: String(s.price), unit: s.unit, duration: s.duration });
    setErrors({});
  };

  const handleEdit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setServices(prev => prev.map(s => s.id === editSvc.id ? {
      ...s, name: form.name, price: Number(form.price), unit: form.unit, duration: form.duration
    } : s));
    setEditSvc(null);
    setForm({ name: "", price: "", unit: "kg", duration: "" });
  };

  const deleteSvc = (id) => {
    if (window.confirm("Hapus layanan ini?")) {
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const FormFields = () => (
    <>
      <div className="field"><label>Nama Layanan</label><input placeholder="Cuci Reguler" value={form.name} onChange={upd("name")} />{errors.name && <div className="err">{errors.name}</div>}</div>
      <div className="two-col">
        <div className="field"><label>Harga (Rp)</label><input type="number" placeholder="7000" min="0" value={form.price} onChange={upd("price")} />{errors.price && <div className="err">{errors.price}</div>}</div>
        <div className="field"><label>Satuan</label>
          <select value={form.unit} onChange={upd("unit")}>
            <option value="kg">kg</option>
            <option value="pcs">pcs</option>
            <option value="set">set</option>
          </select>
        </div>
      </div>
      <div className="field"><label>Durasi Pengerjaan</label><input placeholder="3 hari" value={form.duration} onChange={upd("duration")} />{errors.duration && <div className="err">{errors.duration}</div>}</div>
    </>
  );

  return (
    <div className="layout">
      <Sidebar active="admin-services" setPage={setPage} role="admin" />
      <div className="main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div className="page-title">Manajemen Layanan</div>
          <button className="btn-primary" onClick={() => { setShowAdd(true); setForm({ name: "", price: "", unit: "kg", duration: "" }); setErrors({}); }}>➕ Tambah Layanan</button>
        </div>
        <div className="page-sub">Kelola jenis dan harga layanan laundry</div>
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nama Layanan</th><th>Harga</th><th>Satuan</th><th>Durasi</th><th>Aksi</th></tr></thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td style={{ fontWeight: 600, color: "#2563eb" }}>{formatRp(s.price)}</td>
                    <td style={{ fontSize: 13, color: "#6b7280" }}>/{s.unit}</td>
                    <td><span style={{ background: "#f1f5f9", padding: "3px 10px", borderRadius: 6, fontSize: 12, color: "#374151" }}>{s.duration}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn-icon" onClick={() => openEdit(s)}>✏️</button>
                        <button className="btn-danger" onClick={() => deleteSvc(s.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showAdd && (
          <Modal title="Tambah Layanan" onClose={() => setShowAdd(false)}
            footer={<><button className="btn-secondary" onClick={() => setShowAdd(false)}>Batal</button><button className="btn-primary" onClick={handleAdd}>Simpan</button></>}>
            <FormFields />
          </Modal>
        )}

        {editSvc && (
          <Modal title="Edit Layanan" onClose={() => setEditSvc(null)}
            footer={<><button className="btn-secondary" onClick={() => setEditSvc(null)}>Batal</button><button className="btn-primary" onClick={handleEdit}>Simpan</button></>}>
            <FormFields />
          </Modal>
        )}
      </div>
    </div>
  );
}