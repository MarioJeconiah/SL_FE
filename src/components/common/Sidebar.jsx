import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

export default function Sidebar({ active, setPage, role }) {
  const { setCurrentUser } = useContext(AppContext);

  const userItems = [
    { key: "user-dashboard", emoji: "🏠", label: "Dashboard" },
    { key: "user-orders", emoji: "🧺", label: "Pesanan Saya" },
    { key: "user-new-order", emoji: "➕", label: "Buat Pesanan" },
    { key: "user-profile", emoji: "👤", label: "Profil Saya" },
  ];

  const adminItems = [
    { key: "admin-dashboard", emoji: "🏠", label: "Dashboard" },
    { key: "admin-transactions", emoji: "🧺", label: "Transaksi" },
    { key: "admin-customers", emoji: "👥", label: "Pelanggan" },
    { key: "admin-services", emoji: "⚙️", label: "Layanan" },
  ];

  const items = role === "admin" ? adminItems : userItems;

  return (
    <div className="sidebar">
      <div style={{ padding: "22px 20px 14px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 19, color: "#111827" }}>LaundryHub</div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {role === "admin" ? "Admin Panel" : "User Portal"}
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map(i => (
          <div
            key={i.key}
            className={`nav-item${active === i.key ? " active" : ""}`}
            onClick={() => setPage(i.key)}
          >
            <span style={{ fontSize: 17 }}>{i.emoji}</span>{i.label}
          </div>
        ))}
      </nav>

      <div style={{ padding: "14px 16px", borderTop: "1px solid #f3f4f6" }}>
        <button
          className="logout-btn"
          onClick={() => { setCurrentUser(null); setPage("role"); }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}