import { useState, useEffect } from "react";
import { getAllCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerById } from "../services/customerService";
import { getTransactions } from "../services/transactionService";
import { formatRp } from "../utils/helpers";
import { DashboardShell } from "../components/DashboardShell";
import { PageLoading } from "../components/PageLoading";
import { Modal } from "../components/Modal";
import { useApp } from "../hooks/useApp";

export function CustomersPage({ role, setPage }) {
  const isAdmin = role === "admin";
  const { customers, setCustomers, orders, setOrders } = useApp();
  const [search, setSearch] = useState("");
  const [viewC, setViewC] = useState(null);
  const [editC, setEditC] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", phone: "", address: "" });
  const [addErrors, setAddErrors] = useState({});
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [custData, trxData] = await Promise.all([getAllCustomers(), getTransactions(undefined, undefined, undefined, 0, 200)]);
        setCustomers(Array.isArray(custData) ? custData : (custData.content || []));
        setOrders(Array.isArray(trxData) ? trxData : (trxData.content || []));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = search
    ? customers.filter(c => (c.name || "").toLowerCase().includes(search.toLowerCase()) || (c.phone || "").toLowerCase().includes(search.toLowerCase()))
    : customers;

  const openEdit = c => { setEditC(c); setEditForm({ name: c.name, phone: c.phone, address: c.address }); setEditErrors({}); };
  const upd = k => e => { setEditForm(f => ({ ...f, [k]: e.target.value })); setEditErrors(v => ({ ...v, [k]: "" })); };
  const validateEdit = () => {
    const e = {};
    if (!editForm.name?.trim()) e.name = "Nama wajib diisi";
    if (!editForm.phone?.trim()) e.phone = "No. HP wajib diisi";
    return e;
  };
  const saveEdit = async () => {
    const e = validateEdit();
    if (Object.keys(e).length) { setEditErrors(e); return; }
    setSaving(true);
    try {
      const updated = await updateCustomer(editC.id, editForm);
      setCustomers(p => p.map(c => c.id === editC.id ? (updated || { ...c, ...editForm }) : c));
      setEditC(null);
    } catch (err) { setEditErrors({ name: err?.response?.data?.message || "Gagal menyimpan perubahan." }); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    try { await deleteCustomer(id); setCustomers(p => p.filter(c => c.id !== id)); }
    catch (err) { console.error(err); }
  };
  const updAdd = k => e => { setAddForm(f => ({ ...f, [k]: e.target.value })); setAddErrors(v => ({ ...v, [k]: "" })); };
  const validateAdd = () => {
    const e = {};
    if (!addForm.name?.trim()) e.name = "Nama wajib diisi";
    if (!addForm.phone?.trim()) e.phone = "No. HP wajib diisi";
    return e;
  };
  const handleAdd = async () => {
    const e = validateAdd();
    if (Object.keys(e).length) { setAddErrors(e); return; }
    setAddSaving(true);
    try {
      const created = await createCustomer(addForm);
      setCustomers(p => [...p, created]);
      setAddForm({ name: "", phone: "", address: "" });
      setAddErrors({});
      setShowAdd(false);
    } catch (err) { setAddErrors({ name: err?.response?.data?.message || "Gagal menyimpan customer." }); }
    finally { setAddSaving(false); }
  };

  const viewOrders = viewC ? orders.filter(o => o.customerId === viewC.id) : [];
  const activeNav = isAdmin ? "admin-customers" : "user-customers";

  return (
    <DashboardShell role={role} setPage={setPage} activeNav={activeNav}>
      <div className="page-header">
        <div><div className="page-title">Pelanggan</div><div className="page-sub">Kelola data pelanggan laundry Anda</div></div>
        <button className="btn btn-primary" onClick={() => { setShowAdd(true); setAddForm({ name: "", phone: "", address: "" }); setAddErrors({}); }}>+ Pelanggan Baru</button>
      </div>
      <div className="search-wrap">
        <input className="search-input" placeholder="Cari pelanggan..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card">
        {loading ? <PageLoading /> : filtered.length === 0
          ? <div className="empty"><div className="empty-icon">👥</div><div className="empty-text">Tidak ada pelanggan ditemukan</div></div>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Nama</th><th>No. HP</th><th>Alamat</th><th>Aksi</th></tr></thead>
                <tbody>{filtered.map(c => (
                  <tr key={c.id}>
                    <td><div style={{ fontWeight: 500 }}>{c.name}</div></td>
                    <td style={{ fontSize: 13 }}>{c.phone}</td>
                    <td style={{ fontSize: 13 }}>{c.address || "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setViewC(c)}>Lihat</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Hapus</button>}
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
      </div>

      {viewC && (
        <Modal title="Detail Pelanggan" onClose={() => setViewC(null)} footer={<button className="btn btn-secondary" onClick={() => setViewC(null)}>Tutup</button>}>
          <div className="info-row"><span className="info-label">ID</span><span className="info-value">#{viewC.id}</span></div>
          <div className="info-row"><span className="info-label">Nama</span><span className="info-value">{viewC.name}</span></div>
          <div className="info-row"><span className="info-label">No. HP</span><span className="info-value">{viewC.phone}</span></div>
          <div className="info-row"><span className="info-label">Alamat</span><span className="info-value">{viewC.address || "-"}</span></div>
          {viewOrders.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>Pesanan Terakhir</div>
              {viewOrders.slice(0, 5).map(o => (
                <div key={o.id} style={{ fontSize: 12, color: "var(--steel)", padding: "6px 0", borderBottom: "1px solid var(--hairline-soft)" }}>
                  {o.id} · {o.status} · {formatRp(o.totalPrice)}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {editC && (
        <Modal title="Edit Pelanggan" onClose={() => setEditC(null)} footer={<><button className="btn btn-secondary" onClick={() => setEditC(null)}>Batal</button><button className="btn btn-primary" onClick={saveEdit} disabled={saving}>{saving ? "Menyimpan…" : "Simpan"}</button></>}>
          <div className="field"><label>Nama</label><input placeholder="Ahmad Rizky" value={editForm.name} onChange={upd("name")} />{editErrors.name && <div className="err">{editErrors.name}</div>}</div>
          <div className="field"><label>No. HP</label><input placeholder="08123456789" value={editForm.phone} onChange={upd("phone")} />{editErrors.phone && <div className="err">{editErrors.phone}</div>}</div>
          <div className="field"><label>Alamat</label><textarea placeholder="Jl. Merdeka 123" value={editForm.address} onChange={upd("address")} /></div>
        </Modal>
      )}

      {showAdd && (
        <Modal title="Pelanggan Baru" onClose={() => setShowAdd(false)} footer={<><button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Batal</button><button className="btn btn-primary" onClick={handleAdd} disabled={addSaving}>{addSaving ? "Menyimpan…" : "Simpan"}</button></>}>
          <div className="field"><label>Nama</label><input placeholder="Ahmad Rizky" value={addForm.name} onChange={updAdd("name")} />{addErrors.name && <div className="err">{addErrors.name}</div>}</div>
          <div className="field"><label>No. HP</label><input placeholder="08123456789" value={addForm.phone} onChange={updAdd("phone")} />{addErrors.phone && <div className="err">{addErrors.phone}</div>}</div>
          <div className="field"><label>Alamat</label><textarea placeholder="Jl. Merdeka 123" value={addForm.address} onChange={updAdd("address")} /></div>
        </Modal>
      )}
    </DashboardShell>
  );
}