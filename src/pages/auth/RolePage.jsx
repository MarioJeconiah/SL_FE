export default function RolePage({ setPage }) {
  return (
    <div className="role-selector">
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 34, fontWeight: 700, color: "#111827", textAlign: "center" }}>
        Welcome to LaundryHub
      </div>
      <p style={{ fontSize: 15, color: "#6b7280", textAlign: "center", marginTop: 8, marginBottom: 44 }}>
        Pilih cara Anda melanjutkan
      </p>
      <div className="role-cards">
        <div className="role-card" onClick={() => setPage("login-user")}>
          <div style={{ fontSize: 38, marginBottom: 14 }}>👤</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 600, color: "#111827", marginBottom: 8 }}>Masuk sebagai User</div>
          <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 16 }}>Buat pesanan, lacak laundry, dan kelola akun Anda</p>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#2563eb" }}>Mulai →</span>
        </div>
        <div className="role-card" onClick={() => setPage("login-admin")}>
          <div style={{ fontSize: 38, marginBottom: 14 }}>🛡️</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 600, color: "#111827", marginBottom: 8 }}>Masuk sebagai Admin</div>
          <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 16 }}>Kelola transaksi, pelanggan, dan layanan laundry</p>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed" }}>Mulai →</span>
        </div>
      </div>
    </div>
  );
}