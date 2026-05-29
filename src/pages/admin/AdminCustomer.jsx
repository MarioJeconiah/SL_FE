import { useState, useContext } from "react";
import Sidebar from "../../components/common/Sidebar";
import Modal from "../../components/common/Modal";
import { AppContext } from "../../context/AppContext";

export default function AdminCustomers({ setPage }) {
  const { customers, setCustomers, orders } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const users = customers.filter(c => c.role === "user");
  const filtered = search 
    ? users.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.email.toLowerCase().includes(search.toLowerCase()) || 
        c.bagNumber.toLowerCase().includes(search.toLowerCase())
      ) 
    : users;

  const openEdit = (c) => {
    setEditCustomer(c);
    setEditForm({ 
      name: c.name, 
      email: c.email, 
      phone: c.phone, 
      room: c.room, 
      building: c.building, 
      bagNumber: c.bagNumber 
    });
    setEditErrors({});
  };

  const validateEdit = () => {
    const e = {};
    if (!editForm.name?.trim()) e.name = "Nama wajib diisi";
    if (!editForm.email?.trim()) e.email = "Email wajib diisi";
    else if (!/\S+@\S+\.\S+/.test(editForm.email)) e.email = "Format email tidak valid";
    if (!editForm.phone?.trim()) e.phone = "No. HP wajib diisi";
    return e;
  };

  const saveEdit = () => {
    const e = validateEdit();
    if (Object.keys(e).length) { setEditErrors(e); return; }
    setCustomers(prev => prev.map(c => c.id === editCustomer.id ? { ...c, ...editForm } : c));
    setEditCustomer(null);
  };

  const deleteCustomer = (id) => {
    if (window.confirm("Hapus pelanggan ini?")) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const upd = k => e => { 
    setEditForm(f => ({ ...f, [k]: e.target.value })); 
    setEditErrors(v => ({ ...v, [k]: "" })); 
  };

  const customerOrders = viewCustomer ? orders.filter(o => o.customerId === viewCustomer.id) : [];

  return (
    <div className="layout">
      <Sidebar active="admin-customers" setPage={setPage} role="admin" />
      <div className="main">
        <div className="page-title">Manajemen Pelanggan</div>
        <div className="page-sub">Data seluruh pelanggan terdaftar</div>
        <div className="search-bar">
          <input 
            placeholder="Cari nama, email, atau no. tas…" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="card">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="icon">👥</div>Tidak ada pelanggan</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Nama</th><th>Email</th><th>No. HP</th><th>Kamar</th><th>No. Tas</th><th>Total Pesanan</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td><div style={{ fontWeight: 500 }}>{c.name}</div></td>
                      <td style={{ fontSize: 13 }}>{c.email}</td>
                      <td style={{ fontSize: 13 }}>{c.phone}</td>
                      <td style={{ fontSize: 13 }}>{c.room} / {c.building}</td>
                      <td><span style={{ fontWeight: 600, color: "#2563eb" }}>{c.bagNumber}</span></td>
                      <td style={{ textAlign: "center" }}>{orders.filter(o => o.customerId === c.id).length}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn-icon" onClick={() => setViewCustomer(c)} title="Lihat">🔍</button>
                          <button className="btn-icon" onClick={() => openEdit(c)} title="Edit">✏️</button>
                          <button className="btn-danger" onClick={() => deleteCustomer(c.id)} title="Hapus">🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {viewCustomer && (
          <Modal title="Detail Pelanggan" onClose={() => setViewCustomer(null)} footer={<button className="btn-secondary" onClick={() => setViewCustomer(null)}>Tutup</button>}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ width: 48, height: 48, borderRadius: 50, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: "#1d4ed8" }}>
                {viewCustomer.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{viewCustomer.name}</div>
                <span className="role-tag-user">User</span>
              </div>
            </div>
            {[
              ["Email", viewCustomer.email],
              ["No. HP", viewCustomer.phone],
              ["Kamar", viewCustomer.room],
              ["Gedung", viewCustomer.building],
              ["No. Tas", viewCustomer.bagNumber]
            ].map(([l, v]) => (
              <div key={l} className="info-row"><span className="info-label">{l}</span><span className="info-value">{v || "-"}</span></div>
            ))}
            {customerOrders.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#6b7280", marginBottom: 10 }}>RIWAYAT PESANAN ({customerOrders.length})</div>
                {customerOrders.map(o => (
                  <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13 }}>
                    <div><div style={{ fontWeight: 500 }}>{o.serviceName}</div><div style={{ fontSize: 12, color: "#9ca3af" }}>{o.createdAt}</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontWeight: 600 }}>{o.totalPrice.toLocaleString('id-ID')}</div></div>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        )}

        {editCustomer && (
          <Modal title="Edit Pelanggan" onClose={() => setEditCustomer(null)}
            footer={<><button className="btn-secondary" onClick={() => setEditCustomer(null)}>Batal</button><button className="btn-primary" onClick={saveEdit}>Simpan</button></>}>
            <div className="two-col">
              <div className="field"><label>Nama</label><input value={editForm.name || ""} onChange={upd("name")} />{editErrors.name && <div className="err">{editErrors.name}</div>}</div>
              <div className="field"><label>Email</label><input type="email" value={editForm.email || ""} onChange={upd("email")} />{editErrors.email && <div className="err">{editErrors.email}</div>}</div>
              <div className="field"><label>No. HP</label><input value={editForm.phone || ""} onChange={upd("phone")} />{editErrors.phone && <div className="err">{editErrors.phone}</div>}</div>
              <div className="field"><label>No. Kamar</label><input value={editForm.room || ""} onChange={upd("room")} /></div>
              <div className="field"><label>Gedung</label><input value={editForm.building || ""} onChange={upd("building")} /></div>
              <div className="field"><label>No. Tas</label><input value={editForm.bagNumber || ""} onChange={upd("bagNumber")} /></div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}