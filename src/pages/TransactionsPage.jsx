import { useState, useEffect } from "react";
import { getTransactions, createTransaction, updateTransactionStatus, updatePaymentStatus, deleteTransaction } from "../services/transactionService";
import { getAllCustomers } from "../services/customerService";
import { getAllServices } from "../services/laundryService"
import { ORDER_STATUSES, PAYMENT_STATUSES } from "../utils/constants";
import { formatRp, today } from "../utils/helpers";
import { DashboardShell } from "../components/DashboardShell";
import { PageLoading } from "../components/PageLoading";
import { Modal } from "../components/Modal";
import { StatusBadge } from "../components/StatusBadge";
import { useApp } from "../hooks/useApp";

export function TransactionsPage({ role, setPage }) {
  const isAdmin = role === "admin";
  const { orders, setOrders, customers, setCustomers, services, setServices } = useApp();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Semua");
  const [detail, setDetail] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newO, setNewO] = useState({ customerId: "", serviceId: "", weight: "", paymentStatus: "UNPAID" });
  const [newErr, setNewErr] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [trxData, custData, svcData] = await Promise.all([
          getTransactions(undefined, undefined, undefined, 0, 200),
          getAllCustomers(),
          getAllServices(),
        ]);
        setOrders(Array.isArray(trxData) ? trxData : (trxData.content || []));
        setCustomers(Array.isArray(custData) ? custData : (custData.content || []));
        setServices(Array.isArray(svcData) ? svcData : (svcData.content || []));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  let filtered = orders;
  if (tab !== "Semua") filtered = filtered.filter(o => o.status === tab);
  if (search) filtered = filtered.filter(o =>
    (o.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.serviceName || "").toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id, newStatus) => {
    try {
      await updateTransactionStatus(id, newStatus);
      setOrders(p => p.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) { console.error(err); }
  };

  const updatePayment = async (id, newPaymentStatus) => {
    try {
      await updatePaymentStatus(id, newPaymentStatus);
      setOrders(p => p.map(o => o.id === id ? { ...o, paymentStatus: newPaymentStatus } : o));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      setOrders(p => p.filter(o => o.id !== id));
    } catch (err) { console.error(err); }
  };

  const validateNew = () => {
    const e = {};
    if (!newO.customerId) e.customerId = "Pilih pelanggan";
    if (!newO.serviceId) e.serviceId = "Pilih layanan";
    if (!newO.weight) e.weight = "Berat wajib diisi";
    else if (isNaN(newO.weight) || Number(newO.weight) <= 0) e.weight = "Berat harus angka positif";
    return e;
  };

  const handleAdd = async () => {
    const e = validateNew();
    if (Object.keys(e).length) { setNewErr(e); return; }
    setSaving(true);
    try {
      const created = await createTransaction({
        customerId: Number(newO.customerId),
        paymentStatus: newO.paymentStatus,
        pickupDate: today(),
        details: [{ serviceId: Number(newO.serviceId), weight: Number(newO.weight) }]
      });
      setOrders(p => [created, ...p]);
      setNewO({ customerId: "", serviceId: "", weight: "", paymentStatus: "UNPAID" });
      setNewErr({});
      setShowAdd(false);
    } catch (err) {
      setNewErr({ customerId: err?.response?.data?.message || "Gagal membuat transaksi." });
    } finally { setSaving(false); }
  };

  const prevSvc = services.find(s => s.id === Number(newO.serviceId));
  const prevTotal = prevSvc && newO.weight && !isNaN(newO.weight) && Number(newO.weight) > 0
    ? prevSvc.pricePerKg * Number(newO.weight) : 0;

  const activeNav = isAdmin ? "admin-transactions" : "user-orders";

  return (
    <DashboardShell role={role} setPage={setPage} activeNav={activeNav}>
      <div className="page-header">
        <div><div className="page-title">Transaksi</div><div className="page-sub">Monitor dan kelola semua pesanan laundry</div></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Transaksi Baru</button>
      </div>
      <div className="tabs">
        {["Semua", "PENDING", "WASHING", "DRYING", "IRONING", "READY", "COMPLETED"].map(t => (
          <button key={t} className={"tab" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div className="search-wrap">
        <input className="search-input" placeholder="Cari pelanggan atau layanan…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card">
        {loading ? <PageLoading /> : filtered.length === 0
          ? <div className="empty"><div className="empty-icon">🧺</div><div className="empty-text">Tidak ada transaksi ditemukan</div></div>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Pelanggan</th><th>Layanan</th><th>Berat</th><th>Total</th><th>Status</th><th>Pembayaran</th><th>Tanggal</th><th>Aksi</th></tr></thead>
                <tbody>{[...filtered].sort((a, b) => b.id - a.id).map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: "'Source Code Pro',monospace", fontSize: 12, color: "var(--stone)" }}>#{o.id}</td>
                    <td><div style={{ fontWeight: 500 }}>{o.customerName}</div></td>
                    <td>{o.serviceName || "-"}</td>
                    <td>{o.weight ?? "-"} kg</td>
                    <td style={{ fontWeight: 600 }}>{formatRp(o.totalPrice)}</td>
                    <td>
                      <select className="inline-select" value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                        {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      {isAdmin
                        ? <select className="inline-select" value={o.paymentStatus} onChange={e => updatePayment(o.id, e.target.value)}>
                          {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                        : <StatusBadge s={o.paymentStatus} />
                      }
                    </td>
                    <td style={{ fontSize: 12, color: "var(--steel)" }}>{(o.createdAt || "").slice(0, 10)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDetail(o)}>Lihat</button>
                        {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Hapus</button>}
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
      </div>

      {detail && (
        <Modal title="Detail Transaksi" onClose={() => setDetail(null)} footer={<button className="btn btn-secondary" onClick={() => setDetail(null)}>Tutup</button>}>
          {[
            ["ID", "#" + detail.id],
            ["Pelanggan", detail.customerName],
            ["Layanan", detail.serviceName || "-"],
            ["Berat", (detail.weight ?? "-") + " kg"],
            ["Total", formatRp(detail.totalPrice)],
            ["Status", detail.status],
            ["Pembayaran", detail.paymentStatus],
            ["Dibuat", (detail.createdAt || "").slice(0, 10)],
            ["Tgl. Pickup", (detail.pickupDate || "-").slice?.(0, 10)]
          ].map(([l, v]) => (
            <div key={l} className="info-row"><span className="info-label">{l}</span><span className="info-value">{v}</span></div>
          ))}
        </Modal>
      )}

      {showAdd && (
        <Modal title="Transaksi Baru" onClose={() => { setShowAdd(false); setNewErr({}); }}
          footer={<><button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Batal</button><button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving ? "Menyimpan…" : "Buat"}</button></>}>
          <div className="field">
            <label>Pelanggan</label>
            <select value={newO.customerId} onChange={e => { setNewO(f => ({ ...f, customerId: e.target.value })); setNewErr(v => ({ ...v, customerId: "" })); }}>
              <option value="">-- Pilih Pelanggan --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {newErr.customerId && <div className="err">{newErr.customerId}</div>}
          </div>
          <div className="field">
            <label>Layanan</label>
            <select value={newO.serviceId} onChange={e => { setNewO(f => ({ ...f, serviceId: e.target.value })); setNewErr(v => ({ ...v, serviceId: "" })); }}>
              <option value="">-- Pilih Layanan --</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.serviceName} ({s.serviceType}) — {formatRp(s.pricePerKg)}/kg</option>)}
            </select>
            {newErr.serviceId && <div className="err">{newErr.serviceId}</div>}
          </div>
          <div className="field">
            <label>Berat (kg)</label>
            <input type="number" placeholder="3" min="0.1" value={newO.weight} onChange={e => { setNewO(f => ({ ...f, weight: e.target.value })); setNewErr(v => ({ ...v, weight: "" })); }} />
            {newErr.weight && <div className="err">{newErr.weight}</div>}
          </div>
          <div className="field">
            <label>Status Pembayaran</label>
            <select value={newO.paymentStatus} onChange={e => setNewO(f => ({ ...f, paymentStatus: e.target.value }))}>
              {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {prevTotal > 0 && (
            <div style={{ background: "var(--surface-feat)", borderRadius: "var(--r-md)", padding: "12px 14px", display: "flex", justifyContent: "space-between", border: "1px solid var(--green)" }}>
              <span style={{ fontSize: 13, color: "var(--green-dark)", fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 700, color: "var(--green-dark)" }}>{formatRp(prevTotal)}</span>
            </div>
          )}
        </Modal>
      )}
    </DashboardShell>
  );
}