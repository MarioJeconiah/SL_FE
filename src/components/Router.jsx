import { useState } from "react";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { AdminDashboard } from "../pages/AdminDashboard";
import { UserDashboard } from "../pages/UserDashboard";
import { TransactionsPage } from "../pages/TransactionsPage";
import { CustomersPage } from "../pages/CustomersPage";
import { AdminServices } from "../pages/AdminServices";
import { UserServices } from "../pages/UserServices";
import { BusinessPage } from "../pages/BusinessPage";
import { ProfilePage } from "../pages/ProfilePage";
import { useApp } from "../hooks/useApp";

export function Router() {
  const { currentUser } = useApp();
  const [page, setPage] = useState(() => {
    if (!currentUser) return "login";
    const r = (currentUser.role || "").toUpperCase();
    return r === "OWNER" || r === "ADMIN" ? "admin-dashboard" : "user-dashboard";
  });

  const pages = {
    "login": <LoginPage setPage={setPage} />,
    "register": <RegisterPage setPage={setPage} />,
    "admin-dashboard": <AdminDashboard setPage={setPage} />,
    "admin-transactions": <TransactionsPage role="admin" setPage={setPage} />,
    "admin-customers": <CustomersPage role="admin" setPage={setPage} />,
    "admin-services": <AdminServices setPage={setPage} />,
    "admin-business": <BusinessPage role="admin" setPage={setPage} />,
    "admin-profile": <ProfilePage role="admin" setPage={setPage} />,
    "user-dashboard": <UserDashboard setPage={setPage} />,
    "user-orders": <TransactionsPage role="user" setPage={setPage} />,
    "user-customers": <CustomersPage role="user" setPage={setPage} />,
    "user-services": <UserServices setPage={setPage} />,
    "user-business": <BusinessPage role="user" setPage={setPage} />,
    "user-profile": <ProfilePage role="user" setPage={setPage} />,
  };
  return pages[page] || <div>Page not found</div>;
}