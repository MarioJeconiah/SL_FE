import { useApp } from "../hooks/useApp";


export function ProfilePage({ role, setPage }) {
  const { currentUser } = useApp();
  const isAdmin = role === "admin";
  const activeNav = isAdmin ? "admin-profile" : "user-profile";
  const initials = (currentUser?.fullName || currentUser?.username || "?")[0].toUpperCase();
  const roleBadge = isAdmin ? "OWNER" : "EMPLOYEE";
  const roleBadgeClass = isAdmin ? "badge-owner" : "badge-employee";

  return (
    <DashboardShell role={role} setPage={setPage} activeNav={activeNav}>
      <div style={{ width: "100%", maxWidth: 900 }}>
        <div className="page-header">
          <div>
            <div className="page-title">Profil Saya</div>
            <div className="page-sub">Informasi akun Anda</div>
          </div>
        </div>

        <div className="profile-shell">
          <div>
            <div className="profile-sidebar-card">
              <div className="profile-avatar-ring">{initials}</div>
              <div className="profile-name">{currentUser?.fullName}</div>
              <div className="profile-username">@{currentUser?.username}</div>
              <span className={"badge " + roleBadgeClass} style={{ marginBottom: 16 }}>{roleBadge}</span>
              <div style={{ width: "100%", borderTop: "1px solid var(--hairline)", paddingTop: 16, marginTop: 4 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12, textAlign: "left" }}>
                  <span style={{ fontSize: 14, marginTop: 1 }}>👤</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.4px" }}>Nama Lengkap</div>
                    <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, marginTop: 2 }}>{currentUser?.fullName || "-"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12, textAlign: "left" }}>
                  <span style={{ fontSize: 14, marginTop: 1 }}>🔑</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.4px" }}>Username</div>
                    <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, marginTop: 2 }}>{currentUser?.username || "-"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="profile-main-card">
              <div className="profile-section-header">
                <div className="profile-section-title">Informasi Pribadi</div>
              </div>
              <div className="profile-body">
                <div className="info-row">
                  <span className="info-label">Nama Lengkap</span>
                  <span className="info-value">{currentUser?.fullName || "-"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Username</span>
                  <span className="info-value">@{currentUser?.username || "-"}</span>
                </div>
              </div>
            </div>

            <div className="profile-main-card">
              <div className="profile-section-header">
                <div className="profile-section-title">Informasi Akun</div>
              </div>
              <div className="profile-body">
                <div className="info-row">
                  <span className="info-label">Role</span>
                  <span className={"badge " + roleBadgeClass}>{roleBadge}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status Akun</span>
                  <span className="badge badge-green-soft">AKTIF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}