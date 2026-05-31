import Sidebar from "../../components/common/Sidebar";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

export default function UserProfile({ setPage }) {
  const { currentUser } = useContext(AppContext);

  if (!currentUser) return <div className="layout">Memuat profil...</div>;

  return (
    <div className="layout">
      <Sidebar active="user-profile" setPage={setPage} role={currentUser?.role?.toLowerCase()} />
      <div className="main">
        <div className="page-title">Profil Saya</div>
        <div className="page-sub">Informasi otentikasi akun kerja Anda</div>
        
        <div className="card" style={{ maxWidth: 480 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ width: 52, height: 52, borderRadius: 50, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: "#1d4ed8" }}>
              {currentUser.name ? currentUser.name[0].toUpperCase() : "?"}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, color: "#111827" }}>{currentUser.name}</div>
              <span className="role-tag-user" style={{ textTransform: "uppercase", background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                {currentUser.role}
              </span>
            </div>
          </div>

          <div className="info-row">
            <span className="info-label">ID Karyawan</span>
            <span className="info-value">#{currentUser.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Username</span>
            <span className="info-value">{currentUser.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Hak Akses Jabatan</span>
            <span className="info-value" style={{ fontWeight: 600, color: "#2563eb" }}>{currentUser.role || "STAFF"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}