import { useState, useContext } from "react";
import Sidebar from "../../components/common/Sidebar";
import StatusBadge from "../../components/common/StatusBadge";
import { formatRp } from "../../utils/helper";
import { AppContext } from "../../context/AppContext";

export default function UserOrders({ setPage }) {
  const { orders, currentUser } = useContext(AppContext);
  const [tab, setTab] = useState("Semua");
  const myOrders = orders.filter(o => o.customerId === currentUser.id);
  const tabs = ["Semua", "Menunggu", "Diproses", "Selesai", "Diambil"];
  const filtered = tab === "Semua" ? myOrders : myOrders.filter(o => o.status === tab);

  return (
    <div className="layout">
      <Sidebar active="user-orders" setPage={setPage} role="user" />
      <div className="main">
        <div className="page-title">Pesanan Saya</div>
        <div className="page-sub">Riwayat dan status semua pesanan Anda</div>
        <div className="tabs">
          {tabs.map(t => <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>
        <div className="card">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="icon">🧺</div>Tidak ada pesanan</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Layanan</th><th>Berat</th><th>Total</th><th>Status</th><th>Pembayaran</th><th>Est. Selesai</th></tr></thead>
                <tbody>
                  {[...filtered].sort((a, b) => b.id - a.id).map(o => (
                    <tr key={o.id}>
                      <td style={{ color: "#6b7280", fontSize: 12 }}>#{o.id}</td>
                      <td><div style={{ fontWeight: 500 }}>{o.serviceName}</div>{o.notes && <div style={{ fontSize: 11, color: "#9ca3af" }}>{o.notes}</div>}</td>
                      <td>{o.weight} kg</td>
                      <td style={{ fontWeight: 600 }}>{formatRp(o.totalPrice)}</td>
                      <td><StatusBadge s={o.status} /></td>
                      <td><StatusBadge s={o.paymentStatus} /></td>
                      <td>{o.estimatedDone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <button className="btn-primary" onClick={() => setPage("user-new-order")}>➕ Buat Pesanan Baru</button>
      </div>
    </div>
  );
}