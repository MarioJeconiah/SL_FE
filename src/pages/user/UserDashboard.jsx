import { useContext, useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import StatusBadge from "../../components/common/StatusBadge";
import { formatRp } from "../../utils/helper";
import { AppContext } from "../../context/AppContext";
import api from "../../services/api";

export default function UserDashboard({ setPage }) {
  const { currentUser } = useContext(AppContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorApi, setErrorApi] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Menembak endpoint TransactionController (Default mengambil page=0, size=10)
      const response = await api.get("/transactions");
      
      // Karena backend menggunakan pagination (Page<TransactionResponse>), 
      // data array transaksinya berada di dalam properti '.content'
      if (response.data && Array.isArray(response.data.content)) {
        setTransactions(response.data.content);
      } else {
        setTransactions([]);
      }
      setErrorApi("");
    } catch (err) {
      console.error("Gagal mengambil data transaksi:", err);
      setErrorApi("Gagal memuat data transaksi terbaru dari server.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return <div className="layout">Memuat profil...</div>;
  if (loading) return <div className="layout">Memuat data transaksi dari server...</div>;

  // KALKULASI STATISTIK TOKO (Berdasarkan data yang ditarik dari server)
  const totalPesanan = transactions.length;
  
  // Sesuaikan penamaan properti status di bawah ini dengan enum/string di TransactionResponse kamu
  const pending = transactions.filter(t => t.status !== "DIAMBIL" && t.status !== "SELESAI").length;
  const unpaid = transactions.filter(t => t.paymentStatus === "BELUM_BAYAR" || t.paymentStatus === "Belum Bayar").length;
  
  // Ambil 3 transaksi teratas untuk dipajang di tabel ringkasan
  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="layout">
      {/* Role disesuaikan dengan role user log-in (owner/employee) */}
      <Sidebar active="user-dashboard" setPage={setPage} role={currentUser.role?.toLowerCase()} />
      
      <div className="main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <div className="page-title">Dashboard Operasional</div>
            <div className="page-sub">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div style={{ background: "#eff6ff", borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "#2563eb", fontWeight: 500 }}>
            Petugas: {currentUser.name} ({currentUser.role}) 👋
          </div>
        </div>

        {errorApi && <div className="alert alert-error" style={{ marginBottom: 20 }}>{errorApi}</div>}

        <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#dbeafe" }}>🧺</div>
            <div className="stat-label">Transaksi Baru Antrean</div>
            <div className="stat-value">{totalPesanan}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#fef3c7" }}>⏳</div>
            <div className="stat-label">Perlu Diproses</div>
            <div className="stat-value">{pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#fee2e2" }}>💳</div>
            <div className="stat-label">Belum Lunas</div>
            <div className="stat-value">{unpaid}</div>
          </div>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="card">
            <div className="card-title">Antrean Transaksi Terkini</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pelanggan / Detail</th>
                    <th>Tanggal</th>
                    <th>Status Kerja</th>
                    <th>Pembayaran</th>
                    <th>Total Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map(t => (
                    <tr key={t.id}>
                      <td>
                        {/* Sesuaikan dengan struktur isi TransactionResponse.java backend kamu */}
                        <div style={{ fontWeight: 600 }}>{t.customerName || t.customer?.name || "Pelanggan"}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{t.serviceName || "Laundry"} - {t.weight || 0} kg</div>
                      </td>
                      <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString("id-ID") : "-"}</td>
                      <td><StatusBadge s={t.status} /></td>
                      <td><StatusBadge s={t.paymentStatus} /></td>
                      <td style={{ fontWeight: 600 }}>{formatRp(t.totalPrice || t.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "30px 10px", color: "#9ca3af" }}>
            Belum ada transaksi yang tercatat hari ini.
          </div>
        )}

        <div className="nav-grid">
          {[
            { emoji: "➕", title: "Transaksi Baru", desc: "Input cucian masuk", bg: "#eff6ff", page: "new-transaction" },
            { emoji: "👥", title: "Kelola Customer", desc: "Data pelanggan", bg: "#ecfdf5", page: "manage-customers" },
          ].map(c => (
            <div key={c.title} className="nav-card" onClick={() => setPage(c.page)}>
              <div className="nav-icon" style={{ background: c.bg }}>{c.emoji}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{c.title}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}