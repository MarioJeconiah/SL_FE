// SmartLaundry — Connected to Spring Boot Backend

import { useState, createContext, useContext, useEffect, useRef } from "react";
import { login as apiLogin, register as apiRegister, saveAuth, getCurrentUser, logout as apiLogout } from "./services/authService";
import { getTransactions, getTransactionById, createTransaction, updateTransaction, updateTransactionStatus, deleteTransaction, cancelTransaction, updatePaymentStatus } from "./services/transactionService";
import { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } from "./services/customerService";
import { getAllServices, createService, updateService, deleteService } from "./services/laundryService";
import { getBusinessProfile } from "./services/businessService";
import { getDailyReport, getWeeklyReport, getMonthlyReport } from "./services/reportService";

const ORDER_STATUSES   = ["PENDING","WASHING","DRYING","IRONING","READY","COMPLETED","CANCELLED"];
const PAYMENT_STATUSES = ["PAID", "UNPAID"];

const formatRp      = n => "Rp " + Number(n).toLocaleString("id-ID");
const today         = () => new Date().toISOString().slice(0,10);
const addDays       = (d,n) => { const dt = new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().slice(0,10); };
const validateEmail = e => /\S+@\S+\.\S+/.test(e);

const AppContext = createContext(null);
function AppProvider({ children }) {
  if (localStorage.getItem("user") === "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [customers,   setCustomers]   = useState([]);
  const [orders,      setOrders]      = useState([]);
  const [services,    setServices]    = useState([]);
  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser, customers, setCustomers, orders, setOrders, services, setServices }}>
      {children}
    </AppContext.Provider>
  );
}
const useApp = () => useContext(AppContext);

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
  .badge-paid      { background: #D1FAE5; color: #065F46; border-radius: var(--r-sm); }
  .badge-unpaid    { background: #FEE2E2; color: #991B1B; border-radius: var(--r-sm); }
  .badge-owner     { background: var(--teal-deep); color: var(--green); border-radius: var(--r-full); }
  .badge-employee  { background: var(--surface); color: var(--steel); border-radius: var(--r-full); }

  .app-shell  { display: flex; min-height: 100vh; }
  .sidebar    { width: 240px; background: var(--teal-deep); color: var(--on-dark); display: flex; flex-direction: column; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
  .sidebar-logo { padding: 24px 20px 16px; border-bottom: 1px solid var(--hairline-dark); }
  .sidebar-logo-dot { width: 8px; height: 8px; background: var(--green); border-radius: 50%; display: inline-block; margin-right: 8px; }
  .sidebar-title { font-size: 17px; font-weight: 700; color: var(--on-dark); letter-spacing: -0.3px; }
  .sidebar-role-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--green); margin-top: 4px; }
  .sidebar-nav  { flex: 1; padding: 12px 8px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: var(--r-md); font-size: 14px; font-weight: 500; color: var(--on-dark-muted); cursor: pointer; transition: background .15s, color .15s; margin-bottom: 2px; }
  .nav-item:hover { background: rgba(255,255,255,.06); color: var(--on-dark); }
  .nav-item.active { background: var(--green); color: var(--on-primary); font-weight: 600; }
  .sidebar-footer { padding: 14px 8px; border-top: 1px solid var(--hairline-dark); }
  .logout-btn { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; background: none; border: none; color: #F87171; font-size: 14px; font-weight: 500; cursor: pointer; border-radius: var(--r-md); font-family: inherit; transition: background .15s, color .15s; }
  .logout-btn:hover { background: rgba(220, 38, 38, 0.18); color: #FCA5A5; }

  .topbar { height: 64px; background: var(--canvas); border-bottom: 1px solid var(--hairline); display: flex; align-items: center; padding: 0 28px; gap: 16px; flex-shrink: 0; position: sticky; top: 0; z-index: 10; }
  .topbar-brand { font-size: 17px; font-weight: 700; color: var(--teal-deep); letter-spacing: -0.3px; display: flex; align-items: center; gap: 8px; }
  .topbar-dot { width: 8px; height: 8px; background: var(--green); border-radius: 50%; }
  .topbar-nav { display: flex; gap: 4px; flex: 1; margin-left: 24px; }
  .topbar-nav button { background: none; border: none; padding: 6px 12px; font-size: 14px; color: var(--steel); cursor: pointer; border-radius: var(--r-md); font-family: inherit; font-weight: 500; transition: color .15s, background .15s; }
  .topbar-nav button:hover { color: var(--ink); background: var(--surface); }
  .topbar-nav button.active { color: var(--green-dark); font-weight: 700; background: var(--green-soft); }
  .topbar-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
  .role-pill { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: var(--surface); color: var(--steel); padding: 4px 10px; border-radius: var(--r-full); }

  /* Profile avatar button in topbar */
  .topbar-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--teal-deep); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--green); cursor: pointer; border: 2px solid var(--hairline); transition: border-color .15s; flex-shrink: 0; }
  .topbar-avatar:hover { border-color: var(--green); }

  .main-wrap { display: flex; flex-direction: column; flex: 1; }
  .main { flex: 1; padding: 28px; background: var(--surface); overflow-y: auto; display: flex; flex-direction: column; align-items: center;}
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 28px; }
  .page-title { font-size: 32px; font-weight: 600; color: var(--ink); letter-spacing: -0.5px; }
  .page-sub { font-size: 14px; color: var(--steel); margin-top: 4px; }

  .card { background: var(--canvas); border-radius: var(--r-lg); border: 1px solid var(--hairline); padding: 0; }
  .card-lg { padding: 24px; }
  .card-title { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 14px; }

  .field { margin-bottom: 14px; }
  .field label { display: block; font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
  .field input, .field select, .field textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--hairline); border-radius: var(--r-md); font-family: inherit; font-size: 14px; background: var(--canvas); color: var(--ink); transition: border-color .15s; }
  .field input:focus, .field select:focus, .field textarea:focus { outline: none; border-color: var(--green-dark); box-shadow: 0 0 0 3px rgba(0,237,100,.1); }
  .field input::placeholder, .field textarea::placeholder { color: var(--stone); }
  .field textarea { min-height: 80px; resize: vertical; }
  .field input:disabled, .field select:disabled, .field textarea:disabled { background: var(--surface); color: var(--stone); cursor: not-allowed; }
  .err { font-size: 12px; color: #C0392B; margin-top: 4px; font-weight: 500; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th { background: var(--surface); padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: var(--steel); text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 1px solid var(--hairline); }
  td { padding: 14px 12px; border-bottom: 1px solid var(--hairline-soft); font-size: 14px; }
  tr:last-child td { border-bottom: none; }

  .tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid var(--hairline); }
  .tab { background: none; border: none; padding: 10px 14px; font-size: 14px; font-weight: 500; color: var(--steel); cursor: pointer; border-bottom: 2px solid transparent; transition: color .15s, border-color .15s; font-family: inherit; }
  .tab:hover { color: var(--ink); }
  .tab.active { color: var(--green-dark); border-bottom-color: var(--green); font-weight: 600; }

  .search-wrap { margin-bottom: 20px; }
  .search-input { width: 100%; max-width: 400px; padding: 10px 14px; border: 1px solid var(--hairline); border-radius: var(--r-lg); font-family: inherit; font-size: 14px; background: var(--canvas); color: var(--ink); }
  .search-input:focus { outline: none; border-color: var(--green-dark); box-shadow: 0 0 0 3px rgba(0,237,100,.1); }

  .floating-cards { position: relative; z-index: 1; }
  .stat-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
  .stat-card { background: var(--canvas); border-radius: var(--r-lg); padding: 20px; border: 1px solid var(--hairline); }
  .stat-card-label { font-size: 12px; font-weight: 600; color: var(--steel); text-transform: uppercase; letter-spacing: 0.3px; }
  .stat-card-value { font-size: 32px; font-weight: 600; color: var(--ink); letter-spacing: -0.5px; margin-top: 8px; }
  .stat-card-value.green { color: var(--green-dark); }
  .stat-card-value.amber { color: #D97706; }

  .hero { background: linear-gradient(135deg, var(--teal-deep) 0%, var(--teal-mid) 100%); padding: 64px 28px 32px; border-radius: var(--r-xl); margin-bottom: 28px; color: var(--on-dark); }
  .hero-eyebrow { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--green); margin-bottom: 8px; }
  .hero-title { font-size: 42px; font-weight: 600; line-height: 1.2; letter-spacing: -0.5px; margin-bottom: 12px; }
  .hero-sub { font-size: 16px; color: var(--on-dark-muted); line-height: 1.6; }
  .hero-actions { display: flex; gap: 12px; margin-top: 28px; flex-wrap: wrap; }

  .hero, .floating-cards, .main > div {width: 100%; }

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

  .spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid var(--hairline); border-top-color: var(--green-dark); border-radius: 50%; animation: spin .6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .page-loading { display: flex; align-items: center; justify-content: center; padding: 64px; gap: 12px; color: var(--steel); font-size: 14px; }

  /* ── PROFILE PAGE ────────────────────────────────────────── */
  .profile-shell { display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start; max-width: 900px; width: 100%; }
  .profile-sidebar-card { background: var(--canvas); border-radius: var(--r-xl); border: 1px solid var(--hairline); padding: 32px 24px; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .profile-avatar-ring { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, var(--teal-deep), var(--teal-mid)); display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 700; color: var(--green); margin-bottom: 16px; border: 3px solid var(--green-soft); box-shadow: 0 0 0 4px var(--green-soft); position: relative; }
  .profile-avatar-ring.editing { border-color: var(--green); box-shadow: 0 0 0 4px rgba(0,237,100,.2); }
  .profile-name { font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: -0.3px; margin-bottom: 4px; }
  .profile-username { font-size: 13px; color: var(--stone); margin-bottom: 12px; }
  .profile-main-card { background: var(--canvas); border-radius: var(--r-xl); border: 1px solid var(--hairline); overflow: hidden; }
  .profile-section-header { padding: 20px 24px 16px; border-bottom: 1px solid var(--hairline); display: flex; justify-content: space-between; align-items: center; }
  .profile-section-title { font-size: 16px; font-weight: 600; color: var(--ink); }
  .profile-body { padding: 24px; }
  .profile-field-group { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .profile-save-bar { background: var(--teal-deep); padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; }
  .profile-save-bar-text { font-size: 13px; color: var(--on-dark-muted); }

  /* ── BUSINESS PAGE ────────────────────────────────────────── */
  .business-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; width: 100%; }
  .business-card { background: var(--canvas); border-radius: var(--r-xl); border: 1px solid var(--hairline); overflow: hidden; transition: box-shadow .2s, transform .2s; }
  .business-card:hover { box-shadow: var(--shadow-3); transform: translateY(-2px); }
  .business-card-header { background: linear-gradient(135deg, var(--teal-deep) 0%, var(--teal-mid) 100%); padding: 24px; display: flex; align-items: flex-start; gap: 16px; }
  .business-card-logo { width: 52px; height: 52px; border-radius: var(--r-lg); background: var(--green); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; color: var(--teal-deep); flex-shrink: 0; }
  .business-card-name { font-size: 18px; font-weight: 700; color: var(--on-dark); letter-spacing: -0.3px; }
  .business-card-owner { font-size: 12px; color: var(--on-dark-muted); margin-top: 3px; display: flex; align-items: center; gap: 5px; }
  .business-card-body { padding: 20px 24px; }
  .business-stats-row { display: flex; gap: 20px; margin-bottom: 20px; }
  .business-stat { flex: 1; }
  .business-stat-val { font-size: 28px; font-weight: 700; color: var(--ink); letter-spacing: -0.5px; }
  .business-stat-val.green { color: var(--green-dark); }
  .business-stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; color: var(--stone); margin-top: 2px; }
  .business-services-toggle { width: 100%; background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--r-lg); padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; color: var(--ink); transition: background .15s; }
  .business-services-toggle:hover { background: var(--hairline-soft); }
  .business-services-toggle .chevron { transition: transform .2s; font-size: 11px; color: var(--stone); }
  .business-services-toggle .chevron.open { transform: rotate(180deg); }
  .business-services-list { margin-top: 10px; border: 1px solid var(--hairline); border-radius: var(--r-lg); overflow: hidden; }
  .business-service-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--hairline-soft); font-size: 13px; }
  .business-service-row:last-child { border-bottom: none; }
  .business-service-name { font-weight: 500; color: var(--ink); }
  .business-service-meta { font-size: 12px; color: var(--stone); margin-top: 1px; }
  .business-service-price { font-weight: 700; color: var(--green-dark); font-size: 13px; }

  .business-hero { background: linear-gradient(135deg, var(--teal-deep), var(--teal-mid)); border-radius: var(--r-xl); padding: 40px 36px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
  .business-hero-left { }
  .business-hero-eyebrow { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--green); margin-bottom: 8px; }
  .business-hero-title { font-size: 28px; font-weight: 700; color: var(--on-dark); letter-spacing: -0.5px; margin-bottom: 6px; }
  .business-hero-sub { font-size: 14px; color: var(--on-dark-muted); }
  .business-hero-stats { display: flex; gap: 32px; }
  .business-hero-stat-val { font-size: 36px; font-weight: 700; color: var(--green); letter-spacing: -1px; }
  .business-hero-stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; color: var(--on-dark-muted); margin-top: 2px; }

  @media (max-width: 768px) {
    .auth-left { display: none; }
    .auth-right { width: 100%; }
    .stat-row { grid-template-columns: repeat(2,1fr); }
    .two-col { grid-template-columns: 1fr; }
    .pricing-grid { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .main { padding: 20px 16px; }
    .hero-title { font-size: 28px; }
    .profile-shell { grid-template-columns: 1fr; }
    .profile-field-group { grid-template-columns: 1fr; }
    .business-grid { grid-template-columns: 1fr; }
    .business-hero { flex-direction: column; }
  }
`;

// ── COMPONENTS ────────────────────────────────────────────────

function StatusBadge({ s }) {
  const map = { "PENDING":"badge-pending","WASHING":"badge-washing","DRYING":"badge-drying","IRONING":"badge-ironing","READY":"badge-ready","COMPLETED":"badge-completed","CANCELLED":"badge-cancelled","PAID":"badge-paid","UNPAID":"badge-unpaid" };
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

function PageLoading() {
  return <div className="page-loading"><div className="spinner"/><span>Memuat data…</span></div>;
}

// ── TOPBAR ────────────────────────────────────────────────────
function Topbar({ role, setPage, active }) {
  const { currentUser, setCurrentUser } = useApp();
  const isAdmin = role === "admin";

  const nav = isAdmin
    ? [
        { label: "Dashboard",  page: "admin-dashboard" },
        { label: "Transaksi",  page: "admin-transactions" },
        { label: "Pelanggan",  page: "admin-customers" },
        { label: "Layanan",    page: "admin-services" },
        { label: "Bisnis",     page: "admin-business" },
      ]
    : [
        { label: "Dashboard",  page: "user-dashboard" },
        { label: "Transaksi",  page: "user-orders" },
        { label: "Pelanggan",  page: "user-customers" },
        { label: "Layanan",    page: "user-services" },
        { label: "Bisnis",     page: "user-business" },
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
        <span className="topbar-dot"/>
        <span>SmartLaundry</span>
      </div>
      <div className="topbar-nav">
        {nav.map(n=>(
          <button key={n.page} className={active===n.page?"active":""} onClick={()=>setPage(n.page)}>
            {n.label}
          </button>
        ))}
      </div>
      <div className="topbar-actions">
        <span className="role-pill">{isAdmin?"OWNER":"EMPLOYEE"}</span>
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

// ── LOGIN ─────────────────────────────────────────────────────
function LoginPage({ setPage }) {
  const { setCurrentUser } = useApp();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiErr,   setApiErr]   = useState("");

  const validate = () => {
    const e={};
    if (!email.trim())            e.email    = "Username wajib diisi";
    if (!password)                e.password = "Password wajib diisi";
    else if (password.length < 6) e.password = "Password minimal 6 karakter";
    return e;
  };

  const handleLogin = async () => {
  const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
  setErrors({}); setApiErr(""); setLoading(true);
  try {
    const res = await apiLogin({ username: email, password });
    console.log("RAW RESPONSE:", res);        // ← lihat isi response
    saveAuth(res);
    const user = getCurrentUser();
    console.log("CURRENT USER:", user);       // ← lihat hasil getCurrentUser
    console.log("ROLE:", user?.role);         // ← lihat role-nya
    setCurrentUser(user);
    const role = (user.role || "").toUpperCase();
    setPage(role === "OWNER" || role === "ADMIN" ? "admin-dashboard" : "user-dashboard");
  } catch (err) {
    setApiErr(err?.response?.data?.message || "Username atau password salah.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:40}}>
          <span className="sidebar-logo-dot" style={{width:12,height:12}}/>
          <span style={{fontSize:18,fontWeight:700,color:"var(--on-dark)"}}>SmartLaundry</span>
        </div>
        <div className="auth-left-title">Laundry Management<br/>System</div>
        <div className="auth-left-sub">One platform. Unlimited laundry operations.</div>
        <div className="auth-left-desc">Manage customers, transactions, services &amp; reports in one place.</div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-title">Selamat Datang</h2>
          <p className="auth-sub">Masuk untuk melanjutkan</p>
          {apiErr && <div className="alert alert-error">{apiErr}</div>}
          {/* autoComplete="off" on the wrapper div prevents Google Password Manager breach alerts */}
          <div autoComplete="off">
            <input type="text" name="fakeusernameremembered" style={{display:"none"}} readOnly autoComplete="username"/>
            <input type="password" name="fakepasswordremembered" style={{display:"none"}} readOnly autoComplete="new-password"/>
          <div className="field">
            <label>Username</label>
            <input type="text" placeholder="Masukkan username" value={email} autoComplete="off" name="smartlaundry-user" onChange={e=>{setEmail(e.target.value);setErrors(v=>({...v,email:""}));}} />
            {errors.email && <div className="err">{errors.email}</div>}
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Masukkan password" value={password} autoComplete="new-password" name="smartlaundry-pass" onChange={e=>{setPassword(e.target.value);setErrors(v=>({...v,password:""}));}} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
            {errors.password && <div className="err">{errors.password}</div>}
          </div>
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={handleLogin} disabled={loading}>
            {loading ? "Masuk…" : "login"}
          </button>
          <div className="auth-link-row">Belum punya akun? <button onClick={()=>setPage("register")}>Register</button></div>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ setPage }) {
  const [form, setForm] = useState({
    businessName:"",
    ownerUsername:"",ownerPassword:"",ownerFullName:"",ownerConfirm:"",
    employeeUsername:"",employeePassword:"",employeeFullName:"",
    confirm:""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const upd = k => e => { setForm(f=>({...f,[k]:e.target.value})); setErrors(v=>({...v,[k]:""})); };

  const validate = () => {
    const e={};
    if (!form.businessName.trim())           e.businessName     = "Nama bisnis wajib diisi";
    if (!form.ownerUsername.trim())          e.ownerUsername    = "Username pemilik wajib diisi";
    if (!form.ownerPassword)                 e.ownerPassword    = "Password pemilik wajib diisi";
    else if (form.ownerPassword.length<6)    e.ownerPassword    = "Password minimal 6 karakter";
    if (!form.ownerFullName.trim())          e.ownerFullName    = "Nama lengkap pemilik wajib diisi";
    if (form.ownerPassword && form.ownerConfirm && form.ownerPassword !== form.ownerConfirm) e.ownerConfirm = "Konfirmasi password pemilik tidak cocok";
    if (!form.employeeUsername.trim())       e.employeeUsername = "Username karyawan wajib diisi";
    if (!form.employeePassword)              e.employeePassword = "Password karyawan wajib diisi";
    else if (form.employeePassword.length<6) e.employeePassword = "Password minimal 6 karakter";
    if (!form.employeeFullName.trim())       e.employeeFullName = "Nama lengkap karyawan wajib diisi";
    if (form.employeePassword && form.confirm && form.employeePassword !== form.confirm) e.confirm = "Konfirmasi password karyawan tidak cocok";
    return e;
  };

  const handleRegister = async () => {
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await apiRegister({
        businessName: form.businessName,
        ownerUsername: form.ownerUsername,
        ownerPassword: form.ownerPassword,
        ownerFullName: form.ownerFullName,
        employeeUsername: form.employeeUsername,
        employeePassword: form.employeePassword,
        employeeFullName: form.employeeFullName,
      });
      setSuccess("Registrasi berhasil! Silakan login.");
      setTimeout(() => setPage("login"), 1500);
    } catch (err) {
      setErrors({ businessName: err?.response?.data?.message || "Registrasi gagal. Coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:40}}>
          <span className="sidebar-logo-dot" style={{width:12,height:12}}/>
          <span style={{fontSize:18,fontWeight:700,color:"var(--on-dark)"}}>SmartLaundry</span>
        </div>
        <div className="auth-left-title">Daftarkan<br/>Bisnis Anda</div>
        <div className="auth-left-sub">Sistem Manajemen Laundry</div>
        <div className="auth-left-desc">Buat akun bisnis laundry Anda dan mulai kelola pesanan, pelanggan, dan laporan dalam satu platform.</div>
      </div>
      <div className="auth-right" style={{width:520}}>
        <div className="auth-card" style={{maxWidth:460}}>
          <h2 className="auth-title">Buat Akun</h2>
          <p className="auth-sub">Siapkan bisnis laundry Anda</p>
          {success && <div className="alert alert-success">{success}</div>}
          <div style={{marginBottom:16,paddingBottom:16,borderBottom:"1px solid var(--hairline)"}}>
            <div style={{fontSize:12,fontWeight:600,color:"var(--steel)",textTransform:"uppercase",marginBottom:12}}>Informasi Bisnis</div>
            <div className="field"><label>Nama Bisnis</label><input placeholder="Laundry ABC" value={form.businessName} onChange={upd("businessName")}/>{errors.businessName&&<div className="err">{errors.businessName}</div>}</div>
          </div>
          <div style={{marginBottom:16,paddingBottom:16,borderBottom:"1px solid var(--hairline)"}}>
            <div style={{fontSize:12,fontWeight:600,color:"var(--steel)",textTransform:"uppercase",marginBottom:12}}>Akun Pemilik</div>
            <div className="two-col">
              <div className="field"><label>Username</label><input placeholder="owner123" autoComplete="off" value={form.ownerUsername} onChange={upd("ownerUsername")}/>{errors.ownerUsername&&<div className="err">{errors.ownerUsername}</div>}</div>
              <div className="field"><label>Nama Lengkap</label><input placeholder="Ahmad Rizky" value={form.ownerFullName} onChange={upd("ownerFullName")}/>{errors.ownerFullName&&<div className="err">{errors.ownerFullName}</div>}</div>
              <div className="field"><label>Password</label><input type="password" placeholder="Min. 6 karakter" autoComplete="new-password" value={form.ownerPassword} onChange={upd("ownerPassword")}/>{errors.ownerPassword&&<div className="err">{errors.ownerPassword}</div>}</div>
              <div className="field"><label>Konfirmasi Password</label><input type="password" placeholder="Ulangi password pemilik" autoComplete="new-password" value={form.ownerConfirm} onChange={upd("ownerConfirm")}/>{errors.ownerConfirm&&<div className="err">{errors.ownerConfirm}</div>}</div>
            </div>
          </div>
          <div style={{marginBottom:16,paddingBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:"var(--steel)",textTransform:"uppercase",marginBottom:12}}>Akun Karyawan</div>
            <div className="two-col">
              <div className="field"><label>Username</label><input placeholder="employee123" autoComplete="off" value={form.employeeUsername} onChange={upd("employeeUsername")}/>{errors.employeeUsername&&<div className="err">{errors.employeeUsername}</div>}</div>
              <div className="field"><label>Nama Lengkap</label><input placeholder="Budi Santoso" value={form.employeeFullName} onChange={upd("employeeFullName")}/>{errors.employeeFullName&&<div className="err">{errors.employeeFullName}</div>}</div>
              <div className="field"><label>Password</label><input type="password" placeholder="Min. 6 karakter" autoComplete="new-password" value={form.employeePassword} onChange={upd("employeePassword")}/>{errors.employeePassword&&<div className="err">{errors.employeePassword}</div>}</div>
              <div className="field"><label>Konfirmasi Password</label><input type="password" placeholder="Ulangi password karyawan" autoComplete="new-password" value={form.confirm} onChange={upd("confirm")}/>{errors.confirm&&<div className="err">{errors.confirm}</div>}</div>
            </div>
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={handleRegister} disabled={loading}>
            {loading ? "Mendaftar…" : "register"}
          </button>
          <div className="auth-link-row">Sudah punya akun? <button onClick={()=>setPage("login")}>login</button></div>
        </div>
      </div>
    </div>
  );
}

// ── SHARED DASHBOARD LAYOUT ───────────────────────────────────
function DashboardShell({ role, setPage, activeNav, children }) {
  return (
    <div className="app-shell">
      <div className="main-wrap">
        <Topbar role={role} setPage={setPage} active={activeNav}/>
        <div className="main">{children}</div>
      </div>
    </div>
  );
}


// ── ADMIN DASHBOARD ───────────────────────────────────────────
function AdminDashboard({ setPage }) {
  const { orders, setOrders, customers, setCustomers } = useApp();
  const [loading, setLoading] = useState(true);
  const [reportTab, setReportTab] = useState("daily");
  const [report, setReport]       = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportErr, setReportErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [trxData, custData] = await Promise.all([
          getTransactions(undefined, undefined, undefined, 0, 200),
          getAllCustomers()
        ]);
        setOrders(Array.isArray(trxData) ? trxData : (trxData.content || []));
        setCustomers(Array.isArray(custData) ? custData : (custData.content || []));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      setReportLoading(true); setReportErr("");
      try {
        let data;
        if (reportTab === "daily")   data = await getDailyReport();
        if (reportTab === "weekly")  data = await getWeeklyReport();
        if (reportTab === "monthly") data = await getMonthlyReport();
        setReport(data);
      } catch (err) {
        setReportErr(err?.response?.data?.message || "Gagal memuat laporan.");
        setReport(null);
      } finally { setReportLoading(false); }
    };
    fetchReport();
  }, [reportTab]);

  const userCount    = customers.length;
  const recent       = orders.slice(0, 5);
  const pending      = orders.filter(o => o.status === "PENDING").length;
  const washing      = orders.filter(o => o.status === "WASHING").length;
  const drying       = orders.filter(o => o.status === "DRYING").length;
  const ironing      = orders.filter(o => o.status === "IRONING").length;
  const ready        = orders.filter(o => o.status === "READY").length;
  const activeOrders = orders.filter(o => ["PENDING","WASHING","DRYING","IRONING","READY"].includes(o.status)).length;
  const revenue      = orders.filter(o => o.paymentStatus === "PAID").reduce((s,o) => s + (Number(o.totalPrice)||0), 0);

  const REPORT_TABS = [
    { key:"daily", label:"Harian" },
    { key:"weekly", label:"Mingguan" },
    { key:"monthly", label:"Bulanan" },
  ];

  return (
    <DashboardShell role="admin" setPage={setPage} activeNav="admin-dashboard">
      <div className="hero">
        <div className="hero-eyebrow">Panel Admin</div>
        <h1 className="hero-title">Dashboard Operasional<br/>Laundry</h1>
        <p className="hero-sub">Pantau performa bisnis, transaksi, dan aktivitas pelanggan secara real-time.</p>
        <div className="hero-actions">
          <button className="btn btn-on-dark" onClick={()=>setPage("admin-transactions")}>+ Transaksi Baru</button>
          <button className="btn btn-sec-dark" onClick={()=>setPage("admin-customers")}>Lihat Pelanggan</button>
        </div>
      </div>

      <div className="floating-cards" style={{maxWidth:1100, margin: "0 auto"}}>
        <div className="stat-row">
          <div className="stat-card"><div className="stat-card-label">Pendapatan</div><div className="stat-card-value green">{formatRp(revenue)}</div><div style={{fontSize:12,color:"var(--stone)",marginTop:4}}>Pesanan PAID</div></div>
          <div className="stat-card"><div className="stat-card-label">Transaksi</div><div className="stat-card-value">{orders.length}</div></div>
          <div className="stat-card"><div className="stat-card-label">Aktif</div><div className="stat-card-value amber">{activeOrders}</div></div>
          <div className="stat-card"><div className="stat-card-label">Pelanggan</div><div className="stat-card-value">{userCount}</div></div>
        </div>
      </div>

      <div style={{padding:"24px 0 32px",maxWidth:1100, margin: "0 auto"}}>
        <div className="card card-lg" style={{marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div>
              <div style={{fontSize:18,fontWeight:600,color:"var(--ink)",letterSpacing:"-0.3px"}}>Laporan Bisnis</div>
              <div style={{fontSize:13,color:"var(--steel)",marginTop:3}}>Ringkasan transaksi berdasarkan periode</div>
            </div>
            <div style={{display:"flex",background:"var(--surface)",borderRadius:"var(--r-full)",padding:4,gap:2}}>
              {REPORT_TABS.map(t=>(
                <button key={t.key} onClick={()=>setReportTab(t.key)} style={{padding:"6px 16px",border:"none",borderRadius:"var(--r-full)",background:reportTab===t.key?"var(--canvas)":"transparent",color:reportTab===t.key?"var(--ink)":"var(--steel)",fontWeight:reportTab===t.key?600:500,fontSize:13,cursor:"pointer",fontFamily:"inherit",boxShadow:reportTab===t.key?"var(--shadow-1)":"none",transition:"all .15s"}}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {reportErr && <div className="alert alert-error" style={{marginBottom:16}}>{reportErr}</div>}
          {reportLoading ? (
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"32px 0",justifyContent:"center",color:"var(--steel)",fontSize:14}}>
              <div className="spinner"/> Memuat laporan…
            </div>
          ) : report ? (
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
                {[
                  {icon:"💰",label:"Total Revenue",    value:formatRp(report.totalRevenue),            color:"var(--green-dark)",bg:"var(--green-soft)"},
                  {icon:"📦",label:"Total Transaksi",  value:report.totalTransactions,                  color:"var(--ink)",       bg:"var(--surface)"},
                  {icon:"✅",label:"Selesai",          value:report.completedTransactions ?? "-",        color:"#065F46",          bg:"#D1FAE5"},
                  {icon:"⏳",label:"Pending",          value:report.pendingTransactions   ?? "-",        color:"#92400E",          bg:"#FEF3C7"},
                ].map(c=>(
                  <div key={c.label} style={{background:c.bg,borderRadius:"var(--r-lg)",padding:"16px 18px"}}>
                    <div style={{fontSize:20,marginBottom:8}}>{c.icon}</div>
                    <div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px",color:c.color,opacity:0.7,marginBottom:4}}>{c.label}</div>
                    <div style={{fontSize:24,fontWeight:600,color:c.color,letterSpacing:"-0.5px"}}>{c.value}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"var(--surface)",borderRadius:"var(--r-lg)",padding:"16px 20px"}}>
                <div style={{fontSize:12,fontWeight:600,color:"var(--steel)",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:14}}>Distribusi Status Transaksi</div>
                {(()=>{
                  const total = report.totalTransactions || 1;
                  const bars = [
                    {label:"Selesai",    value:report.completedTransactions??0, color:"var(--green)"},
                    {label:"Working",    value:(report.totalTransactions??0)-(report.completedTransactions??0)-(report.cancelledTransactions??report.cancelled??0), color:"#FBBF24"},
                    {label:"Dibatalkan", value:report.cancelled??report.cancelledTransactions??0, color:"#F87171"},
                  ];
                  return bars.map(b=>(
                    <div key={b.label} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}>
                        <span style={{color:"var(--steel)"}}>{b.label}</span>
                        <span style={{fontWeight:600,color:"var(--ink)"}}>{b.value} <span style={{fontWeight:400,color:"var(--stone)",fontSize:12}}>({Math.round((b.value/total)*100)}%)</span></span>
                      </div>
                      <div style={{height:6,background:"var(--hairline)",borderRadius:99}}>
                        <div style={{height:6,background:b.color,borderRadius:99,width:`${Math.min((b.value/total)*100,100)}%`,transition:"width .4s ease"}}/>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </>
          ) : null}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
          <div className="card card-lg">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div className="card-title" style={{margin:0}}>Aktivitas Terbaru</div>
              <button className="btn btn-ghost btn-sm" onClick={()=>setPage("admin-transactions")}>Lihat Semua →</button>
            </div>
            {recent.length===0
              ? <div className="empty"><div className="empty-icon">🧺</div><div className="empty-text">Belum ada transaksi</div></div>
              : recent.map(o=>(
                <div key={o.id} className="activity-item">
                  <div>
                    <div style={{fontWeight:500,fontSize:14}}>{String(o.id).slice(-5)}</div>
                    <div style={{fontSize:12,color:"var(--steel)"}}>{o.customerName} · {o.serviceName||"-"}</div>
                  </div>
                  <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <StatusBadge s={o.status}/>
                    <span style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>{formatRp(o.totalPrice)}</span>
                  </div>
                </div>
              ))}
          </div>
          <div className="card card-lg">
            <div className="card-title">Status Pesanan</div>
            <p style={{fontSize:13,color:"var(--steel)",marginBottom:16}}>Semua sistem berjalan normal</p>
            {[
              ["Pending", pending, "#FBBF24"],
              ["Washing", washing, "#89CFEF"],
              ["Drying",  drying,  "#E12901"],
              ["Ironing", ironing, "#C5C6C7"],
              ["Ready",   ready,   "#48A860"],
            ].map(([l,v,c])=>(
              <div key={l} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--steel)",marginBottom:5}}>
                  <span>{l}</span><span style={{fontWeight:600,color:"var(--ink)"}}>{v}</span>
                </div>
                <div style={{height:6,background:"var(--hairline)",borderRadius:99}}>
                  <div style={{height:6,background:c,borderRadius:99,width:`${orders.length?Math.min((v/orders.length)*100,100):0}%`}}/>
                </div>
              </div>
            ))}
            <div style={{marginTop:20}}>
              {[["Transaksi",orders.length,"admin-transactions"],["Pelanggan",userCount,"admin-customers"]].map(([l,v,p])=>(
                <button key={l} className="btn btn-secondary" style={{width:"100%",justifyContent:"space-between",marginBottom:8}} onClick={()=>setPage(p)}>
                  <span>{l}</span><span style={{fontWeight:700}}>{v}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="cta-band">
          <div><div className="cta-band-title">Siap memproses lebih banyak transaksi?</div><div className="cta-band-sub">Optimalkan alur kerja laundry Anda hari ini.</div></div>
          <button className="btn btn-on-dark" onClick={()=>setPage("admin-transactions")}>Buat Transaksi</button>
        </div>
      </div>
    </DashboardShell>
  );
}

// ── USER DASHBOARD ────────────────────────────────────────────
function UserDashboard({ setPage }) {
  const { orders, setOrders, customers, setCustomers } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [trxData, custData] = await Promise.all([
          getTransactions(undefined, undefined, undefined, 0, 200),
          getAllCustomers()
        ]);
        setOrders(Array.isArray(trxData) ? trxData : (trxData.content || []));
        setCustomers(Array.isArray(custData) ? custData : (custData.content || []));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const activeOrders = orders.filter(o => ["PENDING","WASHING","DRYING","IRONING","READY"].includes(o.status)).length;
  const pending  = orders.filter(o => o.status === "PENDING").length;
  const washing  = orders.filter(o => o.status === "WASHING").length;
  const drying   = orders.filter(o => o.status === "DRYING").length;
  const ironing  = orders.filter(o => o.status === "IRONING").length;
  const ready    = orders.filter(o => o.status === "READY").length;
  const recent   = orders.slice(0, 5);

  return (
    <DashboardShell role="user" setPage={setPage} activeNav="user-dashboard">
      <div className="hero">
        <div className="hero-eyebrow">Panel Karyawan</div>
        <h1 className="hero-title">Dashboard Operasional<br/>Laundry</h1>
        <p className="hero-sub">Pantau dan kelola pesanan laundry secara real-time.</p>
        <div className="hero-actions">
          <button className="btn btn-on-dark" onClick={()=>setPage("user-orders")}>+ Transaksi Baru</button>
          <button className="btn btn-sec-dark" onClick={()=>setPage("user-customers")}>Lihat Pelanggan</button>
        </div>
      </div>

      <div className="floating-cards" style={{maxWidth:1100}}>
        <div className="stat-row">
          <div className="stat-card"><div className="stat-card-label">Transaksi</div><div className="stat-card-value">{orders.length}</div></div>
          <div className="stat-card"><div className="stat-card-label">Aktif</div><div className="stat-card-value amber">{activeOrders}</div></div>
          <div className="stat-card"><div className="stat-card-label">Pelanggan</div><div className="stat-card-value">{customers.length}</div></div>
          <div className="stat-card"><div className="stat-card-label">Pending</div><div className="stat-card-value amber">{pending}</div></div>
        </div>
      </div>

      {loading ? <PageLoading/> : (
        <div style={{padding:"24px 0 32px",maxWidth:1100}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
            <div className="card card-lg">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div className="card-title" style={{margin:0}}>Aktivitas Terbaru</div>
                <button className="btn btn-ghost btn-sm" onClick={()=>setPage("user-orders")}>Lihat Semua →</button>
              </div>
              {recent.length===0
                ? <div className="empty"><div className="empty-icon">🧺</div><div className="empty-text">Belum ada transaksi</div></div>
                : recent.map(o=>(
                  <div key={o.id} className="activity-item">
                    <div>
                      <div style={{fontWeight:500,fontSize:14}}>{String(o.id).slice(-5)}</div>
                      <div style={{fontSize:12,color:"var(--steel)"}}>{o.customerName} · {o.serviceName||"-"}</div>
                    </div>
                    <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                      <StatusBadge s={o.status}/>
                      <span style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>{formatRp(o.totalPrice)}</span>
                    </div>
                  </div>
                ))}
            </div>
            <div className="card card-lg">
              <div className="card-title">Status Pesanan</div>
              {[
                ["Pending", pending, "#FBBF24"],
                ["Washing", washing, "#89CFEF"],
                ["Drying",  drying,  "#E12901"],
                ["Ironing", ironing, "#C5C6C7"],
                ["Ready",   ready,   "#48A860"],
              ].map(([l,v,c])=>(
                <div key={l} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--steel)",marginBottom:5}}>
                    <span>{l}</span><span style={{fontWeight:600,color:"var(--ink)"}}>{v}</span>
                  </div>
                  <div style={{height:6,background:"var(--hairline)",borderRadius:99}}>
                    <div style={{height:6,background:c,borderRadius:99,width:`${orders.length?Math.min((v/orders.length)*100,100):0}%`}}/>
                  </div>
                </div>
              ))}
              <div style={{marginTop:20}}>
                {[["Transaksi",orders.length,"user-orders"],["Pelanggan",customers.length,"user-customers"]].map(([l,v,p])=>(
                  <button key={l} className="btn btn-secondary" style={{width:"100%",justifyContent:"space-between",marginBottom:8}} onClick={()=>setPage(p)}>
                    <span>{l}</span><span style={{fontWeight:700}}>{v}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="cta-band">
            <div><div className="cta-band-title">Siap memproses lebih banyak transaksi?</div><div className="cta-band-sub">Kelola alur kerja laundry dengan efisien.</div></div>
            <button className="btn btn-on-dark" onClick={()=>setPage("user-orders")}>Buat Transaksi</button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

// ── SHARED TRANSACTIONS ───────────────────────────────────────
function TransactionsPage({ role, setPage }) {
  const isAdmin = role === "admin";
  const { orders, setOrders, customers, setCustomers, services, setServices } = useApp();
  const [search,  setSearch]  = useState("");
  const [tab,     setTab]     = useState("Semua");
  const [detail,  setDetail]  = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newO,    setNewO]    = useState({customerId:"",serviceId:"",weight:"",paymentStatus:"UNPAID"});
  const [newErr,  setNewErr]  = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [trxData, custData, svcData] = await Promise.all([
          getTransactions(undefined, undefined, undefined, 0, 200),
          getAllCustomers(),
          getAllServices(),
        ]);
        setOrders(Array.isArray(trxData) ? trxData : (trxData.content || []));
        setCustomers(Array.isArray(custData) ? custData : (custData.content || []));
        setServices(Array.isArray(svcData) ? svcData : (svcData.content || []));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  let filtered = orders;
  if (tab !== "Semua") filtered = filtered.filter(o => o.status === tab);
  if (search) filtered = filtered.filter(o =>
    (o.customerName||"").toLowerCase().includes(search.toLowerCase()) ||
    (o.serviceName||"").toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id, newStatus) => {
    try {
      await updateTransactionStatus(id, newStatus);
      setOrders(p => p.map(o => o.id===id ? {...o,status:newStatus} : o));
    } catch (err) { console.error(err); }
  };

  const updatePayment = async (id, newPaymentStatus) => {
    try {
      await updatePaymentStatus(id, newPaymentStatus);
      setOrders(p => p.map(o => o.id===id ? {...o,paymentStatus:newPaymentStatus} : o));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      setOrders(p => p.filter(o => o.id!==id));
    } catch (err) { console.error(err); }
  };

  const validateNew = () => {
    const e={};
    if (!newO.customerId) e.customerId = "Pilih pelanggan";
    if (!newO.serviceId)  e.serviceId  = "Pilih layanan";
    if (!newO.weight)     e.weight     = "Berat wajib diisi";
    else if (isNaN(newO.weight)||Number(newO.weight)<=0) e.weight = "Berat harus angka positif";
    return e;
  };

  const handleAdd = async () => {
    const e = validateNew(); if (Object.keys(e).length) { setNewErr(e); return; }
    setSaving(true);
    try {
      const created = await createTransaction({
        customerId: Number(newO.customerId),
        paymentStatus: newO.paymentStatus,
        pickupDate: today(),
        details: [{ serviceId: Number(newO.serviceId), weight: Number(newO.weight) }]
      });
      setOrders(p => [created, ...p]);
      setNewO({customerId:"",serviceId:"",weight:"",paymentStatus:"UNPAID"});
      setNewErr({});
      setShowAdd(false);
    } catch (err) {
      setNewErr({ customerId: err?.response?.data?.message || "Gagal membuat transaksi." });
    } finally { setSaving(false); }
  };

  const prevSvc   = services.find(s => s.id === Number(newO.serviceId));
  const prevTotal = prevSvc && newO.weight && !isNaN(newO.weight) && Number(newO.weight)>0
    ? prevSvc.pricePerKg * Number(newO.weight) : 0;

  const activeNav = isAdmin ? "admin-transactions" : "user-orders";

  return (
    <DashboardShell role={role} setPage={setPage} activeNav={activeNav}>
      <div className="page-header">
        <div><div className="page-title">Transaksi</div><div className="page-sub">Monitor dan kelola semua pesanan laundry</div></div>
        <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ Transaksi Baru</button>
      </div>
      <div className="tabs">
        {["Semua","PENDING","WASHING","DRYING","IRONING","READY","COMPLETED"].map(t=>(
          <button key={t} className={"tab"+(tab===t?" active":"")} onClick={()=>setTab(t)}>{t}</button>
        ))}
      </div>
      <div className="search-wrap">
        <input className="search-input" placeholder="Cari pelanggan atau layanan…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div className="card">
        {loading ? <PageLoading/> : filtered.length===0
          ? <div className="empty"><div className="empty-icon">🧺</div><div className="empty-text">Tidak ada transaksi ditemukan</div></div>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Pelanggan</th><th>Layanan</th><th>Berat</th><th>Total</th><th>Status</th><th>Pembayaran</th><th>Tanggal</th><th>Aksi</th></tr></thead>
                <tbody>{[...filtered].sort((a,b)=>b.id-a.id).map(o=>(
                  <tr key={o.id}>
                    <td style={{fontFamily:"'Source Code Pro',monospace",fontSize:12,color:"var(--stone)"}}>#{o.id}</td>
                    <td><div style={{fontWeight:500}}>{o.customerName}</div></td>
                    <td>{o.serviceName||"-"}</td>
                    <td>{o.weight??"-"} kg</td>
                    <td style={{fontWeight:600}}>{formatRp(o.totalPrice)}</td>
                    <td>
                      <select className="inline-select" value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}>
                        {ORDER_STATUSES.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      {isAdmin
                        ? <select className="inline-select" value={o.paymentStatus} onChange={e=>updatePayment(o.id,e.target.value)}>
                            {PAYMENT_STATUSES.map(s=><option key={s}>{s}</option>)}
                          </select>
                        : <StatusBadge s={o.paymentStatus}/>
                      }
                    </td>
                    <td style={{fontSize:12,color:"var(--steel)"}}>{(o.createdAt||"").slice(0,10)}</td>
                    <td>
                      <div style={{display:"flex",gap:6}}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>setDetail(o)}>Lihat</button>
                        {isAdmin && <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(o.id)}>Hapus</button>}
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
      </div>

      {detail && (
        <Modal title="Detail Transaksi" onClose={()=>setDetail(null)} footer={<button className="btn btn-secondary" onClick={()=>setDetail(null)}>Tutup</button>}>
          {[
            ["ID",          "#"+detail.id],
            ["Pelanggan",   detail.customerName],
            ["Layanan",     detail.serviceName||"-"],
            ["Berat",       (detail.weight??"-")+" kg"],
            ["Total",       formatRp(detail.totalPrice)],
            ["Status",      detail.status],
            ["Pembayaran",  detail.paymentStatus],
            ["Dibuat",      (detail.createdAt||"").slice(0,10)],
            ["Tgl. Pickup", (detail.pickupDate||"-").slice?.(0,10)]
          ].map(([l,v])=>(
            <div key={l} className="info-row"><span className="info-label">{l}</span><span className="info-value">{v}</span></div>
          ))}
        </Modal>
      )}

      {showAdd && (
        <Modal title="Transaksi Baru" onClose={()=>{setShowAdd(false);setNewErr({});}}
          footer={<><button className="btn btn-secondary" onClick={()=>setShowAdd(false)}>Batal</button><button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving?"Menyimpan…":"Buat"}</button></>}>
          <div className="field">
            <label>Pelanggan</label>
            <select value={newO.customerId} onChange={e=>{setNewO(f=>({...f,customerId:e.target.value}));setNewErr(v=>({...v,customerId:""}));}}>
              <option value="">-- Pilih Pelanggan --</option>
              {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {newErr.customerId&&<div className="err">{newErr.customerId}</div>}
          </div>
          <div className="field">
            <label>Layanan</label>
            <select value={newO.serviceId} onChange={e=>{setNewO(f=>({...f,serviceId:e.target.value}));setNewErr(v=>({...v,serviceId:""}));}}>
              <option value="">-- Pilih Layanan --</option>
              {services.map(s=><option key={s.id} value={s.id}>{s.serviceName} ({s.serviceType}) — {formatRp(s.pricePerKg)}/kg</option>)}
            </select>
            {newErr.serviceId&&<div className="err">{newErr.serviceId}</div>}
          </div>
          <div className="field">
            <label>Berat (kg)</label>
            <input type="number" placeholder="3" min="0.1" value={newO.weight} onChange={e=>{setNewO(f=>({...f,weight:e.target.value}));setNewErr(v=>({...v,weight:""}));}}/>
            {newErr.weight&&<div className="err">{newErr.weight}</div>}
          </div>
          <div className="field">
            <label>Status Pembayaran</label>
            <select value={newO.paymentStatus} onChange={e=>setNewO(f=>({...f,paymentStatus:e.target.value}))}>
              {PAYMENT_STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          {prevTotal>0 && (
            <div style={{background:"var(--surface-feat)",borderRadius:"var(--r-md)",padding:"12px 14px",display:"flex",justifyContent:"space-between",border:"1px solid var(--green)"}}>
              <span style={{fontSize:13,color:"var(--green-dark)",fontWeight:600}}>Total</span>
              <span style={{fontWeight:700,color:"var(--green-dark)"}}>{formatRp(prevTotal)}</span>
            </div>
          )}
        </Modal>
      )}
    </DashboardShell>
  );
}

// ── SHARED CUSTOMERS ──────────────────────────────────────────
function CustomersPage({ role, setPage }) {
  const isAdmin = role === "admin";
  const { customers, setCustomers, orders, setOrders } = useApp();
  const [search,     setSearch]    = useState("");
  const [viewC,      setViewC]     = useState(null);
  const [editC,      setEditC]     = useState(null);
  const [editForm,   setEditForm]  = useState({});
  const [editErrors, setEditErrors]= useState({});
  const [loading,    setLoading]   = useState(true);
  const [saving,     setSaving]    = useState(false);
  const [showAdd,    setShowAdd]   = useState(false);
  const [addForm,    setAddForm]   = useState({name:"",phone:"",address:""});
  const [addErrors,  setAddErrors] = useState({});
  const [addSaving,  setAddSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [custData, trxData] = await Promise.all([getAllCustomers(), getTransactions(undefined,undefined,undefined,0,200)]);
        setCustomers(Array.isArray(custData) ? custData : (custData.content||[]));
        setOrders(Array.isArray(trxData) ? trxData : (trxData.content||[]));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = search
    ? customers.filter(c => (c.name||"").toLowerCase().includes(search.toLowerCase()) || (c.phone||"").toLowerCase().includes(search.toLowerCase()))
    : customers;

  const openEdit = c => { setEditC(c); setEditForm({name:c.name,phone:c.phone,address:c.address}); setEditErrors({}); };
  const upd = k => e => { setEditForm(f=>({...f,[k]:e.target.value})); setEditErrors(v=>({...v,[k]:""})); };
  const validateEdit = () => {
    const e={};
    if (!editForm.name?.trim())  e.name  = "Nama wajib diisi";
    if (!editForm.phone?.trim()) e.phone = "No. HP wajib diisi";
    return e;
  };
  const saveEdit = async () => {
    const e = validateEdit(); if (Object.keys(e).length) { setEditErrors(e); return; }
    setSaving(true);
    try {
      await updateCustomer(editC.id, editForm);
      setCustomers(p => p.map(c => c.id===editC.id ? {...c,...editForm} : c));
      setEditC(null);
    } catch (err) { setEditErrors({ name: err?.response?.data?.message||"Gagal menyimpan." }); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    try { await deleteCustomer(id); setCustomers(p=>p.filter(x=>x.id!==id)); }
    catch (err) { console.error(err); }
  };
  const updAdd = k => e => { setAddForm(f=>({...f,[k]:e.target.value})); setAddErrors(v=>({...v,[k]:""})); };
  const validateAdd = () => {
    const e={};
    if (!addForm.name?.trim())  e.name  = "Nama wajib diisi";
    if (!addForm.phone?.trim()) e.phone = "No. HP wajib diisi";
    return e;
  };
  const handleAdd = async () => {
    const e = validateAdd(); if (Object.keys(e).length) { setAddErrors(e); return; }
    setAddSaving(true);
    try {
      const created = await createCustomer(addForm);
      setCustomers(p=>[...p,created]);
      setAddForm({name:"",phone:"",address:""});
      setAddErrors({});
      setShowAdd(false);
    } catch (err) { setAddErrors({ name: err?.response?.data?.message||"Gagal menyimpan customer." }); }
    finally { setAddSaving(false); }
  };

  const viewOrders = viewC ? orders.filter(o=>o.customerId===viewC.id) : [];
  const activeNav  = isAdmin ? "admin-customers" : "user-customers";

  return (
    <DashboardShell role={role} setPage={setPage} activeNav={activeNav}>
      <div className="page-header">
        <div><div className="page-title">Pelanggan</div><div className="page-sub">Kelola data pelanggan laundry Anda</div></div>
        <button className="btn btn-primary" onClick={()=>{setShowAdd(true);setAddForm({name:"",phone:"",address:""});setAddErrors({});}}>+ Pelanggan Baru</button>
      </div>
      <div className="search-wrap">
        <input className="search-input" placeholder="Cari pelanggan..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div className="card">
        {loading ? <PageLoading/> : filtered.length===0
          ? <div className="empty"><div className="empty-icon">👥</div><div className="empty-text">Tidak ada pelanggan ditemukan</div></div>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Nama</th><th>No. HP</th><th>Alamat</th><th>Aksi</th></tr></thead>
                <tbody>{filtered.map(c=>(
                  <tr key={c.id}>
                    <td><div style={{fontWeight:500}}>{c.name}</div></td>
                    <td style={{fontSize:13}}>{c.phone}</td>
                    <td style={{fontSize:13}}>{c.address||"-"}</td>
                    <td>
                      <div style={{display:"flex",gap:6}}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>setViewC(c)}>Lihat</button>
                        <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(c)}>Edit</button>
                        {isAdmin && <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(c.id)}>Hapus</button>}
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
      </div>

      {viewC && (
        <Modal title="Detail Pelanggan" onClose={()=>setViewC(null)} footer={<button className="btn btn-secondary" onClick={()=>setViewC(null)}>Tutup</button>}>
          <div className="info-row"><span className="info-label">ID</span><span className="info-value">#{viewC.id}</span></div>
          <div className="info-row"><span className="info-label">Nama</span><span className="info-value">{viewC.name}</span></div>
          <div className="info-row"><span className="info-label">No. HP</span><span className="info-value">{viewC.phone}</span></div>
          <div className="info-row"><span className="info-label">Alamat</span><span className="info-value">{viewC.address||"-"}</span></div>
          {viewOrders.length>0 && (
            <div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:10}}>Pesanan Terakhir</div>
              {viewOrders.slice(0,5).map(o=>(
                <div key={o.id} style={{fontSize:12,color:"var(--steel)",padding:"6px 0",borderBottom:"1px solid var(--hairline-soft)"}}>
                  {o.id} · {o.status} · {formatRp(o.totalPrice)}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {editC && (
        <Modal title="Edit Pelanggan" onClose={()=>setEditC(null)} footer={<><button className="btn btn-secondary" onClick={()=>setEditC(null)}>Batal</button><button className="btn btn-primary" onClick={saveEdit} disabled={saving}>{saving?"Menyimpan…":"Simpan"}</button></>}>
          <div className="field"><label>Nama</label><input placeholder="Ahmad Rizky" value={editForm.name} onChange={upd("name")}/>{editErrors.name&&<div className="err">{editErrors.name}</div>}</div>
          <div className="field"><label>No. HP</label><input placeholder="08123456789" value={editForm.phone} onChange={upd("phone")}/>{editErrors.phone&&<div className="err">{editErrors.phone}</div>}</div>
          <div className="field"><label>Alamat</label><textarea placeholder="Jl. Merdeka 123" value={editForm.address} onChange={upd("address")}/></div>
        </Modal>
      )}

      {showAdd && (
        <Modal title="Pelanggan Baru" onClose={()=>setShowAdd(false)} footer={<><button className="btn btn-secondary" onClick={()=>setShowAdd(false)}>Batal</button><button className="btn btn-primary" onClick={handleAdd} disabled={addSaving}>{addSaving?"Menyimpan…":"Simpan"}</button></>}>
          <div className="field"><label>Nama</label><input placeholder="Ahmad Rizky" value={addForm.name} onChange={updAdd("name")}/>{addErrors.name&&<div className="err">{addErrors.name}</div>}</div>
          <div className="field"><label>No. HP</label><input placeholder="08123456789" value={addForm.phone} onChange={updAdd("phone")}/>{addErrors.phone&&<div className="err">{addErrors.phone}</div>}</div>
          <div className="field"><label>Alamat</label><textarea placeholder="Jl. Merdeka 123" value={addForm.address} onChange={updAdd("address")}/></div>
        </Modal>
      )}
    </DashboardShell>
  );
}

// ── ADMIN SERVICES ────────────────────────────────────────────
function AdminServices({ setPage }) {
  const { services, setServices } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editSvc, setEditSvc] = useState(null);
  const [form,    setForm]    = useState({serviceName:"",serviceType:"REGULAR",pricePerKg:"",estimatedHours:""});
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const upd = k => e => { setForm(f=>({...f,[k]:e.target.value})); setErrors(v=>({...v,[k]:""})); };

  useEffect(() => {
    getAllServices().then(data=>setServices(Array.isArray(data)?data:(data.content||[]))).catch(console.error).finally(()=>setLoading(false));
  }, []);

  const validate = () => {
    const e={};
    if (!form.serviceName.trim()) e.serviceName = "Nama wajib diisi";
    if (!form.pricePerKg)         e.pricePerKg  = "Harga wajib diisi";
    else if (isNaN(form.pricePerKg)||Number(form.pricePerKg)<=0) e.pricePerKg = "Harga harus angka positif";
    if (!form.estimatedHours)     e.estimatedHours = "Durasi wajib diisi";
    else if (isNaN(form.estimatedHours)||Number(form.estimatedHours)<=0) e.estimatedHours = "Durasi harus angka positif";
    return e;
  };

  const handleAdd = async () => {
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const created = await createService({ serviceName:form.serviceName, serviceType:form.serviceType, pricePerKg:Number(form.pricePerKg), estimatedHours:Number(form.estimatedHours) });
      setServices(p=>[...p,created]);
      setForm({serviceName:"",serviceType:"REGULAR",pricePerKg:"",estimatedHours:""}); setErrors({}); setShowAdd(false);
    } catch (err) { setErrors({ serviceName: err?.response?.data?.message||"Gagal menyimpan layanan." }); }
    finally { setSaving(false); }
  };

  const openEdit = s => { setEditSvc(s); setForm({serviceName:s.serviceName,serviceType:s.serviceType,pricePerKg:String(s.pricePerKg),estimatedHours:String(s.estimatedHours)}); setErrors({}); };

  const handleEdit = async () => {
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const updated = await updateService(editSvc.id, { serviceName:form.serviceName, serviceType:form.serviceType, pricePerKg:Number(form.pricePerKg), estimatedHours:Number(form.estimatedHours) });
      setServices(p=>p.map(s=>s.id===editSvc.id?(updated||{...s,...form,pricePerKg:Number(form.pricePerKg),estimatedHours:Number(form.estimatedHours)}):s));
      setEditSvc(null); setForm({serviceName:"",serviceType:"REGULAR",pricePerKg:"",estimatedHours:""});
    } catch (err) { setErrors({ serviceName: err?.response?.data?.message||"Gagal memperbarui layanan." }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await deleteService(id); setServices(p=>p.filter(x=>x.id!==id)); }
    catch (err) { console.error(err); }
  };

  const serviceFormFields = (
    <>
      <div className="field"><label>Nama Layanan</label><input placeholder="Cuci Reguler" value={form.serviceName} onChange={upd("serviceName")}/>{errors.serviceName&&<div className="err">{errors.serviceName}</div>}</div>
      <div className="two-col">
        <div className="field"><label>Tipe Layanan</label><select value={form.serviceType} onChange={upd("serviceType")}><option value="REGULAR">REGULAR</option><option value="EXPRESS">EXPRESS</option><option value="PREMIUM">PREMIUM</option></select></div>
        <div className="field"><label>Harga Per Kg (Rp)</label><input type="number" placeholder="7000" min="0" value={form.pricePerKg} onChange={upd("pricePerKg")}/>{errors.pricePerKg&&<div className="err">{errors.pricePerKg}</div>}</div>
      </div>
      <div className="field"><label>Estimasi Jam</label><input type="number" placeholder="3" min="1" value={form.estimatedHours} onChange={upd("estimatedHours")}/>{errors.estimatedHours&&<div className="err">{errors.estimatedHours}</div>}</div>
    </>
  );

  return (
    <DashboardShell role="admin" setPage={setPage} activeNav="admin-services">
      <div className="page-header">
        <div><div className="page-title">Layanan</div><div className="page-sub">Kelola jenis dan harga layanan laundry</div></div>
        <button className="btn btn-primary" onClick={()=>{setShowAdd(true);setForm({serviceName:"",serviceType:"REGULAR",pricePerKg:"",estimatedHours:""});setErrors({});}}>+ Tambah Layanan</button>
      </div>
      {loading ? <PageLoading/> : (
        <div className="pricing-grid" style={{marginBottom:20}}>
          {services.map((s,i)=>(
            <div key={s.id} className={"pricing-card"+(i===1?" featured":"")}>
              {i===1 && <span className="badge badge-popular" style={{marginBottom:12,display:"inline-block"}}>{s.serviceType}</span>}
              <div style={{fontWeight:600,fontSize:18,color:"var(--ink)",letterSpacing:"-0.3px"}}>{s.serviceName}</div>
              <div className="pricing-price">{formatRp(s.pricePerKg)}<span style={{fontSize:16,fontWeight:400,color:"var(--steel)"}}>/kg</span></div>
              <div style={{fontSize:13,color:"var(--steel)",marginBottom:20}}>⏱ {s.estimatedHours} jam</div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(s)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(s.id)}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showAdd && <Modal title="Tambah Layanan" onClose={()=>setShowAdd(false)} footer={<><button className="btn btn-secondary" onClick={()=>setShowAdd(false)}>Batal</button><button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving?"Menyimpan…":"Simpan"}</button></>}>{serviceFormFields}</Modal>}
      {editSvc && <Modal title="Edit Layanan" onClose={()=>setEditSvc(null)} footer={<><button className="btn btn-secondary" onClick={()=>setEditSvc(null)}>Batal</button><button className="btn btn-primary" onClick={handleEdit} disabled={saving}>{saving?"Menyimpan…":"Simpan"}</button></>}>{serviceFormFields}</Modal>}
    </DashboardShell>
  );
}

// ── USER SERVICES (view only) ─────────────────────────────────
function UserServices({ setPage }) {
  const { services, setServices } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllServices().then(data=>setServices(Array.isArray(data)?data:(data.content||[]))).catch(console.error).finally(()=>setLoading(false));
  }, []);

  return (
    <DashboardShell role="user" setPage={setPage} activeNav="user-services">
      <div className="page-header">
        <div><div className="page-title">Layanan</div><div className="page-sub">Daftar layanan laundry yang tersedia</div></div>
      </div>
      {loading ? <PageLoading/> : services.length===0
        ? <div className="empty"><div className="empty-icon">🧺</div><div className="empty-text">Belum ada layanan</div></div>
        : (
          <div className="pricing-grid" style={{marginBottom:20}}>
            {services.map((s,i)=>(
              <div key={s.id} className={"pricing-card"+(i===1?" featured":"")}>
                {i===1 && <span className="badge badge-popular" style={{marginBottom:12,display:"inline-block"}}>{s.serviceType}</span>}
                <div style={{fontWeight:600,fontSize:18,color:"var(--ink)",letterSpacing:"-0.3px"}}>{s.serviceName}</div>
                <div className="pricing-price">{formatRp(s.pricePerKg)}<span style={{fontSize:16,fontWeight:400,color:"var(--steel)"}}>/kg</span></div>
                <div style={{fontSize:13,color:"var(--steel)",marginBottom:12}}>⏱ {s.estimatedHours} jam</div>
                <span className="badge badge-green-soft">{s.serviceType}</span>
              </div>
            ))}
          </div>
        )}
    </DashboardShell>
  );
}

// ── BUSINESS SERVICES DROPDOWN ────────────────────────────────
function ServicesDropdown({ services }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="business-services-toggle"
        onClick={() => setOpen(v => !v)}
      >
        <span>🧺 {services.length} Layanan Tersedia</span>
        <span className={"chevron" + (open?" open":"")}>▼</span>
      </button>
      {open && (
        <div className="business-services-list">
          {services.length === 0
            ? <div style={{padding:"12px 14px",fontSize:13,color:"var(--stone)"}}>Belum ada layanan</div>
            : services.map(s => (
              <div key={s.id} className="business-service-row">
                <div>
                  <div className="business-service-name">{s.serviceName}</div>
                  <div className="business-service-meta">⏱ {s.estimatedHours} jam · {s.serviceType}</div>
                </div>
                <div className="business-service-price">{formatRp(s.pricePerKg)}<span style={{fontWeight:400,color:"var(--stone)",fontSize:11}}>/kg</span></div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── BUSINESS PAGE (profile bisnis tunggal) ───────────────────
function BusinessPage({ role, setPage }) {
  const { currentUser } = useApp();
  const { customers, setCustomers, services, setServices } = useApp();
  const [biz,      setBiz]      = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [bizName,  setBizName]  = useState("");
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState("");
  const activeNav = role === "admin" ? "admin-business" : "user-business";
  const isOwner   = (currentUser?.role||"").toUpperCase() === "OWNER" || role === "admin";

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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveName = async () => {
    if (!bizName.trim()) return;
    setSaving(true);
    try {
      // Optimistic update — replace with real API call if available
      setBiz(b => ({...b, name: bizName, businessName: bizName}));
      setSaveMsg("Nama bisnis berhasil diperbarui!");
      setEditing(false);
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      console.error(err);
    } finally { setSaving(false); }
  };

  const bizDisplayName = biz?.businessName || currentUser?.businessName || "Bisnis Anda";
  const initial        = bizDisplayName[0]?.toUpperCase() || "B";
  const ownerName      = biz?.ownerName ?? biz?.ownerFullName ?? biz?.owner ?? biz?.owner_name ?? currentUser?.ownerName ?? "-";

  return (
    <DashboardShell role={role} setPage={setPage} activeNav={activeNav}>
      {loading ? <PageLoading/> : !biz ? (
        <div className="empty"><div className="empty-icon">🏪</div><div className="empty-text">Data bisnis tidak ditemukan</div></div>
      ) : (
        <div style={{width:"100%",maxWidth:860}}>
          <div className="page-header">
            <div>
              <div className="page-title">Profil Bisnis</div>
              <div className="page-sub">Informasi bisnis laundry Anda</div>
            </div>
          </div>

          {saveMsg && <div className="alert alert-success" style={{marginBottom:20}}>{saveMsg}</div>}

          {/* Hero Card */}
          <div style={{background:"linear-gradient(135deg,var(--teal-deep),var(--teal-mid))",borderRadius:"var(--r-xl)",padding:"36px 40px",marginBottom:24,display:"flex",alignItems:"center",gap:28}}>
            <div style={{width:72,height:72,borderRadius:"var(--r-lg)",background:"var(--green)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:700,color:"var(--teal-deep)",flexShrink:0}}>
              {initial}
            </div>
            <div style={{flex:1}}>
              {editing ? (
                <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  <input
                    value={bizName}
                    onChange={e=>setBizName(e.target.value)}
                    style={{fontSize:22,fontWeight:700,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:"var(--r-md)",color:"var(--on-dark)",padding:"6px 12px",fontFamily:"inherit",outline:"none",flex:1,minWidth:180}}
                  />
                  <button className="btn btn-on-dark btn-sm" onClick={handleSaveName} disabled={saving}>{saving?"Menyimpan…":"Simpan"}</button>
                  <button className="btn btn-sec-dark btn-sm" onClick={()=>{setEditing(false);setBizName(bizDisplayName);}}>Batal</button>
                </div>
              ) : (
                <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <div style={{fontSize:26,fontWeight:700,color:"var(--on-dark)",letterSpacing:"-0.5px"}}>{bizDisplayName}</div>
                  {/* {isOwner && (
                    <button className="btn btn-sec-dark btn-sm" onClick={()=>setEditing(true)}>✏️ Edit Nama</button>
                  )} */}
                </div>
              )}
              {/* <div style={{fontSize:13,color:"var(--on-dark-muted)",marginTop:6,display:"flex",alignItems:"center",gap:6}}>
                <span>👤</span><span>{ownerName}</span>
                <span className="badge badge-owner" style={{fontSize:10,padding:"2px 7px"}}>OWNER</span>
              </div> */}
              {biz.address && <div style={{fontSize:12,color:"var(--on-dark-muted)",marginTop:4}}>📍 {biz.address}</div>}
              {biz.phone   && <div style={{fontSize:12,color:"var(--on-dark-muted)",marginTop:2}}>📞 {biz.phone}</div>}
            </div>
          </div>

          {/* Stats Row */}
          <div className="stat-row" style={{marginBottom:24}}>
            <div className="stat-card"><div className="stat-card-label">Pelanggan</div><div className="stat-card-value">{customers.length}</div></div>
            <div className="stat-card"><div className="stat-card-label">Layanan</div><div className="stat-card-value">{services.length}</div></div>
            {biz.totalRevenue != null && (
              <div className="stat-card"><div className="stat-card-label">Pendapatan</div><div className="stat-card-value green" style={{fontSize:22}}>{formatRp(biz.totalRevenue)}</div></div>
            )}
          </div>

          {/* Services List */}
          <div className="card card-lg">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:600,color:"var(--ink)"}}>Daftar Layanan</div>
              {isOwner && <button className="btn btn-primary btn-sm" onClick={()=>setPage("admin-services")}>Kelola Layanan</button>}
            </div>
            {services.length === 0 ? (
              <div className="empty" style={{padding:"24px 0"}}><div className="empty-icon">🧺</div><div className="empty-text">Belum ada layanan terdaftar</div></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Nama Layanan</th><th>Tipe</th><th>Harga/kg</th><th>Estimasi</th></tr></thead>
                  <tbody>
                    {services.map(s=>(
                      <tr key={s.id}>
                        <td style={{fontWeight:500}}>{s.serviceName}</td>
                        <td><span className="badge badge-green-soft">{s.serviceType}</span></td>
                        <td style={{fontWeight:600,color:"var(--green-dark)"}}>{formatRp(s.pricePerKg)}/kg</td>
                        <td style={{color:"var(--steel)"}}>⏱ {s.estimatedHours} jam</td>
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

// ── PROFILE PAGE (view only) ──────────────────────────────────
function ProfilePage({ role, setPage }) {
  const { currentUser } = useApp();
  const isAdmin = role === "admin";
  const activeNav = isAdmin ? "admin-profile" : "user-profile";

  const initials = (currentUser?.fullName || currentUser?.username || "?")[0].toUpperCase();
  const roleBadge = isAdmin ? "OWNER" : "EMPLOYEE";
  const roleBadgeClass = isAdmin ? "badge-owner" : "badge-employee";

  return (
    <DashboardShell role={role} setPage={setPage} activeNav={activeNav}>
      <div style={{width:"100%",maxWidth:900}}>
        <div className="page-header">
          <div>
            <div className="page-title">Profil Saya</div>
            <div className="page-sub">Informasi akun Anda</div>
          </div>
        </div>

        <div className="profile-shell">
          {/* Sidebar Card */}
          <div>
            <div className="profile-sidebar-card">
              <div className="profile-avatar-ring">
                {initials}
              </div>
              <div className="profile-name">{currentUser?.fullName}</div>
              <div className="profile-username">@{currentUser?.username}</div>
              <span className={"badge " + roleBadgeClass} style={{marginBottom:16}}>{roleBadge}</span>

              <div style={{width:"100%",borderTop:"1px solid var(--hairline)",paddingTop:16,marginTop:4}}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:12,textAlign:"left"}}>
                  <span style={{fontSize:14,marginTop:1}}>👤</span>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--stone)",textTransform:"uppercase",letterSpacing:"0.4px"}}>Nama Lengkap</div>
                    <div style={{fontSize:13,color:"var(--ink)",fontWeight:500,marginTop:2}}>{currentUser?.fullName || "-"}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:12,textAlign:"left"}}>
                  <span style={{fontSize:14,marginTop:1}}>🔑</span>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--stone)",textTransform:"uppercase",letterSpacing:"0.4px"}}>Username</div>
                    <div style={{fontSize:13,color:"var(--ink)",fontWeight:500,marginTop:2}}>{currentUser?.username || "-"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {/* Info Section */}
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

            {/* Role Badge Section */}
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

// ── ROUTER ────────────────────────────────────────────────────
function Router() {
  const { currentUser } = useApp();
  const [page, setPage] = useState(() => {
    if (!currentUser) return "login";
    const r = (currentUser.role||"").toUpperCase();
    return r==="OWNER"||r==="ADMIN" ? "admin-dashboard" : "user-dashboard";
  });

  const pages = {
    "login":              <LoginPage          setPage={setPage}/>,
    "register":           <RegisterPage       setPage={setPage}/>,
    // Admin
    "admin-dashboard":    <AdminDashboard     setPage={setPage}/>,
    "admin-transactions": <TransactionsPage   role="admin" setPage={setPage}/>,
    "admin-customers":    <CustomersPage      role="admin" setPage={setPage}/>,
    "admin-services":     <AdminServices      setPage={setPage}/>,
    "admin-business":     <BusinessPage       role="admin" setPage={setPage}/>,
    "admin-profile":      <ProfilePage        role="admin" setPage={setPage}/>,
    // Employee
    "user-dashboard":     <UserDashboard      setPage={setPage}/>,
    "user-orders":        <TransactionsPage   role="user"  setPage={setPage}/>,
    "user-customers":     <CustomersPage      role="user"  setPage={setPage}/>,
    "user-services":      <UserServices       setPage={setPage}/>,
    "user-business":      <BusinessPage       role="user"  setPage={setPage}/>,
    "user-profile":       <ProfilePage        role="user"  setPage={setPage}/>,
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