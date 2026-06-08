import { useState, useEffect } from "react";
import { getTransactions } from "../services/transactionService";
import { getAllCustomers } from "../services/customerService"
import { DashboardShell } from "../components/DashboardShell";
import { PageLoading } from "../components/PageLoading";
import { StatusBadge } from "../components/StatusBadge";
import { formatRp } from "../utils/helpers";
import { useApp } from "../hooks/useApp";

export function UserDashboard({ setPage }) {
  const { orders, setOrders, customers, setCustomers } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [trxData, custData] = await Promise.all([
          getTransactions(undefined, undefined, undefined, 0, 200),
          getAllCustomers()
        ]);
        setOrders(Array.isArray(trxData) ? trxData : (trxData.content || []));
        setCustomers(Array.isArray(custData) ? custData : (custData.content || []));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const activeOrders = orders.filter(o => ["PENDING", "WASHING", "DRYING", "IRONING", "READY"].includes(o.status)).length;
  const pending = orders.filter(o => o.status === "PENDING").length;
  const washing = orders.filter(o => o.status === "WASHING").length;
  const drying = orders.filter(o => o.status === "DRYING").length;
  const ironing = orders.filter(o => o.status === "IRONING").length;
  const ready = orders.filter(o => o.status === "READY").length;
  const recent = orders.slice(0, 5);

  return (
    <DashboardShell role="user" setPage={setPage} activeNav="user-dashboard">
      <div className="hero">
        <div className="hero-eyebrow">Panel Karyawan</div>
        <h1 className="hero-title">Dashboard Operasional<br />Laundry</h1>
        <p className="hero-sub">Pantau dan kelola pesanan laundry secara real-time.</p>
        <div className="hero-actions">
          <button className="btn btn-on-dark" onClick={() => setPage("user-orders")}>+ Transaksi Baru</button>
          <button className="btn btn-sec-dark" onClick={() => setPage("user-customers")}>Lihat Pelanggan</button>
        </div>
      </div>

      <div className="floating-cards" style={{ maxWidth: 1100 }}>
        <div className="stat-row">
          <div className="stat-card"><div className="stat-card-label">Transaksi</div><div className="stat-card-value">{orders.length}</div></div>
          <div className="stat-card"><div className="stat-card-label">Aktif</div><div className="stat-card-value amber">{activeOrders}</div></div>
          <div className="stat-card"><div className="stat-card-label">Pelanggan</div><div className="stat-card-value">{customers.length}</div></div>
          <div className="stat-card"><div className="stat-card-label">Pending</div><div className="stat-card-value amber">{pending}</div></div>
        </div>
      </div>

      {loading ? <PageLoading /> : (
        <div style={{ padding: "24px 0 32px", maxWidth: 1100 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div className="card card-lg">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div className="card-title" style={{ margin: 0 }}>Aktivitas Terbaru</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setPage("user-orders")}>Lihat Semua →</button>
              </div>
              {recent.length === 0
                ? <div className="empty"><div className="empty-icon">🧺</div><div className="empty-text">Belum ada transaksi</div></div>
                : recent.map(o => (
                  <div key={o.id} className="activity-item">
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{String(o.id).slice(-5)}</div>
                      <div style={{ fontSize: 12, color: "var(--steel)" }}>{o.customerName} · {o.serviceName || "-"}</div>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <StatusBadge s={o.status} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{formatRp(o.totalPrice)}</span>
                    </div>
                  </div>
                ))}
            </div>
            <div className="card card-lg">
              <div className="card-title">Status Pesanan</div>
              <p style={{ fontSize: 13, color: "var(--steel)", marginBottom: 16 }}>Semua sistem berjalan normal</p>
              {[
                ["Pending", pending, "#FBBF24"],
                ["Washing", washing, "#89CFEF"],
                ["Drying", drying, "#E12901"],
                ["Ironing", ironing, "#C5C6C7"],
                ["Ready", ready, "#48A860"],
              ].map(([l, v, c]) => (
                <div key={l} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--steel)", marginBottom: 5 }}>
                    <span>{l}</span><span style={{ fontWeight: 600, color: "var(--ink)" }}>{v}</span>
                  </div>
                  <div style={{ height: 6, background: "var(--hairline)", borderRadius: 99 }}>
                    <div style={{ height: 6, background: c, borderRadius: 99, width: `${orders.length ? Math.min((v / orders.length) * 100, 100) : 0}%` }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                {[["Transaksi", orders.length, "user-orders"], ["Pelanggan", customers.length, "user-customers"]].map(([l, v, p]) => (
                  <button key={l} className="btn btn-secondary" style={{ width: "100%", justifyContent: "space-between", marginBottom: 8 }} onClick={() => setPage(p)}>
                    <span>{l}</span><span style={{ fontWeight: 700 }}>{v}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="cta-band">
            <div><div className="cta-band-title">Siap memproses lebih banyak transaksi?</div><div className="cta-band-sub">Kelola alur kerja laundry dengan efisien.</div></div>
            <button className="btn btn-on-dark" onClick={() => setPage("user-orders")}>Buat Transaksi</button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}