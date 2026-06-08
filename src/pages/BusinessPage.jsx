import { useState, useEffect } from "react";
import { getAllServices } from "../services/laundryService";
import { getBusinessProfile } from "../services/businessService";
import { getAllCustomers } from "../services/customerService";
import { formatRp } from "../utils/helpers";
import { DashboardShell } from "../components/DashboardShell";
import { PageLoading } from "../components/PageLoading";
import { useApp } from "../hooks/useApp";


export function BusinessPage({ role, setPage }) {
  const { currentUser } = useApp();
  const { customers, setCustomers, services, setServices } = useApp();
  const [biz, setBiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bizName, setBizName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const activeNav = role === "admin" ? "admin-business" : "user-business";
  const isOwner = (currentUser?.role || "").toUpperCase() === "OWNER" || role === "admin";

  useEffect(() => {
    const load = async () => {
      try {
        const [bizData, custData, svcData] = await Promise.all([
          getBusinessProfile(),
          getAllCustomers(),
          getAllServices(),
        ]);
        setCustomers(Array.isArray(custData) ? custData : (custData.content || []));
        setServices(Array.isArray(svcData) ? svcData : (svcData.content || []));
        const single = Array.isArray(bizData) ? bizData[0] : bizData;
        setBiz(single || null);
        setBizName(single?.businessName || "");
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSaveName = async () => {
    if (!bizName.trim()) return;
    setSaving(true);
    try {
      setBiz(b => ({ ...b, name: bizName, businessName: bizName }));
      setSaveMsg("Nama bisnis berhasil diperbarui!");
      setEditing(false);
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const bizDisplayName = biz?.businessName || currentUser?.businessName || "Bisnis Anda";
  const initial = bizDisplayName[0]?.toUpperCase() || "B";

  return (
    <DashboardShell role={role} setPage={setPage} activeNav={activeNav}>
      {loading ? <PageLoading /> : !biz ? (
        <div className="empty"><div className="empty-icon">🏪</div><div className="empty-text">Data bisnis tidak ditemukan</div></div>
      ) : (
        <div style={{ width: "100%", maxWidth: 860 }}>
          <div className="page-header">
            <div>
              <div className="page-title">Profil Bisnis</div>
              <div className="page-sub">Informasi bisnis laundry Anda</div>
            </div>
          </div>

          {saveMsg && <div className="alert alert-success" style={{ marginBottom: 20 }}>{saveMsg}</div>}

          <div style={{ background: "linear-gradient(135deg,var(--teal-deep),var(--teal-mid))", borderRadius: "var(--r-xl)", padding: "36px 40px", marginBottom: 24, display: "flex", alignItems: "center", gap: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: "var(--r-lg)", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "var(--teal-deep)", flexShrink: 0 }}>
              {initial}
            </div>
            <div style={{ flex: 1 }}>
              {editing ? (
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    value={bizName}
                    onChange={e => setBizName(e.target.value)}
                    style={{ fontSize: 22, fontWeight: 700, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--r-md)", color: "var(--on-dark)", padding: "6px 12px", fontFamily: "inherit", outline: "none", flex: 1, minWidth: 180 }}
                  />
                  <button className="btn btn-on-dark btn-sm" onClick={handleSaveName} disabled={saving}>{saving ? "Menyimpan…" : "Simpan"}</button>
                  <button className="btn btn-sec-dark btn-sm" onClick={() => { setEditing(false); setBizName(bizDisplayName); }}>Batal</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "var(--on-dark)", letterSpacing: "-0.5px" }}>{bizDisplayName}</div>
                </div>
              )}
              {biz.address && <div style={{ fontSize: 12, color: "var(--on-dark-muted)", marginTop: 4 }}>📍 {biz.address}</div>}
              {biz.phone && <div style={{ fontSize: 12, color: "var(--on-dark-muted)", marginTop: 2 }}>📞 {biz.phone}</div>}
            </div>
          </div>

          <div className="stat-row" style={{ marginBottom: 24 }}>
            <div className="stat-card"><div className="stat-card-label">Pelanggan</div><div className="stat-card-value">{customers.length}</div></div>
            <div className="stat-card"><div className="stat-card-label">Layanan</div><div className="stat-card-value">{services.length}</div></div>
            {biz.totalRevenue != null && (
              <div className="stat-card"><div className="stat-card-label">Pendapatan</div><div className="stat-card-value green" style={{ fontSize: 22 }}>{formatRp(biz.totalRevenue)}</div></div>
            )}
          </div>

          <div className="card card-lg">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>Daftar Layanan</div>
              {isOwner && <button className="btn btn-primary btn-sm" onClick={() => setPage("admin-services")}>Kelola Layanan</button>}
            </div>
            {services.length === 0 ? (
              <div className="empty" style={{ padding: "24px 0" }}><div className="empty-icon">🧺</div><div className="empty-text">Belum ada layanan terdaftar</div></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Nama Layanan</th><th>Tipe</th><th>Harga/kg</th><th>Estimasi</th></tr></thead>
                  <tbody>
                    {services.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 500 }}>{s.serviceName}</td>
                        <td><span className="badge badge-green-soft">{s.serviceType}</span></td>
                        <td style={{ fontWeight: 600, color: "var(--green-dark)" }}>{formatRp(s.pricePerKg)}/kg</td>
                        <td style={{ color: "var(--steel)" }}>⏱ {s.estimatedHours} jam</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}