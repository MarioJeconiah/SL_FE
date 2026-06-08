
import { useState, useEffect, createContext, useContext } from "react";
import * as authService from "./services/authService";
import * as customerService from "./services/customerService";
import * as laundryService from "./services/laundryService";
import * as transactionService from "./services/transactionService";

// ── CONSTANTS ─────────────────────────────────────────────────
const ORDER_STATUSES   = ["PENDING","WASHING","DRYING","IRONING","READY","COMPLETED","CANCELLED"];
const PAYMENT_STATUSES = ["Belum Bayar", "DP", "Lunas"];

// ── HELPERS ───────────────────────────────────────────────────
const formatRp     = n => "Rp " + Number(n).toLocaleString("id-ID");
const today        = () => new Date().toISOString().slice(0,10);
const addDays      = (d,n) => { const dt = new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().slice(0,10); };
const validateEmail = e => /\S+@\S+\.\S+/.test(e);

// ── CONTEXT ───────────────────────────────────────────────────
const AppContext = createContext(null);
function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AppContext.Provider>
  );
}
const useApp = () => useContext(AppContext);

// ── COMPLETE STYLES ────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap');

  :root {
    --green:         #00ED64;
    --green-dark:    #00684A;
    --green-soft:    #E3FCF7;
    --teal-deep:     #001E2B;
    --teal:          #023430;
    --teal-mid:      #0D3D32;
    --canvas:        #FFFFFF;
    --canvas-dark:   #112733;
    --surface:       #F5F6F7;
    --surface-soft:  #FAFAFA;
    --surface-feat:  #E3FCF7;
    --hairline:      #E8EDEB;
    --hairline-soft: #F0F4F2;
    --hairline-str:  #C8D4CF;
    --hairline-dark: rgba(255,255,255,0.15);
    --ink:           #001E2B;
    --charcoal:      #1C2D38;
    --slate:         #3D4F58;
    --steel:         #5C6E76;
    --stone:         #8A9DA6;
    --muted:         #B8C8CE;
    --on-dark:       #FFFFFF;
    --on-dark-muted: rgba(255,255,255,0.65);
    --on-primary:    #001E2B;
    --warn-bg:       #FEF9E7;
    --warn-text:     #7A5C00;
    --shadow-1:      0 1px 2px rgba(0,30,43,0.04);
    --shadow-2:      0 4px 12px rgba(0,30,43,0.08);
    --shadow-3:      0 12px 24px -4px rgba(0,30,43,0.12);
    --shadow-4:      0 16px 48px -8px rgba(0,30,43,0.16);
    --r-xs:          4px;
    --r-sm:          6px;
    --r-md:          8px;
    --r-lg:          12px;
    --r-xl:          16px;
    --r-xxl:         24px;
    --r-full:        9999px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', -apple-system, sans-serif; background: var(--surface); color: var(--ink); -webkit-font-smoothing: antialiased; }

  .btn { display: inline-flex; align-items: center; gap: 6px; border-radius: var(--r-full); font-family: inherit; font-size: 14px; font-weight: 600; line-height: 1.3; cursor: pointer; border: none; transition: opacity .15s, box-shadow .15s; white-space: nowrap; }
  .btn:disabled { opacity: .45; cursor: not-allowed; }
  .btn-primary    { background: var(--green); color: var(--on-primary); padding: 10px 22px; }
  .btn-primary:hover:not(:disabled) { box-shadow: 0 0 0 3px rgba(0,237,100,.25); }
  .btn-secondary  { background: transparent; color: var(--ink); border: 1px solid var(--hairline-str); padding: 10px 22px; }
  .btn-on-dark    { background: var(--green); color: var(--on-primary); padding: 10px 22px; }
  .btn-sec-dark   { background: transparent; color: var(--on-dark); border: 1px solid var(--hairline-dark); padding: 10px 22px; }
  .btn-ghost      { background: transparent; color: var(--ink); padding: 8px 12px; border-radius: var(--r-md); }
  .btn-danger     { background: #FDE8E8; color: #C0392B; padding: 7px 14px; font-size: 13px; }
  .btn-sm         { padding: 6px 14px; font-size: 13px; }

  .badge { display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-radius: var(--r-full); padding: 4px 10px; white-space: nowrap; }
  .badge-green     { background: var(--green); color: var(--on-primary); }
  .badge-green-soft{ background: var(--green-soft); color: var(--green-dark); }
  .badge-popular   { background: var(--teal-deep); color: var(--green); border-radius: var(--r-full); }
  .badge-pending   { background: #FEF3C7; color: #92400E; border-radius: var(--r-sm); }
  .badge-washing   { background: #DBEAFE; color: #1D4ED8; border-radius: var(--r-sm); }
  .badge-drying    { background: #E0E7FF; color: #3730A3; border-radius: var(--r-sm); }
  .badge-ironing   { background: #EDE9FE; color: #5B21B6; border-radius: var(--r-sm); }
  .badge-ready     { background: #D1FAE5; color: #065F46; border-radius: var(--r-sm); }
  .badge-completed { background: #DCFCE7; color: #14532D; border-radius: var(--r-sm); }
  .badge-cancelled { background: #FEE2E2; color: #991B1B; border-radius: var(--r-sm); }
  .badge-lunas     { background: #D1FAE5; color: #065F46; border-radius: var(--r-sm); }
  .badge-belum     { background: #FEE2E2; color: #991B1B; border-radius: var(--r-sm); }
  .badge-dp        { background: #FEF3C7; color: #92400E; border-radius: var(--r-sm); }

  .app-shell  { display: flex; min-height: 100vh; }
  .main-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar { height: 64px; background: var(--canvas); border-bottom: 1px solid var(--hairline); display: flex; align-items: center; padding: 0 28px; gap: 16px; flex-shrink: 0; position: sticky; top: 0; z-index: 10; }
  .topbar-brand { font-size: 17px; font-weight: 700; color: var(--teal-deep); letter-spacing: -0.3px; display: flex; align-items: center; gap: 8px; }
  .topbar-dot { width: 8px; height: 8px; background: var(--green); border-radius: 50%; }
  .topbar-nav { display: flex; gap: 4px; flex: 1; margin-left: 24px; }
  .topbar-nav button { background: none; border: none; padding: 6px 12px; font-size: 14px; color: var(--steel); cursor: pointer; border-radius: var(--r-md); font-family: inherit; font-weight: 500; }
  .topbar-nav button:hover { color: var(--ink); background: var(--surface); }
  .topbar-nav button.active { color: var(--ink); font-weight: 600; }
  .topbar-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
  .role-pill { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: var(--surface); color: var(--steel); padding: 4px 10px; border-radius: var(--r-full); }

  .main { flex: 1; padding: 32px 28px; overflow-y: auto; background: var(--surface); }

  .hero-band { background: var(--teal-deep); color: var(--on-dark); padding: 48px 28px 64px; position: relative; }
  .hero-eyebrow { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--green); margin-bottom: 12px; }
  .hero-title { font-size: 40px; font-weight: 500; line-height: 1.15; letter-spacing: -0.5px; color: var(--on-dark); max-width: 520px; }
  .hero-sub { font-size: 16px; color: var(--on-dark-muted); margin-top: 12px; max-width: 420px; line-height: 1.55; }
  .hero-actions { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
  .hero-stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 24px; max-width: 380px; }
  .hero-stat { background: var(--teal-mid); border-radius: var(--r-lg); padding: 16px 18px; border: 1px solid rgba(255,255,255,.08); }
  .hero-stat-label { font-size: 11px; color: var(--on-dark-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 6px; }
  .hero-stat-value { font-size: 28px; font-weight: 500; color: var(--on-dark); letter-spacing: -0.5px; }
  .hero-stat-value.green { color: var(--green); }

  .floating-cards { max-width: 1200px; margin: -32px auto 0; padding: 0 28px; position: relative; z-index: 2; }
  .stat-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
  .stat-card { background: var(--canvas); border-radius: var(--r-lg); padding: 18px 20px; border: 1px solid var(--hairline); box-shadow: var(--shadow-2); }
  .stat-card-label { font-size: 12px; color: var(--steel); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
  .stat-card-value { font-size: 28px; font-weight: 500; color: var(--ink); letter-spacing: -0.5px; }
  .stat-card-value.green { color: var(--green-dark); }
  .stat-card-value.amber { color: #D97706; }

  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
  .page-title { font-size: 28px; font-weight: 500; color: var(--ink); letter-spacing: -0.5px; }
  .page-sub { font-size: 14px; color: var(--steel); margin-top: 4px; }

  .card { background: var(--canvas); border-radius: var(--r-lg); padding: 20px; border: 1px solid var(--hairline); margin-bottom: 16px; }
  .card-lg { padding: 28px; }
  .card-title { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 16px; letter-spacing: -0.2px; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 10px 14px; background: var(--surface); color: var(--steel); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--hairline); white-space: nowrap; }
  td { padding: 12px 14px; border-bottom: 1px solid var(--hairline-soft); color: var(--charcoal); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--surface-soft); }

  .tabs { display: flex; gap: 4px; margin-bottom: 16px; background: var(--surface); border-radius: var(--r-full); padding: 4px; width: fit-content; }
  .tab { padding: 7px 18px; border-radius: var(--r-full); font-size: 13px; font-weight: 500; cursor: pointer; color: var(--steel); border: none; background: none; font-family: inherit; transition: background .15s, color .15s; }
  .tab.active { background: var(--ink); color: var(--on-dark); }

  .search-wrap { margin-bottom: 14px; }
  .search-input { height: 44px; width: 100%; max-width: 360px; padding: 0 14px; border: 1px solid var(--hairline-str); border-radius: var(--r-md); font-size: 14px; font-family: inherit; background: var(--canvas); color: var(--ink); outline: none; transition: border-color .15s; }
  .search-input:focus { border: 2px solid var(--green-dark); }
  .search-input::placeholder { color: var(--stone); }

  .field { margin-bottom: 14px; }
  .field label { display: block; font-size: 13px; font-weight: 500; color: var(--slate); margin-bottom: 5px; }
  .field input, .field select, .field textarea { width: 100%; height: 44px; padding: 0 14px; border: 1px solid var(--hairline-str); border-radius: var(--r-md); font-size: 14px; font-family: inherit; background: var(--canvas); color: var(--ink); outline: none; transition: border-color .15s; }
  .field input:focus, .field select:focus, .field textarea:focus { border: 2px solid var(--green-dark); }
  .field textarea { height: auto; padding: 10px 14px; resize: vertical; min-height: 80px; }
  .field .err { font-size: 12px; color: #C0392B; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
  .field .err::before { content: '⚠'; font-size: 11px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .alert { padding: 11px 14px; border-radius: var(--r-md); font-size: 13px; margin-bottom: 14px; border-left: 3px solid; }
  .alert-success { background: var(--green-soft); border-color: var(--green-dark); color: var(--green-dark); }
  .alert-error   { background: #FEE2E2; border-color: #C0392B; color: #7F1D1D; }
  .alert-info    { background: #EFF6FF; border-color: #2563EB; color: #1D4ED8; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,30,43,.45); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; backdrop-filter: blur(2px); }
  .modal { background: var(--canvas); border-radius: var(--r-xl); padding: 28px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-4); }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
  .modal-title { font-size: 20px; font-weight: 600; color: var(--ink); letter-spacing: -0.3px; }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--hairline); }

  .auth-shell { min-height: 100vh; display: flex; }
  .auth-left { flex: 1; background: var(--teal-deep); display: flex; flex-direction: column; justify-content: center; padding: 64px; }
  .auth-left-title { font-size: 42px; font-weight: 500; color: var(--on-dark); letter-spacing: -1px; line-height: 1.15; }
  .auth-left-sub { font-size: 16px; color: var(--green); margin-top: 12px; font-weight: 500; }
  .auth-left-desc { margin-top: 16px; font-size: 14px; color: var(--on-dark-muted); line-height: 1.6; }
  .auth-code-card { margin-top: 36px; background: var(--canvas-dark); border-radius: var(--r-lg); padding: 18px 20px; border: 1px solid rgba(255,255,255,.08); box-shadow: var(--shadow-3); font-family: 'Source Code Pro', monospace; font-size: 12px; color: var(--on-dark-muted); line-height: 1.7; }
  .code-green { color: var(--green); }
  .code-blue  { color: #79C0FF; }
  .code-white { color: var(--on-dark); }
  .auth-right { width: 480px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--surface); padding: 32px; }
  .auth-card { width: 100%; background: var(--canvas); border-radius: var(--r-xl); padding: 36px; border: 1px solid var(--hairline); box-shadow: var(--shadow-2); }
  .auth-title { font-size: 26px; font-weight: 600; color: var(--teal-deep); letter-spacing: -0.5px; margin-bottom: 4px; }
  .auth-sub { font-size: 14px; color: var(--steel); margin-bottom: 24px; }
  .auth-link-row { text-align: center; margin-top: 14px; font-size: 14px; color: var(--steel); }
  .auth-link-row button { background: none; border: none; color: var(--green-dark); font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }

  .role-page { min-height: 100vh; background: var(--teal-deep); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
  .role-title { font-size: 48px; font-weight: 500; color: var(--on-dark); text-align: center; letter-spacing: -1px; line-height: 1.1; }
  .role-sub { font-size: 18px; color: var(--on-dark-muted); text-align: center; margin-top: 12px; margin-bottom: 52px; }
  .role-cards { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; }
  .role-card { background: var(--teal-mid); border-radius: var(--r-xl); padding: 36px 32px; text-align: center; width: 280px; border: 1px solid var(--hairline-dark); cursor: pointer; transition: transform .2s, border-color .2s, box-shadow .2s; }
  .role-card:hover { transform: translateY(-4px); border-color: var(--green); box-shadow: 0 0 0 1px var(--green), var(--shadow-3); }
  .role-card-emoji { font-size: 40px; margin-bottom: 18px; }
  .role-card-name { font-size: 18px; font-weight: 600; color: var(--on-dark); margin-bottom: 10px; letter-spacing: -0.2px; }
  .role-card-desc { font-size: 13px; color: var(--on-dark-muted); line-height: 1.6; margin-bottom: 20px; }
  .role-card-cta { font-size: 13px; font-weight: 600; color: var(--green); }

  .info-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--hairline-soft); font-size: 14px; }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: var(--steel); font-size: 13px; }
  .info-value { font-weight: 500; color: var(--ink); }

  .pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .pricing-card { background: var(--canvas); border-radius: var(--r-lg); padding: 28px; border: 1px solid var(--hairline); }
  .pricing-card.featured { background: var(--surface-feat); border: 2px solid var(--green); }
  .pricing-price { font-size: 40px; font-weight: 500; color: var(--ink); letter-spacing: -1px; margin: 12px 0; }

  .cta-band { background: var(--teal-deep); padding: 48px 28px; margin-top: 32px; border-radius: var(--r-lg); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
  .cta-band-title { font-size: 24px; font-weight: 500; color: var(--on-dark); letter-spacing: -0.3px; }
  .cta-band-sub { font-size: 14px; color: var(--on-dark-muted); margin-top: 4px; }

  .inline-select { border: 1px solid var(--hairline); border-radius: var(--r-full); padding: 4px 10px; font-size: 12px; font-weight: 600; background: var(--surface); color: var(--ink); cursor: pointer; font-family: inherit; outline: none; }
  .inline-select:focus { border-color: var(--green-dark); }

  .nav-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; margin-top: 20px; }
  .nav-card { background: var(--canvas); border-radius: var(--r-lg); padding: 20px; border: 1px solid var(--hairline); cursor: pointer; display: flex; align-items: center; gap: 16px; transition: transform .15s, box-shadow .15s; }
  .nav-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-2); }
  .nav-card-icon { width: 48px; height: 48px; border-radius: var(--r-lg); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
  .nav-card-title { font-weight: 600; font-size: 15px; color: var(--ink); }
  .nav-card-desc { font-size: 12px; color: var(--steel); margin-top: 3px; }

  .activity-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--hairline-soft); }
  .activity-item:last-child { border-bottom: none; }

  .empty { text-align: center; padding: 48px 20px; color: var(--steel); }
  .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: .6; }
  .empty-text { font-size: 14px; }

  .loading-wrap { display: flex; align-items: center; justify-content: center; padding: 48px; color: var(--stone); font-size: 14px; gap: 10px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { width: 20px; height: 20px; border: 2px solid var(--hairline); border-top-color: var(--green-dark); border-radius: 50%; animation: spin .7s linear infinite; }

  @media (max-width: 768px) {
    .auth-left { display: none; }
    .auth-right { width: 100%; }
    .stat-row { grid-template-columns: repeat(2,1fr); }
    .two-col { grid-template-columns: 1fr; }
    .pricing-grid { grid-template-columns: 1fr; }
    .main { padding: 20px 16px; }
    .hero-title { font-size: 28px; }
  }
`;

// ── COMPONENTS ────────────────────────────────────────────────

function Spinner() {
  return <div className="loading-wrap"><div className="spinner"/><span>Loading...</span></div>;
}

function StatusBadge({ s }) {
  const map = { "PENDING":"badge-pending","WASHING":"badge-washing","DRYING":"badge-drying","IRONING":"badge-ironing","READY":"badge-ready","COMPLETED":"badge-completed","CANCELLED":"badge-cancelled","Lunas":"badge-lunas","Belum Bayar":"badge-belum","DP":"badge-dp" };
  return <span className={"badge " + (map[s]||"badge-pending")}>{s}</span>;
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{fontSize:16}}>✕</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function Topbar({ role, setPage, active }) {
  const { setCurrentUser } = useApp();
  const isAdmin = role === "admin";

  const nav = isAdmin
    ? [{ label: "Dashboard", page: "admin-dashboard" }, { label: "Transaksi", page: "admin-transactions" }, { label: "Pelanggan", page: "admin-customers" }, { label: "Layanan", page: "admin-services" }]
    : [{ label: "Dashboard", page: "user-dashboard" }, { label: "Pesanan", page: "user-orders" }, { label: "Profil", page: "user-profile" }];

  return (
    <div className="topbar">
      <div className="topbar-brand"><div className="topbar-dot" /> SL</div>
      <nav className="topbar-nav">
        {nav.map((n) => (<button key={n.page} onClick={() => setPage(n.page)} className={active === n.page ? "active" : ""}>{n.label}</button>))}
      </nav>
      <div className="topbar-actions">
        <span className="role-pill">{isAdmin ? "ADMIN" : "USER"}</span>
        {!isAdmin && (<button className="btn btn-primary btn-sm" onClick={() => setPage("user-new-order")}>+ Pesanan Baru</button>)}
        <button className="btn btn-ghost btn-sm" onClick={() => { authService.logout(); setCurrentUser(null); setPage("role"); }}>Logout</button>
      </div>
    </div>
  );
}

// ── AUTH PAGES ────────────────────────────────────────────────

function RolePage({ setPage }) {
  return (
    <div className="role-page">
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:36}}><span className="sidebar-logo-dot" style={{width:12,height:12}}/>
        <span style={{fontSize:18,fontWeight:700,color:"var(--on-dark)"}}>SL</span></div>
      <div className="role-title">One platform.<br/>Unlimited laundry ops.</div>
      <p className="role-sub">Select your role to continue</p>
      <div className="role-cards">
        <div className="role-card" onClick={()=>setPage("login-user")}>
          <div className="role-card-emoji">👤</div>
          <div className="role-card-name">Continue as User</div>
          <p className="role-card-desc">Buat pesanan, lacak laundry, dan kelola akun Anda dengan mudah</p>
          <span className="role-card-cta">Get Started →</span>
        </div>
        <div className="role-card" onClick={()=>setPage("login-admin")}>
          <div className="role-card-emoji">🛡️</div>
          <div className="role-card-name">Continue as Admin</div>
          <p className="role-card-desc">Kelola transaksi, pelanggan, layanan, dan monitor performa bisnis</p>
          <span className="role-card-cta">Get Started →</span>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ role, setPage }) {
  const { setCurrentUser } = useApp();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [apiErr, setApiErr]   = useState("");
  const isAdmin = role === "admin";

  const validate = () => {
    const e={};
    if (!email.trim())              e.email    = "Username/Email wajib diisi";
    if (!password)                  e.password = "Password wajib diisi";
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if(Object.keys(e).length){setErrors(e);return;}
    setErrors({}); setApiErr(""); setLoading(true);
    try {
      const res = await authService.login({ username: email, password });
      authService.saveAuth(res);
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      const userRole = (res.role || user?.role || "").toLowerCase();
      setPage(userRole === "admin" ? "admin-dashboard" : "user-dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Email atau password salah.";
      setApiErr(typeof msg === "string" ? msg : "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:40}}>
          <span className="sidebar-logo-dot" style={{width:12,height:12}}/>
          <span style={{fontSize:18,fontWeight:700,color:"var(--on-dark)"}}>SL</span>
        </div>
        <div className="auth-left-title">Laundry Management<br/>System</div>
        <div className="auth-left-sub">One platform. Unlimited laundry operations.</div>
        <div className="auth-left-desc">Manage customers, transactions, services &amp; reports in one place.</div>
        <div className="auth-code-card">
          <div><span className="code-green">const</span> <span className="code-blue">order</span> <span className="code-white">= await laundry</span></div>
          <div style={{paddingLeft:16}}><span className="code-white">.createOrder(&#123;</span></div>
          <div style={{paddingLeft:32}}><span className="code-blue">service</span><span className="code-white">: </span><span style={{color:"#A8FF78"}}>"Cuci Express"</span><span className="code-white">,</span></div>
          <div style={{paddingLeft:32}}><span className="code-blue">weight</span><span className="code-white">: 3,</span></div>
          <div style={{paddingLeft:32}}><span className="code-blue">status</span><span className="code-white">: </span><span style={{color:"#A8FF78"}}>"PENDING"</span></div>
          <div style={{paddingLeft:16}}><span className="code-white">&#125;);</span></div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-title">Welcome back{isAdmin?" — Admin":""}</h2>
          <p className="auth-sub">Sign in to continue</p>
          <div className="alert alert-info" style={{fontSize:12,marginBottom:18}}>
            <b>Demo:</b> Gunakan username & password dari backend Anda
          </div>
          {apiErr && <div className="alert alert-error">{apiErr}</div>}
          <div className="field">
            <label>Username / Email</label>
            <input type="text" placeholder="Username atau email" value={email} onChange={e=>{setEmail(e.target.value);setErrors(v=>({...v,email:""}));}} />
            {errors.email && <div className="err">{errors.email}</div>}
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Masukkan password" value={password} onChange={e=>{setPassword(e.target.value);setErrors(v=>({...v,password:""}));}} />
            {errors.password && <div className="err">{errors.password}</div>}
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
          {!isAdmin && <div className="auth-link-row">Don't have account? <button onClick={()=>setPage("register")}>Register</button></div>}
          <div className="auth-link-row"><button onClick={()=>setPage("role")} style={{color:"var(--steel)"}}>← Back</button></div>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ setPage }) {
  const [form, setForm] = useState({name:"",email:"",phone:"",password:"",confirm:""});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [apiErr, setApiErr]   = useState("");
  const upd = k => e => {setForm(f=>({...f,[k]:e.target.value}));setErrors(v=>({...v,[k]:""}));};

  const validate = () => {
    const e={};
    if(!form.name.trim())             e.name     = "Nama wajib diisi";
    if(!form.email.trim())            e.email    = "Email wajib diisi";
    else if(!validateEmail(form.email)) e.email  = "Format email tidak valid";
    if(!form.phone.trim())            e.phone    = "No. HP wajib diisi";
    if(!form.password)                e.password = "Password wajib diisi";
    else if(form.password.length<6)   e.password = "Password minimal 6 karakter";
    if(form.password!==form.confirm)  e.confirm  = "Password tidak cocok";
    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setApiErr("");
    try {
      await authService.register({username:form.email,email:form.email,password:form.password,name:form.name,phone:form.phone});
      setSuccess("Registrasi berhasil! Silakan login.");
      setTimeout(() => setPage("login-user"), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Registrasi gagal. Coba lagi.";
      setApiErr(typeof msg === "string" ? msg : "Registrasi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:40}}>
          <span className="sidebar-logo-dot" style={{width:12,height:12}}/>
          <span style={{fontSize:18,fontWeight:700,color:"var(--on-dark)"}}>SL</span>
        </div>
        <div className="auth-left-title">Create Business<br/>Account</div>
        <div className="auth-left-sub">Laundry Management System</div>
        <div className="auth-left-desc">Register your laundry account and start managing operations today.</div>
      </div>
      <div className="auth-right" style={{width:520}}>
        <div className="auth-card" style={{maxWidth:460}}>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-sub">Join our laundry platform</p>
          {success && <div className="alert alert-success">{success}</div>}
          {apiErr  && <div className="alert alert-error">{apiErr}</div>}
          <div className="two-col">
            <div className="field"><label>Nama Lengkap</label><input placeholder="Ahmad Rizky" value={form.name} onChange={upd("name")}/>{errors.name&&<div className="err">{errors.name}</div>}</div>
            <div className="field"><label>Email</label><input type="email" placeholder="you@example.com" value={form.email} onChange={upd("email")}/>{errors.email&&<div className="err">{errors.email}</div>}</div>
            <div className="field"><label>No. HP</label><input placeholder="08123456789" value={form.phone} onChange={upd("phone")}/>{errors.phone&&<div className="err">{errors.phone}</div>}</div>
            <div className="field"><label>Password</label><input type="password" placeholder="Min. 6 karakter" value={form.password} onChange={upd("password")}/>{errors.password&&<div className="err">{errors.password}</div>}</div>
            <div className="field" style={{gridColumn:"1/-1"}}><label>Konfirmasi Password</label><input type="password" placeholder="Ulangi password" value={form.confirm} onChange={upd("confirm")}/>{errors.confirm&&<div className="err">{errors.confirm}</div>}</div>
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={handleRegister} disabled={loading}>
            {loading?"Registering…":"Register"}
          </button>
          <div className="auth-link-row">Already have account? <button onClick={()=>setPage("login-user")}>Login</button></div>
        </div>
      </div>
    </div>
  );
}

// ── USER PAGES ────────────────────────────────────────────────

function UserDashboard({ setPage }) {
  const { currentUser } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionService.getTransactions(undefined,undefined,undefined,0,100)
      .then(res => {
        const list = Array.isArray(res) ? res : (res.content || []);
        setOrders(list);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const mine    = orders.filter(o => o.customerId === currentUser?.id);
  const pending = mine.filter(o => !["COMPLETED","CANCELLED"].includes(o.status)).length;
  const unpaid  = mine.filter(o => ["Belum Bayar"].includes(o.paymentStatus)).length;
  const revenue = mine.filter(o => ["Lunas"].includes(o.paymentStatus)).reduce((s,o)=>s+(o.totalPrice||0),0);
  const recent  = [...mine].sort((a,b) => (b.id > a.id ? 1 : -1)).slice(0,4);

  return (
    <div className="app-shell">
      <div className="main-wrap">
        <Topbar role="user" setPage={setPage} active="user-dashboard"/>
        <div className="main" style={{padding:0}}>
          <div className="hero-band">
            <div style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr auto",gap:40,alignItems:"start"}}>
              <div>
                <div className="hero-eyebrow">User Dashboard</div>
                <h1 className="hero-title">Laundry Operations<br/>Overview</h1>
                <p className="hero-sub">Real-time status pesanan dan aktivitas laundry Anda.</p>
                <div className="hero-actions">
                  <button className="btn btn-on-dark" onClick={()=>setPage("user-new-order")}>+ Buat Pesanan</button>
                  <button className="btn btn-sec-dark" onClick={()=>setPage("user-orders")}>Lihat Semua →</button>
                </div>
              </div>
              <div className="hero-stats-row">
                <div className="hero-stat"><div className="hero-stat-label">Total Pesanan</div><div className="hero-stat-value">{mine.length}</div></div>
                <div className="hero-stat"><div className="hero-stat-label">Aktif</div><div className="hero-stat-value green">{pending}</div></div>
                <div className="hero-stat"><div className="hero-stat-label">Belum Bayar</div><div className="hero-stat-value" style={{color:"#F59E0B"}}>{unpaid}</div></div>
                <div className="hero-stat"><div className="hero-stat-label">Total Bayar</div><div className="hero-stat-value green" style={{fontSize:18,paddingTop:2}}>{formatRp(revenue)}</div></div>
              </div>
            </div>
          </div>

          <div style={{padding:"28px 28px 0",maxWidth:1100,margin:"0 auto"}}>
            {loading ? <Spinner/> : recent.length>0 && (
              <div className="card card-lg">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div className="card-title" style={{margin:0}}>Recent Activity</div>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setPage("user-orders")}>View All →</button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Layanan</th><th>Tanggal</th><th>Status</th><th>Pembayaran</th><th>Total</th></tr></thead>
                    <tbody>{recent.map(o=>(
                      <tr key={o.id}>
                        <td><div style={{fontWeight:500}}>{o.serviceName}</div><div style={{fontSize:12,color:"var(--steel)"}}>{o.weight} kg</div></td>
                        <td style={{color:"var(--steel)"}}>{o.createdAt?.slice(0,10)}</td>
                        <td><StatusBadge s={o.status}/></td>
                        <td><StatusBadge s={o.paymentStatus}/></td>
                        <td style={{fontWeight:600}}>{formatRp(o.totalPrice)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="nav-grid">
              {[{icon:"🧺",title:"Pesanan Saya",desc:"Lihat riwayat & status pesanan",bg:"#E3FCF7",page:"user-orders"},{icon:"➕",title:"Buat Pesanan",desc:"Ajukan laundry baru",bg:"#EFF6FF",page:"user-new-order"}].map(c=>(
                <div key={c.title} className="nav-card" onClick={()=>setPage(c.page)}>
                  <div className="nav-card-icon" style={{background:c.bg}}>{c.icon}</div>
                  <div><div className="nav-card-title">{c.title}</div><div className="nav-card-desc">{c.desc}</div></div>
                </div>
              ))}
            </div>

            <div className="cta-band">
              <div><div className="cta-band-title">Ready to submit more laundry?</div><div className="cta-band-sub">Optimize your laundry workflow today.</div></div>
              <button className="btn btn-on-dark" onClick={()=>setPage("user-new-order")}>Create Transaction</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserOrders({ setPage }) {
  const { currentUser } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Semua");

  useEffect(() => {
    transactionService.getTransactions(undefined,undefined,undefined,0,100)
      .then(res => {
        const list = Array.isArray(res) ? res : (res.content || []);
        setOrders(list);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const mine = orders.filter(o => o.customerId === currentUser?.id);
  const filtered = tab === "Semua" ? mine : mine.filter(o => o.status === tab);

  return (
    <div className="app-shell">
      <div className="main-wrap">
        <Topbar role="user" setPage={setPage} active="user-orders"/>
        <div className="main">
          <div className="page-header">
            <div><div className="page-title">Pesanan Saya</div><div className="page-sub">Riwayat dan status semua pesanan Anda</div></div>
            <button className="btn btn-primary" onClick={()=>setPage("user-new-order")}>+ Buat Pesanan</button>
          </div>
          <div className="tabs">
            {["Semua","PENDING","WASHING","READY","COMPLETED"].map(t=>(
              <button key={t} className={"tab"+(tab===t?" active":"")} onClick={()=>setTab(t)}>{t}</button>
            ))}
          </div>
          <div className="card">
            {loading ? <Spinner/> : filtered.length===0 ? (
              <div className="empty"><div className="empty-icon">🧺</div><div className="empty-text">Tidak ada pesanan</div></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Layanan</th><th>Berat</th><th>Total</th><th>Status</th><th>Pembayaran</th><th>Est. Selesai</th></tr></thead>
                  <tbody>{[...filtered].sort((a,b)=>b.id>a.id?-1:1).map(o=>(
                    <tr key={o.id}>
                      <td style={{color:"var(--stone)",fontSize:12,fontFamily:"'Source Code Pro',monospace"}}>#{String(o.id).slice(-6)}</td>
                      <td><div style={{fontWeight:500}}>{o.serviceName}</div>{o.notes&&<div style={{fontSize:11,color:"var(--steel)"}}>{o.notes}</div>}</td>
                      <td>{o.weight} kg</td>
                      <td style={{fontWeight:600}}>{formatRp(o.totalPrice)}</td>
                      <td><StatusBadge s={o.status}/></td>
                      <td><StatusBadge s={o.paymentStatus}/></td>
                      <td style={{color:"var(--steel)",fontSize:13}}>{o.estimatedDone?.slice(0,10)||"-"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserNewOrder({ setPage }) {
  const { currentUser } = useApp();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({serviceId:"",weight:"",notes:""});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState("");
  const upd = k => e => {setForm(f=>({...f,[k]:e.target.value}));setErrors(v=>({...v,[k]:""}));};

  useEffect(() => {
    laundryService.getAllServices().then(r=>setServices(Array.isArray(r)?r:(r.content||[]))).catch(()=>setServices([]));
  }, []);

  const svc = services.find(s => String(s.id) === String(form.serviceId));
  const total = svc && form.weight ? svc.price * Number(form.weight) : 0;

  const validate = () => {
    const e={};
    if(!form.serviceId) e.serviceId="Pilih layanan";
    if(!form.weight) e.weight="Berat wajib diisi";
    else if(isNaN(form.weight)||Number(form.weight)<=0) e.weight="Berat harus angka positif";
    else if(Number(form.weight)>50) e.weight="Berat maksimal 50 kg";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if(Object.keys(e).length){setErrors(e);return;}
    setLoading(true); setApiErr("");
    try {
      await transactionService.createTransaction({customerId:currentUser?.id,serviceId:svc.id,weight:Number(form.weight),notes:form.notes});
      setSuccess("Pesanan berhasil dibuat!");
      setForm({serviceId:"",weight:"",notes:""});
      setTimeout(()=>{setSuccess("");setPage("user-orders");},1500);
    } catch(err) {
      const msg = err?.response?.data?.message || "Gagal membuat pesanan.";
      setApiErr(typeof msg === "string" ? msg : "Gagal membuat pesanan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="main-wrap">
        <Topbar role="user" setPage={setPage} active="user-new-order"/>
        <div className="main">
          <div className="page-header">
            <div><div className="page-title">New Transaction</div><div className="page-sub">Ajukan laundry baru Anda</div></div>
          </div>
          {success && <div className="alert alert-success">{success}</div>}
          {apiErr  && <div className="alert alert-error">{apiErr}</div>}
          <div className="card card-lg" style={{maxWidth:540}}>
            <div className="field">
              <label>Service</label>
              <select value={form.serviceId} onChange={upd("serviceId")}>
                <option value="">-- Select Service --</option>
                {services.map(s=><option key={s.id} value={s.id}>{s.name} — {formatRp(s.price)}/{s.unit} ({s.duration})</option>)}
              </select>
              {errors.serviceId && <div className="err">{errors.serviceId}</div>}
            </div>
            <div className="field">
              <label>Berat (kg)</label>
              <input type="number" placeholder="3" min="0.1" max="50" step="0.1" value={form.weight} onChange={upd("weight")}/>
              {errors.weight && <div className="err">{errors.weight}</div>}
            </div>
            <div className="field">
              <label>Notes (opsional)</label>
              <textarea placeholder="Pisahkan baju putih, dll." value={form.notes} onChange={upd("notes")}/>
            </div>
            {total>0 && (
              <div style={{background:"var(--surface-feat)",borderRadius:"var(--r-md)",padding:"14px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid var(--green)"}}>
                <span style={{fontSize:13,color:"var(--green-dark)",fontWeight:600}}>Estimasi Total</span>
                <span style={{fontSize:22,fontWeight:600,color:"var(--green-dark)",letterSpacing:"-0.5px"}}>{formatRp(total)}</span>
              </div>
            )}
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-secondary" onClick={()=>setPage("user-dashboard")}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading?"Submitting…":"Create Transaction"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserProfile({ setPage }) {
  const { currentUser } = useApp();
  return (
    <div className="app-shell">
      <div className="main-wrap">
        <Topbar role="user" setPage={setPage}/>
        <div className="main">
          <div className="page-header"><div><div className="page-title">Profil Saya</div><div className="page-sub">Informasi akun Anda</div></div></div>
          <div className="card card-lg" style={{maxWidth:480}}>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24,paddingBottom:20,borderBottom:"1px solid var(--hairline)"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:"var(--teal-deep)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"var(--green)"}}>
                {(currentUser?.name||currentUser?.username||"U")[0].toUpperCase()}
              </div>
              <div>
                <div style={{fontWeight:600,fontSize:18,color:"var(--ink)",letterSpacing:"-0.3px"}}>{currentUser?.name||currentUser?.username}</div>
                <span className="badge badge-green-soft" style={{marginTop:4}}>USER</span>
              </div>
            </div>
            {[["Email",currentUser?.username||currentUser?.email],["Phone",currentUser?.phone],["Room",currentUser?.room],["Building",currentUser?.building],["Bag No.",currentUser?.bagNumber]].map(([l,v])=>(
              <div key={l} className="info-row"><span className="info-label">{l}</span><span className="info-value">{v||"-"}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN PAGES ───────────────────────────────────────────────

function AdminDashboard({ setPage }) {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      transactionService.getTransactions(undefined,undefined,undefined,0,100),
      customerService.getAllCustomers(),
    ]).then(([trxRes, custRes]) => {
      setOrders(Array.isArray(trxRes) ? trxRes : (trxRes.content || []));
      setCustomers(Array.isArray(custRes) ? custRes : (custRes.content || []));
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const revenue = orders.filter(o=>["Lunas"].includes(o.paymentStatus)).reduce((s,o)=>s+(o.totalPrice||0),0);
  const active  = orders.filter(o=>!["COMPLETED","CANCELLED"].includes(o.status)).length;
  const pending = orders.filter(o=>o.status==="PENDING").length;
  const recent  = [...orders].sort((a,b)=>b.id>a.id?-1:1).slice(0,5);

  return (
    <div className="app-shell">
      <div className="main-wrap">
        <Topbar role="admin" setPage={setPage} active="admin-dashboard"/>
        <div className="main" style={{padding:0}}>
          <div className="hero-band">
            <div style={{maxWidth:1100,margin:"0 auto"}}>
              <div className="hero-eyebrow">Admin Panel</div>
              <h1 className="hero-title">Laundry Operations<br/>Dashboard</h1>
              <p className="hero-sub">Real-time overview of your business performance, transactions, and customer activity.</p>
              <div className="hero-actions">
                <button className="btn btn-on-dark" onClick={()=>setPage("admin-transactions")}>+ New Transaction</button>
                <button className="btn btn-sec-dark" onClick={()=>setPage("admin-customers")}>View Customers</button>
              </div>
            </div>
          </div>

          <div className="floating-cards" style={{maxWidth:1100}}>
            <div className="stat-row">
              <div className="stat-card"><div className="stat-card-label">Revenue</div><div className="stat-card-value green">{formatRp(revenue)}</div><div style={{fontSize:12,color:"var(--stone)",marginTop:4}}>Lunas orders</div></div>
              <div className="stat-card"><div className="stat-card-label">Transactions</div><div className="stat-card-value">{orders.length}</div></div>
              <div className="stat-card"><div className="stat-card-label">Active</div><div className="stat-card-value amber">{active}</div></div>
              <div className="stat-card"><div className="stat-card-label">Customers</div><div className="stat-card-value">{customers.length}</div></div>
            </div>
          </div>

          <div style={{padding:"24px 28px 32px",maxWidth:1100,margin:"0 auto"}}>
            {loading ? <Spinner/> : (
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
                <div className="card card-lg">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div className="card-title" style={{margin:0}}>Recent Activity</div>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setPage("admin-transactions")}>View All →</button>
                  </div>
                  {recent.map(o=>(
                    <div key={o.id} className="activity-item">
                      <div>
                        <div style={{fontWeight:500,fontSize:14}}>TRX-{String(o.id).slice(-5)}</div>
                        <div style={{fontSize:12,color:"var(--steel)"}}>{o.customerName} · {o.serviceName}</div>
                      </div>
                      <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                        <StatusBadge s={o.status}/>
                        <span style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>{formatRp(o.totalPrice)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card card-lg">
                  <div className="card-title">System Health</div>
                  <p style={{fontSize:13,color:"var(--steel)",marginBottom:20}}>All systems running smoothly</p>
                  <div style={{marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--steel)",marginBottom:6}}><span>Backend Uptime</span><span style={{fontWeight:600,color:"var(--green-dark)"}}>99.2%</span></div>
                    <div style={{height:6,background:"var(--hairline)",borderRadius:99}}><div style={{height:6,background:"var(--green)",borderRadius:99,width:"99.2%"}}/></div>
                  </div>
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--steel)",marginBottom:6}}><span>Pending Orders</span><span style={{fontWeight:600,color:"#D97706"}}>{pending}</span></div>
                    <div style={{height:6,background:"var(--hairline)",borderRadius:99}}><div style={{height:6,background:"#FBBF24",borderRadius:99,width:`${orders.length?Math.min((pending/orders.length)*100,100):0}%`}}/></div>
                  </div>
                </div>
              </div>
            )}

            <div className="cta-band">
              <div><div className="cta-band-title">Ready to process more transactions?</div><div className="cta-band-sub">Optimize your laundry workflow today.</div></div>
              <button className="btn btn-on-dark" onClick={()=>setPage("admin-transactions")}>Create Transaction</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminTransactions({ setPage }) {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Semua");
  const [detail, setDetail] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newO, setNewO] = useState({customerId:"",serviceId:"",weight:"",notes:""});
  const [newErr, setNewErr] = useState({});
  const [saving, setSaving] = useState(false);

  const loadOrders = () => transactionService.getTransactions(undefined,undefined,undefined,0,200)
    .then(res => {
      const list = Array.isArray(res) ? res : (res.content || []);
      setOrders(list);
    });

  useEffect(() => {
    Promise.all([
      loadOrders(),
      customerService.getAllCustomers().then(r=>setCustomers(Array.isArray(r)?r:(r.content||[]))),
      laundryService.getAllServices().then(r=>setServices(Array.isArray(r)?r:(r.content||[]))),
    ]).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  let filtered = orders;
  if(tab!=="Semua") filtered = filtered.filter(o=>o.status===tab);
  if(search) filtered = filtered.filter(o=>(o.customerName||"").toLowerCase().includes(search.toLowerCase())||(o.serviceName||"").toLowerCase().includes(search.toLowerCase()));

  const updateStatus = async (id, status) => {
    try {
      await transactionService.updateTransaction(id, { status });
      setOrders(p=>p.map(o=>o.id===id?{...o,status}:o));
    } catch(e){ alert("Gagal update status"); }
  };

  const updatePayment = async (id, paymentStatus) => {
    try {
      await transactionService.updateTransaction(id, { paymentStatus });
      setOrders(p=>p.map(o=>o.id===id?{...o,paymentStatus}:o));
    } catch(e){ alert("Gagal update pembayaran"); }
  };

  const deleteOrder = async (id) => {
    if(!window.confirm("Hapus transaksi ini?")) return;
    try {
      await transactionService.deleteTransaction(id);
      setOrders(p=>p.filter(o=>o.id!==id));
    } catch(e){ alert("Gagal hapus transaksi"); }
  };

  const validateNew = () => {
    const e={};
    if(!newO.customerId) e.customerId="Pilih pelanggan";
    if(!newO.serviceId) e.serviceId="Pilih layanan";
    if(!newO.weight) e.weight="Berat wajib diisi";
    else if(isNaN(newO.weight)||Number(newO.weight)<=0) e.weight="Berat harus angka positif";
    return e;
  };

  const handleAdd = async () => {
    const e = validateNew();
    if(Object.keys(e).length){setNewErr(e);return;}
    setSaving(true);
    try {
      await transactionService.createTransaction({customerId:Number(newO.customerId),serviceId:Number(newO.serviceId),weight:Number(newO.weight),notes:newO.notes});
      await loadOrders();
      setNewO({customerId:"",serviceId:"",weight:"",notes:""}); setNewErr({}); setShowAdd(false);
    } catch(err) {
      alert("Gagal membuat transaksi");
    } finally {
      setSaving(false);
    }
  };

  const prevSvc = services.find(s=>String(s.id)===String(newO.serviceId));
  const prevTotal = prevSvc&&newO.weight&&!isNaN(newO.weight)&&Number(newO.weight)>0 ? prevSvc.price*Number(newO.weight) : 0;

  return (
    <div className="app-shell">
      <div className="main-wrap">
        <Topbar role="admin" setPage={setPage} active="admin-transactions"/>
        <div className="main">
          <div className="page-header">
            <div><div className="page-title">Transactions</div><div className="page-sub">Monitor dan kelola semua pesanan laundry</div></div>
            <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ New Transaction</button>
          </div>
          <div className="tabs">
            {["Semua","PENDING","WASHING","DRYING","IRONING","READY","COMPLETED"].map(t=>(
              <button key={t} className={"tab"+(tab===t?" active":"")} onClick={()=>setTab(t)}>{t}</button>
            ))}
          </div>
          <div className="search-wrap"><input className="search-input" placeholder="Search customer, service..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="card">
            {loading ? <Spinner/> : filtered.length===0 ? (
              <div className="empty"><div className="empty-icon">🧺</div><div className="empty-text">No transactions found</div></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>TRX ID</th><th>Customer</th><th>Service</th><th>Weight</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th><th>Actions</th></tr></thead>
                  <tbody>{[...filtered].sort((a,b)=>b.id>a.id?-1:1).map(o=>(
                    <tr key={o.id}>
                      <td style={{fontFamily:"'Source Code Pro',monospace",fontSize:12,color:"var(--stone)"}}>#{String(o.id).slice(-6)}</td>
                      <td><div style={{fontWeight:500}}>{o.customerName}</div></td>
                      <td>{o.serviceName}</td>
                      <td>{o.weight} kg</td>
                      <td style={{fontWeight:600}}>{formatRp(o.totalPrice)}</td>
                      <td><select className="inline-select" value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}>{ORDER_STATUSES.map(s=><option key={s}>{s}</option>)}</select></td>
                      <td><select className="inline-select" value={o.paymentStatus} onChange={e=>updatePayment(o.id,e.target.value)}>{PAYMENT_STATUSES.map(s=><option key={s}>{s}</option>)}</select></td>
                      <td style={{fontSize:12,color:"var(--steel)"}}>{o.createdAt?.slice(0,10)||"-"}</td>
                      <td><div style={{display:"flex",gap:6}}><button className="btn btn-ghost btn-sm" onClick={()=>setDetail(o)}>View</button><button className="btn btn-danger btn-sm" onClick={()=>deleteOrder(o.id)}>Del</button></div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>

          {detail && (
            <Modal title="Transaction Detail" onClose={()=>setDetail(null)} footer={<button className="btn btn-secondary" onClick={()=>setDetail(null)}>Close</button>}>
              {[["TRX ID","#"+String(detail.id).slice(-6)],["Customer",detail.customerName],["Service",detail.serviceName],["Weight",detail.weight+" kg"],["Total",formatRp(detail.totalPrice)],["Status",detail.status],["Payment",detail.paymentStatus],["Created",detail.createdAt?.slice(0,10)||"-"],["Est. Done",detail.estimatedDone?.slice(0,10)||"-"]].map(([l,v])=>(
                <div key={l} className="info-row"><span className="info-label">{l}</span><span className="info-value">{v}</span></div>
              ))}
            </Modal>
          )}

          {showAdd && (
            <Modal title="New Transaction" onClose={()=>{setShowAdd(false);setNewErr({});}}
              footer={<><button className="btn btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving?"Saving…":"Create"}</button></>}>
              <div className="field"><label>Customer</label>
                <select value={newO.customerId} onChange={e=>{setNewO(f=>({...f,customerId:e.target.value}));setNewErr(v=>({...v,customerId:""}));}}>
                  <option value="">-- Select Customer --</option>
                  {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>{newErr.customerId&&<div className="err">{newErr.customerId}</div>}
              </div>
              <div className="field"><label>Service</label>
                <select value={newO.serviceId} onChange={e=>{setNewO(f=>({...f,serviceId:e.target.value}));setNewErr(v=>({...v,serviceId:""}));}}>
                  <option value="">-- Select Service --</option>
                  {services.map(s=><option key={s.id} value={s.id}>{s.name} — {formatRp(s.price)}/{s.unit}</option>)}
                </select>{newErr.serviceId&&<div className="err">{newErr.serviceId}</div>}
              </div>
              <div className="field"><label>Weight (kg)</label>
                <input type="number" placeholder="3" min="0.1" value={newO.weight} onChange={e=>{setNewO(f=>({...f,weight:e.target.value}));setNewErr(v=>({...v,weight:""}));}}/>
                {newErr.weight&&<div className="err">{newErr.weight}</div>}
              </div>
              <div className="field"><label>Notes</label><textarea placeholder="Optional" value={newO.notes} onChange={e=>setNewO(f=>({...f,notes:e.target.value}))}/></div>
              {prevTotal>0 && (
                <div style={{background:"var(--surface-feat)",borderRadius:"var(--r-md)",padding:"12px 14px",display:"flex",justifyContent:"space-between",border:"1px solid var(--green)"}}>
                  <span style={{fontSize:13,color:"var(--green-dark)",fontWeight:600}}>Total</span>
                  <span style={{fontWeight:700,color:"var(--green-dark)"}}>{formatRp(prevTotal)}</span>
                </div>
              )}
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminCustomers({ setPage }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewC, setViewC] = useState(null);
  const [editC, setEditC] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    customerService.getAllCustomers()
      .then(r=>setCustomers(Array.isArray(r)?r:(r.content||[])))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, []);

  const filtered = search
    ? customers.filter(c=>(c.name||"").toLowerCase().includes(search.toLowerCase())||(c.email||"").toLowerCase().includes(search.toLowerCase()))
    : customers;

  const openEdit = c => { setEditC(c); setEditForm({name:c.name,email:c.email,phone:c.phone}); setEditErrors({}); };
  const upd = k => e => { setEditForm(f=>({...f,[k]:e.target.value})); setEditErrors(v=>({...v,[k]:""})); };
  const validateEdit = () => {const e={};if(!editForm.name?.trim())e.name="Nama wajib diisi";return e;};

  const saveEdit = async () => {
    const e = validateEdit();
    if(Object.keys(e).length){ setEditErrors(e); return; }
    try {
      await customerService.updateCustomer(editC.id, editForm);
      setCustomers(p=>p.map(c=>c.id===editC.id?{...c,...editForm}:c));
      setEditC(null);
    } catch { alert("Gagal update pelanggan"); }
  };

  const deleteCustomer = async (id) => {
    if(!window.confirm("Hapus pelanggan ini?")) return;
    try {
      await customerService.deleteCustomer(id);
      setCustomers(p=>p.filter(c=>c.id!==id));
    } catch { alert("Gagal hapus pelanggan"); }
  };

  return (
    <div className="app-shell">
      <div className="main-wrap">
        <Topbar role="admin" setPage={setPage} active="admin-customers"/>
        <div className="main">
          <div className="page-header"><div><div className="page-title">Customers</div><div className="page-sub">Manage your laundry customers</div></div></div>
          <div className="search-wrap"><input className="search-input" placeholder="Search customer..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="card">
            {loading ? <Spinner/> : filtered.length===0 ? (
              <div className="empty"><div className="empty-icon">👥</div><div className="empty-text">No customers found</div></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
                  <tbody>{filtered.map(c=>(
                    <tr key={c.id}>
                      <td><div style={{fontWeight:500}}>{c.name}</div></td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td><div style={{display:"flex",gap:6}}><button className="btn btn-ghost btn-sm" onClick={()=>setViewC(c)}>View</button><button className="btn btn-ghost btn-sm" onClick={()=>openEdit(c)}>Edit</button><button className="btn btn-danger btn-sm" onClick={()=>deleteCustomer(c.id)}>Delete</button></div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>

          {viewC && (
            <Modal title="Customer Detail" onClose={()=>setViewC(null)} footer={<button className="btn btn-secondary" onClick={()=>setViewC(null)}>Close</button>}>
              {[["Name",viewC.name],["Email",viewC.email],["Phone",viewC.phone]].map(([l,v])=>(
                <div key={l} className="info-row"><span className="info-label">{l}</span><span className="info-value">{v||"-"}</span></div>
              ))}
            </Modal>
          )}

          {editC && (
            <Modal title="Edit Customer" onClose={()=>setEditC(null)}
              footer={<><button className="btn btn-secondary" onClick={()=>setEditC(null)}>Cancel</button><button className="btn btn-primary" onClick={saveEdit}>Save</button></>}>
              <div className="field"><label>Name</label><input value={editForm.name||""} onChange={upd("name")}/>{editErrors.name&&<div className="err">{editErrors.name}</div>}</div>
              <div className="field"><label>Email</label><input type="email" value={editForm.email||""} onChange={upd("email")}/></div>
              <div className="field"><label>Phone</label><input value={editForm.phone||""} onChange={upd("phone")}/></div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
}

const EMPTY_SVC = {name:"",price:"",unit:"kg",duration:""};

function AdminServices({ setPage }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editSvc, setEditSvc] = useState(null);
  const [form, setForm] = useState(EMPTY_SVC);
  const [errors, setErrors] = useState({});
  const upd = k => e => { setForm(f=>({...f,[k]:e.target.value})); setErrors(v=>({...v,[k]:""})); };

  const loadServices = () => laundryService.getAllServices()
    .then(r=>setServices(Array.isArray(r)?r:(r.content||[])));

  useEffect(() => { loadServices().catch(()=>{}).finally(()=>setLoading(false)); }, []);

  const validate = () => {
    const e={};
    if(!form.name.trim()) e.name="Nama wajib diisi";
    if(!form.price) e.price="Harga wajib diisi";
    else if(isNaN(form.price)||Number(form.price)<=0) e.price="Harga harus angka positif";
    if(!form.duration.trim()) e.duration="Durasi wajib diisi";
    return e;
  };

  const handleAdd = async () => {
    const e = validate();
    if(Object.keys(e).length){ setErrors(e); return; }
    try {
      await laundryService.createService({name:form.name,price:Number(form.price),unit:form.unit,duration:form.duration});
      await loadServices();
      setForm(EMPTY_SVC); setErrors({}); setShowAdd(false);
    } catch(err) {
      alert("Gagal menambah layanan");
    }
  };

  const openEdit = s => { setEditSvc(s); setForm({name:s.name,price:String(s.price),unit:s.unit,duration:s.duration}); setErrors({}); };

  const handleEdit = async () => {
    const e = validate();
    if(Object.keys(e).length){ setErrors(e); return; }
    try {
      await laundryService.updateService(editSvc.id,{name:form.name,price:Number(form.price),unit:form.unit,duration:form.duration});
      await loadServices();
      setEditSvc(null); setForm(EMPTY_SVC);
    } catch(err) {
      alert("Gagal update layanan");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Hapus layanan ini?")) return;
    try {
      await laundryService.deleteService(id);
      setServices(p=>p.filter(s=>s.id!==id));
    } catch { alert("Gagal hapus layanan"); }
  };

  const FormFields = () => (
    <>
      <div className="field"><label>Service Name</label><input placeholder="Cuci Reguler" value={form.name} onChange={upd("name")}/>{errors.name&&<div className="err">{errors.name}</div>}</div>
      <div className="two-col">
        <div className="field"><label>Price (Rp)</label><input type="number" placeholder="7000" min="0" value={form.price} onChange={upd("price")}/>{errors.price&&<div className="err">{errors.price}</div>}</div>
        <div className="field"><label>Unit</label><select value={form.unit} onChange={upd("unit")}><option value="kg">kg</option><option value="pcs">pcs</option><option value="set">set</option></select></div>
      </div>
      <div className="field"><label>Duration</label><input placeholder="3 hari" value={form.duration} onChange={upd("duration")}/>{errors.duration&&<div className="err">{errors.duration}</div>}</div>
    </>
  );

  return (
    <div className="app-shell">
      <div className="main-wrap">
        <Topbar role="admin" setPage={setPage} active="admin-services"/>
        <div className="main">
          <div className="page-header">
            <div><div className="page-title">Services</div><div className="page-sub">Kelola jenis dan harga layanan laundry</div></div>
            <button className="btn btn-primary" onClick={()=>{setShowAdd(true);setForm(EMPTY_SVC);setErrors({});}}>+ Add Service</button>
          </div>

          {loading ? <Spinner/> : (
            <div className="pricing-grid" style={{marginBottom:20}}>
              {services.map((s,i)=>(
                <div key={s.id} className={"pricing-card"+(i===1?" featured":"")}>
                  {i===1 && <span className="badge badge-popular" style={{marginBottom:12,display:"inline-block"}}>Most Popular</span>}
                  <div style={{fontWeight:600,fontSize:18,color:"var(--ink)",letterSpacing:"-0.3px"}}>{s.name}</div>
                  <div className="pricing-price">{formatRp(s.price)}<span style={{fontSize:16,fontWeight:400,color:"var(--steel)"}}>/{s.unit}</span></div>
                  <div style={{fontSize:13,color:"var(--steel)",marginBottom:20}}>⏱ {s.duration}</div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(s)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(s.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showAdd && <Modal title="Add Service" onClose={()=>setShowAdd(false)} footer={<><button className="btn btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAdd}>Save</button></>}><FormFields/></Modal>}
          {editSvc && <Modal title="Edit Service" onClose={()=>setEditSvc(null)} footer={<><button className="btn btn-secondary" onClick={()=>setEditSvc(null)}>Cancel</button><button className="btn btn-primary" onClick={handleEdit}>Save</button></>}><FormFields/></Modal>}
        </div>
      </div>
    </div>
  );
}

// ── ROUTER ────────────────────────────────────────────────
function Router() {
  const [page, setPage] = useState("role");
  const pages = {
    "role":               <RolePage         setPage={setPage}/>,
    "login-user":         <LoginPage        role="user"  setPage={setPage}/>,
    "login-admin":        <LoginPage        role="admin" setPage={setPage}/>,
    "register":           <RegisterPage     setPage={setPage}/>,
    "user-dashboard":     <UserDashboard    setPage={setPage}/>,
    "user-orders":        <UserOrders       setPage={setPage}/>,
    "user-new-order":     <UserNewOrder     setPage={setPage}/>,
    "user-profile":       <UserProfile      setPage={setPage}/>,
    "admin-dashboard":    <AdminDashboard   setPage={setPage}/>,
    "admin-transactions": <AdminTransactions setPage={setPage}/>,
    "admin-customers":    <AdminCustomers   setPage={setPage}/>,
    "admin-services":     <AdminServices    setPage={setPage}/>,
  };
  return pages[page] || <div>Page not found</div>;
}

export default function App() {
  return (
    <AppProvider>
      <style>{CSS}</style>
      <Router/>
    </AppProvider>
  );
}