import { useContext } from "react";
import Sidebar from "../../components/common/Sidebar";
import StatusBadge from "../../components/common/StatusBadge";
import { formatRp } from "../../utils/helper";
import { AppContext } from "../../context/AppContext";

export default function UserDashboard({ setPage }) {
  const { orders, currentUser } = useContext(AppContext);
  const myOrders = orders.filter(o => o.customerId === currentUser.id);
  const pending = myOrders.filter(o => o.status !== "Diambil").length;
  const unpaid = myOrders.filter(o => o.paymentStatus === "Belum Bayar").length;
  const recent = [...myOrders].sort((a, b) => b.id - a.id).slice(0, 3);

  return (
    <div className="layout">
      <Sidebar active="user-dashboard" setPage={setPage} role="user" />
      <div className="main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <div className="page-title">Dashboard</div>
            <div className="page-sub">{new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
          <div style={{ background: "#eff6ff", borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "#2563eb", fontWeight: 500 }}>Hi, {currentUser.name} 👋</div>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          <div className="stat-card"><div className="stat-icon" style={{ background: "#dbeafe" }}>🧺</div><div className="stat-label">Total Pesanan</div><div className="stat-value">{myOrders.length}</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: "#fef3c7" }}>⏳</div><div className="stat-label">Sedang Berjalan</div><div className="stat-value">{pending}</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: "#fee2e2" }}>💳</div><div className="stat-label">Belum Bayar</div><div className="stat-value">{unpaid}</div></div>
        </div>

        {recent.length > 0 && (
          <div className="card">
            <div className="card-title">Pesanan Terbaru</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Layanan</th><th>Tanggal</th><th>Status</th><th>Pembayaran</th><th>Total</th></tr></thead>
                <tbody>
                  {recent.map(o => (
                    <tr key={o.id}>
                      <td><div style={{ fontWeight: 500 }}>{o.serviceName}</div><div style={{ fontSize: 12, color: "#9ca3af" }}>{o.weight} kg</div></td>
                      <td>{o.createdAt}</td>
                      <td><StatusBadge s={o.status} /></td>
                      <td><StatusBadge s={o.paymentStatus} /></td>
                      <td style={{ fontWeight: 600 }}>{formatRp(o.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="nav-grid">
          {[
            { emoji: "➕", title: "Buat Pesanan", desc: "Ajukan laundry baru", bg: "#eff6ff", page: "user-new-order" },
            { emoji: "🧺", title: "Pesanan Saya", desc: "Lihat riwayat pesanan", bg: "#f5f3ff", page: "user-orders" },
          ].map(c => (
            <div key={c.title} className="nav-card" onClick={() => setPage(c.page)}>
              <div className="nav-icon" style={{ background: c.bg }}>{c.emoji}</div>
              <div><div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{c.title}</div><div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>{c.desc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}