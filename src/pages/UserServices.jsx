import { useState, useEffect } from "react";
import { getAllServices } from "../services/laundryService";
import { getBusinessProfile } from "../services/businessService";
import { getAllCustomers } from "../services/customerService";
import { formatRp } from "../utils/helpers";
import { DashboardShell } from "../components/DashboardShell";
import { PageLoading } from "../components/PageLoading";
import { useApp } from "../hooks/useApp";

export function UserServices({ setPage }) {
  const { services, setServices } = useApp();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getAllServices().then(data => setServices(Array.isArray(data) ? data : (data.content || []))).catch(console.error).finally(() => setLoading(false));
  }, []);
  return (
    <DashboardShell role="user" setPage={setPage} activeNav="user-services">
      <div className="page-header">
        <div><div className="page-title">Layanan</div><div className="page-sub">Daftar layanan laundry yang tersedia</div></div>
      </div>
      {loading ? <PageLoading /> : services.length === 0
        ? <div className="empty"><div className="empty-icon">🧺</div><div className="empty-text">Belum ada layanan</div></div>
        : (
          <div className="pricing-grid" style={{ marginBottom: 20 }}>
            {services.map((s, i) => (
              <div key={s.id} className={"pricing-card" + (i === 1 ? " featured" : "")}>
                {i === 1 && <span className="badge badge-popular" style={{ marginBottom: 12, display: "inline-block" }}>{s.serviceType}</span>}
                <div style={{ fontWeight: 600, fontSize: 18, color: "var(--ink)", letterSpacing: "-0.3px" }}>{s.serviceName}</div>
                <div className="pricing-price">{formatRp(s.pricePerKg)}<span style={{ fontSize: 16, fontWeight: 400, color: "var(--steel)" }}>/kg</span></div>
                <div style={{ fontSize: 13, color: "var(--steel)", marginBottom: 12 }}>⏱ {s.estimatedHours} jam</div>
                <span className="badge badge-green-soft">{s.serviceType}</span>
              </div>
            ))}
          </div>
        )}
    </DashboardShell>
  );
}



