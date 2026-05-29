import { useContext } from "react";
import Sidebar from "../../components/common/Sidebar";
import StatusBadge from "../../components/common/StatusBadge";
import { formatRp } from "../../utils/helper";
import { STATUS_ORDER } from "../../utils/helper";
import { AppContext } from "../../context/AppContext";

export default function AdminDashboard({ setPage }) {
  const { orders, customers } = useContext(AppContext);
  const totalRevenue = orders.filter(o => o.paymentStatus === "Lunas").reduce((s, o) => s + o.totalPrice, 0);
  const activeOrders = orders.filter(o => o.status !== "Diambil").length;
  const users = customers.filter(c => c.role === "user").length;

  const statusCount = STATUS_ORDER.map(s => ({ s, n: orders.filter(o => o.status === s).length }));

  return (
    <div className="layout">
      <Sidebar active="admin-dashboard" setPage={setPage} role="admin" />
      <div className="main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <div className="page-title">Dashboard Admin</div>
            <div className="page-sub">{new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat-card"><div className="stat-icon" style={{ background: "#dbeafe" }}>🧺</div><div className="stat-label">Total Transaksi</div><div className="stat-value">{orders.length}</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: "#fef3c7" }}>⏳</div><div className="stat-label">Aktif</div><div className="stat-value">{activeOrders}</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: "#d1fae5" }}>💰</div><div className="stat-label">Pendapatan</div><div className="stat-value" style={{ fontSize: 16, paddingTop: 4 }}>{formatRp(totalRevenue)}</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: "#ede9fe" }}>👥</div><div className="stat-label">Pelanggan</div><div className="stat-value">{users}</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card">
            <div className="card-title">Status Pesanan</div>
            {statusCount.map(({ s, n }) => (
              <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <StatusBadge s={s} />
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: "#111827" }}>{n}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title">Transaksi Terbaru</div>
            {[...orders].sort((a, b) => b.id - a.id).slice(0, 4).map(o => (
              <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div><div style={{ fontSize: 13, fontWeight: 500 }}>{o.customerName}</div><div style={{ fontSize: 12, color: "#9ca3af" }}>{o.serviceName}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: 13, fontWeight: 600 }}>{formatRp(o.totalPrice)}</div><StatusBadge s={o.status} /></div>
              </div>
            ))}
            <button className="btn-secondary" style={{ width: "100%", marginTop: 12 }} onClick={() => setPage("admin-transactions")}>Lihat Semua →</button>
          </div>
        </div>
      </div>
    </div>
  );
}