import { Topbar } from "./Topbar";

export function DashboardShell({ role, setPage, activeNav, children }) {
  return (
    <div className="app-shell">
      <div className="main-wrap">
        <Topbar role={role} setPage={setPage} active={activeNav} />
        <div className="main">{children}</div>
      </div>
    </div>
  );
}