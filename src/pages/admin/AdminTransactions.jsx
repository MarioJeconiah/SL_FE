import { useState, useContext } from "react";
import Sidebar from "../../components/common/Sidebar";
import Modal from "../../components/common/Modal";
import StatusBadge from "../../components/common/StatusBadge";
import { formatRp, today, addDays } from "../../utils/helper";
import { STATUS_ORDER, PAYMENT_STATUS } from "../../utils/helper";
import { AppContext } from "../../context/AppContext";

export default function AdminTransactions({ setPage }) {
  const { orders, setOrders, customers, services } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Semua");
  const [editOrder, setEditOrder] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newOrder, setNewOrder] = useState({ customerId: "", serviceId: "", weight: "", notes: "" });
  const [newErrors, setNewErrors] = useState({});

  const tabs = ["Semua", "Menunggu", "Diproses", "Selesai", "Diambil"];
  let filtered = orders;
  if (tab !== "Semua") filtered = filtered.filter(o => o.status === tab);
  if (search) filtered = filtered.filter(o =>
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.serviceName.toLowerCase().includes(search.toLowerCase()) ||
    o.bagNumber.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = (id, status) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  const updatePayment = (id, paymentStatus) => setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus } : o));
  const deleteOrder = (id) => {
    if (window.confirm("Hapus pesanan ini?")) setOrders(prev => prev.filter(o => o.id !== id));
  };

  const validateNew = () => {
    const e = {};
    if (!newOrder.customerId) e.customerId = "Pilih pelanggan";
    if (!newOrder.serviceId) e.serviceId = "Pilih layanan";
    if (!newOrder.weight) e.weight = "Berat wajib diisi";
    else if (isNaN(newOrder.weight) || Number(newOrder.weight) <= 0) e.weight = "Berat harus angka positif";
    return e;
  };

  const handleAddOrder = () => {
    const e = validateNew();
    if (Object.keys(e).length) { setNewErrors(e); return; }
    const cust = customers.find(c => c.id === Number(newOrder.customerId));
    const svc = services.find(s => s.id === Number(newOrder.serviceId));
    setOrders(prev => [...prev, {
      id: Date.now(),
      customerId: cust.id,
      customerName: cust.name,
      bagNumber: cust.bagNumber,
      serviceId: svc.id,
      serviceName: svc.name,
      weight: Number(newOrder.weight),
      totalPrice: svc.price * Number(newOrder.weight),
      status: "Menunggu",
      paymentStatus: "Belum Bayar",
      createdAt: today(),
      estimatedDone: addDays(today(), parseInt(svc.duration)),
      notes: newOrder.notes
    }]);
    setNewOrder({ customerId: "", serviceId: "", weight: "", notes: "" });
    setNewErrors({});
    setShowAdd(false);
  };

  return (
    <div className="layout">
      <Sidebar active="admin-transactions" setPage={setPage} role="admin" />
      <div className="main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div className="page-title">Manajemen Transaksi</div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>➕ Tambah Transaksi</button>
        </div>
        <div className="page-sub">Monitor dan kelola semua pesanan laundry</div>
        <div className="tabs">
          {tabs.map(t => <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>
        <div className="search-bar">
          <input placeholder="Cari nama pelanggan, layanan, atau no. tas…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="card">
          {filtered.length === 0 ? <div className="empty-state"><div className="icon">🧺</div>Tidak ada transaksi</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Pelanggan</th><th>Layanan</th><th>Berat</th><th>Total</th><th>Status</th><th>Pembayaran</th><th>Tanggal</th><th>Aksi</th></tr></thead>
                <tbody>
                  {[...filtered].sort((a, b) => b.id - a.id).map(o => (
                    <tr key={o.id}>
                      <td style={{ color: "#6b7280", fontSize: 12 }}>#{o.id}</td>
                      <td><div style={{ fontWeight: 500 }}>{o.customerName}</div><div style={{ fontSize: 12, color: "#9ca3af" }}>{o.bagNumber}</div></td>
                      <td>{o.serviceName}</td>
                      <td>{o.weight} kg</td>
                      <td style={{ fontWeight: 600 }}>{formatRp(o.totalPrice)}</td>
                      <td>
                        <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 8px", fontSize: 12, background: "#fff", cursor: "pointer" }}>
                          {STATUS_ORDER.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <select value={o.paymentStatus} onChange={e => updatePayment(o.id, e.target.value)} style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 8px", fontSize: 12, background: "#fff", cursor: "pointer" }}>
                          {PAYMENT_STATUS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ fontSize: 12, color: "#6b7280" }}>{o.createdAt}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn-icon" onClick={() => setEditOrder(o)} title="Detail">🔍</button>
                          <button className="btn-danger" onClick={() => deleteOrder(o.id)} title="Hapus">🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {editOrder && (
          <Modal title="Detail Transaksi" onClose={() => setEditOrder(null)} footer={<button className="btn-secondary" onClick={() => setEditOrder(null)}>Tutup</button>}>
            {[
              ["ID Pesanan", "#" + editOrder.id],
              ["Pelanggan", editOrder.customerName],
              ["No. Tas", editOrder.bagNumber],
              ["Layanan", editOrder.serviceName],
              ["Berat", editOrder.weight + " kg"],
              ["Total", formatRp(editOrder.totalPrice)],
              ["Status", editOrder.status],
              ["Pembayaran", editOrder.paymentStatus],
              ["Dibuat", editOrder.createdAt],
              ["Est. Selesai", editOrder.estimatedDone],
              ["Catatan", editOrder.notes || "-"]
            ].map(([l, v]) => (
              <div key={l} className="info-row"><span className="info-label">{l}</span><span className="info-value">{v}</span></div>
            ))}
          </Modal>
        )}

        {showAdd && (
          <Modal title="Tambah Transaksi" onClose={() => { setShowAdd(false); setNewErrors({}); }}
            footer={<><button className="btn-secondary" onClick={() => setShowAdd(false)}>Batal</button><button className="btn-primary" onClick={handleAddOrder}>Simpan</button></>}>
            <div className="field">
              <label>Pelanggan</label>
              <select value={newOrder.customerId} onChange={e => { setNewOrder(f => ({ ...f, customerId: e.target.value })); setNewErrors(v => ({ ...v, customerId: "" })); }}>
                <option value="">-- Pilih Pelanggan --</option>
                {customers.filter(c => c.role === "user").map(c => <option key={c.id} value={c.id}>{c.name} ({c.bagNumber})</option>)}
              </select>
              {newErrors.customerId && <div className="err">{newErrors.customerId}</div>}
            </div>
            <div className="field">
              <label>Layanan</label>
              <select value={newOrder.serviceId} onChange={e => { setNewOrder(f => ({ ...f, serviceId: e.target.value })); setNewErrors(v => ({ ...v, serviceId: "" })); }}>
                <option value="">-- Pilih Layanan --</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} — {formatRp(s.price)}/{s.unit}</option>)}
              </select>
              {newErrors.serviceId && <div className="err">{newErrors.serviceId}</div>}
            </div>
            <div className="field">
              <label>Berat (kg)</label>
              <input type="number" placeholder="Contoh: 3" min="0.1" value={newOrder.weight} onChange={e => { setNewOrder(f => ({ ...f, weight: e.target.value })); setNewErrors(v => ({ ...v, weight: "" })); }} />
              {newErrors.weight && <div className="err">{newErrors.weight}</div>}
            </div>
            <div className="field">
              <label>Catatan</label>
              <textarea placeholder="Catatan opsional" value={newOrder.notes} onChange={e => setNewOrder(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}