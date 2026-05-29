import Sidebar from "../../components/common/Sidebar";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

export default function UserProfile({ setPage }) {
  const { currentUser } = useContext(AppContext);
  return (
    <div className="layout">
      <Sidebar active="user-profile" setPage={setPage} role="user" />
      <div className="main">
        <div className="page-title">Profil Saya</div>
        <div className="page-sub">Informasi akun Anda</div>
        <div className="card" style={{ maxWidth: 480 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ width: 52, height: 52, borderRadius: 50, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: "#1d4ed8" }}>
              {currentUser.name[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, color: "#111827" }}>{currentUser.name}</div>
              <span className="role-tag-user">User</span>
            </div>
          </div>
          {[
            ["Email", currentUser.email],
            ["No. HP", currentUser.phone],
            ["No. Kamar", currentUser.room],
            ["Gedung", currentUser.building],
            ["No. Tas", currentUser.bagNumber]
          ].map(([l, v]) => (
            <div key={l} className="info-row">
              <span className="info-label">{l}</span>
              <span className="info-value">{v || "-"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}