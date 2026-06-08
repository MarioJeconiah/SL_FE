import { logout as apiLogout } from "../services/authService";
import { useApp } from "../hooks/useApp";

export function Topbar({ role, setPage, active }) {
  const { currentUser, setCurrentUser } = useApp();
  const isAdmin = role === "admin";

  const nav = isAdmin
    ? [
      { label: "Dashboard", page: "admin-dashboard" },
      { label: "Transaksi", page: "admin-transactions" },
      { label: "Pelanggan", page: "admin-customers" },
      { label: "Layanan", page: "admin-services" },
      { label: "Bisnis", page: "admin-business" },
    ]
    : [
      { label: "Dashboard", page: "user-dashboard" },
      { label: "Transaksi", page: "user-orders" },
      { label: "Pelanggan", page: "user-customers" },
      { label: "Layanan", page: "user-services" },
      { label: "Bisnis", page: "user-business" },
    ];

  const profilePage = isAdmin ? "admin-profile" : "user-profile";

  const handleLogout = () => {
    apiLogout();
    setCurrentUser(null);
    setPage("login");
  };

  const initials = (currentUser?.fullName || currentUser?.username || "?")[0].toUpperCase();

  return (
    <div className="topbar">
      <div className="topbar-brand">
        <span className="topbar-dot" />
        <span>SmartLaundry</span>
      </div>
      <div className="topbar-nav">
        {nav.map(n => (
          <button key={n.page} className={active === n.page ? "active" : ""} onClick={() => setPage(n.page)}>
            {n.label}
          </button>
        ))}
      </div>
      <div className="topbar-actions">
        <span className="role-pill">{isAdmin ? "OWNER" : "EMPLOYEE"}</span>
        <div
          className="topbar-avatar"
          title="Profil Saya"
          onClick={() => setPage(profilePage)}
        >
          {initials}
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">Logout</button>
      </div>
    </div>
  );
}