import { useState, useEffect, useContext } from "react";
import Sidebar from "../../components/common/Sidebar";
import StatusBadge from "../../components/common/StatusBadge";
import { formatRp } from "../../utils/helper";
import { AppContext } from "../../context/AppContext";
import { getTransactions } from "../../services/transactionService";

export default function UserOrders({ setPage }) {
  const { currentUser } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("SEMUA");

  // Filter tab disesuaikan dengan nilai Enum kapital di backend
  const tabs = ["SEMUA", "PENDING", "PROCESS", "COMPLETED", "TAKEN"];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getTransactions();
      
      // Ambil data array dari field '.content' milik objek Page Spring Boot
      if (response && Array.isArray(response.content)) {
        setOrders(response.content);
      } else if (response.data && Array.isArray(response.data.content)) {
        setOrders(response.data.content);
      }
    } catch (error) {
      console.error("Gagal mengambil data transaksi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="layout">Memuat riwayat transaksi...</div>;

  // Filter data berdasarkan tab status
  const filtered = tab === "SEMUA" 
    ? orders 
    : orders.filter((o) => String(o.status).toUpperCase() === tab);

  return (
    <div className="layout">
      <Sidebar active="user-orders" setPage={setPage} role={currentUser?.role?.toLowerCase()} />
      <div className="main">
        <div className="page-title">Pesanan Laundry Toko</div>
        <div className="page-sub">Riwayat dan status semua pesanan masuk</div>
        
        <div className="tabs">
          {tabs.map(t => (
            <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t === "SEMUA" ? "Semua" : t}
            </button>
          ))}
        </div>

        <div className="card">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="icon">🧺</div>Tidak ada pesanan</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Pelanggan</th>
                    <th>Kasir</th>
                    <th>Total</th>
                    <th>Status Kerja</th>
                    <th>Pembayaran</th>
                    <th>Est. Selesai</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filtered].sort((a, b) => b.id - a.id).map(o => (
                    <tr key={o.id}>
                      <td style={{ color: "#6b7280", fontSize: 12 }}>#{o.id}</td>
                      <td style={{ fontWeight: 500 }}>{o.customerName}</td>
                      <td>{o.employeeName || "-"}</td>
                      <td style={{ fontWeight: 600 }}>{formatRp(o.totalPrice)}</td>
                      <td><StatusBadge s={o.status} /></td>
                      <td><StatusBadge s={o.paymentStatus} /></td>
                      <td>{o.pickupDate ? new Date(o.pickupDate).toLocaleDateString("id-ID") : "-"}</td>
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