import { useState, useEffect } from "react";
import { getTransactions } from "../services/transactionService";
import { getAllCustomers} from "../services/customerService";
import { getDailyReport, getWeeklyReport, getMonthlyReport } from "../services/reportService";
import { formatRp } from "../utils/helpers";
import { DashboardShell } from "../components/DashboardShell";
import { PageLoading } from "../components/PageLoading";
import { StatusBadge } from "../components/StatusBadge";
import { useApp } from "../hooks/useApp";

export function AdminDashboard({ setPage }) {
  const { orders, setOrders, customers, setCustomers } = useApp();
  const [loading, setLoading] = useState(true);
  const [reportTab, setReportTab] = useState("daily");
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportErr, setReportErr] = useState("");

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

  useEffect(() => {
    const fetchReport = async () => {
      setReportLoading(true);
      setReportErr("");
      try {
        let data;
        if (reportTab === "daily") data = await getDailyReport();
        if (reportTab === "weekly") data = await getWeeklyReport();
        if (reportTab === "monthly") data = await getMonthlyReport();
        setReport(data);
      } catch (err) {
        setReportErr(err?.response?.data?.message || "Gagal memuat laporan.");
        setReport(null);
      } finally { setReportLoading(false); }
    };
    fetchReport();
  }, [reportTab]);

  const userCount = customers.length;
  const recent = orders.slice(0, 5);
  const pending = orders.filter(o => o.status === "PENDING").length;
  const washing = orders.filter(o => o.status === "WASHING").length;
  const drying = orders.filter(o => o.status === "DRYING").length;
  const ironing = orders.filter(o => o.status === "IRONING").length;
  const ready = orders.filter(o => o.status === "READY").length;
  const activeOrders = orders.filter(o => ["PENDING", "WASHING", "DRYING", "IRONING", "READY"].includes(o.status)).length;
  const revenue = orders.filter(o => o.paymentStatus === "PAID").reduce((s, o) => s + (Number(o.totalPrice) || 0), 0);

  const REPORT_TABS = [
    { key: "daily", label: "Harian" },
    { key: "weekly", label: "Mingguan" },
    { key: "monthly", label: "Bulanan" },
  ];

  return (
    <DashboardShell role="admin" setPage={setPage} activeNav="admin-dashboard">
      <div className="hero">
        <div className="hero-eyebrow">Panel Admin</div>
        <h1 className="hero-title">Dashboard Operasional<br />Laundry</h1>
        <p className="hero-sub">Pantau performa bisnis, transaksi, dan aktivitas pelanggan secara real-time.</p>
        <div className="hero-actions">
          <button className="btn btn-on-dark" onClick={() => setPage("admin-transactions")}>+ Transaksi Baru</button>
          <button className="btn btn-sec-dark" onClick={() => setPage("admin-customers")}>Lihat Pelanggan</button>
        </div>
      </div>

      <div className="floating-cards" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="stat-row">
          <div className="stat-card"><div className="stat-card-label">Pendapatan</div><div className="stat-card-value green">{formatRp(revenue)}</div><div style={{ fontSize: 12, color: "var(--stone)", marginTop: 4 }}>Pesanan PAID</div></div>
          <div className="stat-card"><div className="stat-card-label">Transaksi</div><div className="stat-card-value">{orders.length}</div></div>
          <div className="stat-card"><div className="stat-card-label">Aktif</div><div className="stat-card-value amber">{activeOrders}</div></div>
          <div className="stat-card"><div className="stat-card-label">Pelanggan</div><div className="stat-card-value">{userCount}</div></div>
        </div>
      </div>

      <div style={{ padding: "24px 0 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div className="card card-lg" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.3px" }}>Laporan Bisnis</div>
              <div style={{ fontSize: 13, color: "var(--steel)", marginTop: 3 }}>Ringkasan transaksi berdasarkan periode</div>
            </div>
            <div style={{ display: "flex", background: "var(--surface)", borderRadius: "var(--r-full)", padding: 4, gap: 2 }}>
              {REPORT_TABS.map(t => (
                <button key={t.key} onClick={() => setReportTab(t.key)} style={{ padding: "6px 16px", border: "none", borderRadius: "var(--r-full)", background: reportTab === t.key ? "var(--canvas)" : "transparent", color: reportTab === t.key ? "var(--ink)" : "var(--steel)", fontWeight: reportTab === t.key ? 600 : 500, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: reportTab === t.key ? "var(--shadow-1)" : "none", transition: "all .15s" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {reportErr && <div className="alert alert-error" style={{ marginBottom: 16 }}>{reportErr}</div>}
          {reportLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "32px 0", justifyContent: "center", color: "var(--steel)", fontSize: 14 }}>
              <div className="spinner" /> Memuat laporan…
            </div>
          ) : report ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { icon: "💰", label: "Total Revenue", value: formatRp(report.totalRevenue), color: "var(--green-dark)", bg: "var(--green-soft)" },
                  { icon: "📦", label: "Total Transaksi", value: report.totalTransactions, color: "var(--ink)", bg: "var(--surface)" },
                  { icon: "✅", label: "Selesai", value: report.completedTransactions ?? "-", color: "#065F46", bg: "#D1FAE5" },
                  { icon: "⏳", label: "Pending", value: report.pendingTransactions ?? "-", color: "#92400E", bg: "#FEF3C7" },
                ].map(c => (
                  <div key={c.label} style={{ background: c.bg, borderRadius: "var(--r-lg)", padding: "16px 18px" }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{c.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", color: c.color, opacity: 0.7, marginBottom: 4 }}>{c.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: c.color, letterSpacing: "-0.5px" }}>{c.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "var(--surface)", borderRadius: "var(--r-lg)", padding: "16px 20px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--steel)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 14 }}>Distribusi Status Transaksi</div>
                {(() => {
                  const total = report.totalTransactions || 1;
                  const bars = [
                    { label: "Selesai", value: report.completedTransactions ?? 0, color: "var(--green)" },
                    { label: "Working", value: (report.totalTransactions ?? 0) - (report.completedTransactions ?? 0) - (report.cancelledTransactions ?? report.cancelled ?? 0), color: "#FBBF24" },
                    { label: "Dibatalkan", value: report.cancelled ?? report.cancelledTransactions ?? 0, color: "#F87171" },
                  ];
                  return bars.map(b => (
                    <div key={b.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                        <span style={{ color: "var(--steel)" }}>{b.label}</span>
                        <span style={{ fontWeight: 600, color: "var(--ink)" }}>{b.value} <span style={{ fontWeight: 400, color: "var(--stone)", fontSize: 12 }}>({Math.round((b.value / total) * 100)}%)</span></span>
                      </div>
                      <div style={{ height: 6, background: "var(--hairline)", borderRadius: 99 }}>
                        <div style={{ height: 6, background: b.color, borderRadius: 99, width: `${Math.min((b.value / total) * 100, 100)}%`, transition: "width .4s ease" }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </>
          ) : null}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <div className="card card-lg">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="card-title" style={{ margin: 0 }}>Aktivitas Terbaru</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage("admin-transactions")}>Lihat Semua →</button>
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
              {[["Transaksi", orders.length, "admin-transactions"], ["Pelanggan", customers.length, "admin-customers"]].map(([l, v, p]) => (
                <button key={l} className="btn btn-secondary" style={{ width: "100%", justifyContent: "space-between", marginBottom: 8 }} onClick={() => setPage(p)}>
                  <span>{l}</span><span style={{ fontWeight: 700 }}>{v}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="cta-band">
          <div><div className="cta-band-title">Siap memproses lebih banyak transaksi?</div><div className="cta-band-sub">Optimalkan alur kerja laundry Anda hari ini.</div></div>
          <button className="btn btn-on-dark" onClick={() => setPage("admin-transactions")}>Buat Transaksi</button>
        </div>
      </div>
    </DashboardShell>
  );
}