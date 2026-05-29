import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import "./styles/global.css";

import RolePage from "./pages/auth/RolePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import UserDashboard from "./pages/user/UserDashboard";
import UserOrders from "./pages/user/UserOrders";
import UserNewOrder from "./pages/user/UserNewOrder";
import UserProfile from "./pages/user/UserProfile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminCustomers from "./pages/admin/AdminCustomer";
import AdminServices from "./pages/admin/AdminServices";

function App() {
  const [page, setPage] = useState("role");

  const renderPage = () => {
    switch (page) {
      case "role": return <RolePage setPage={setPage} />;
      case "login-user": return <LoginPage role="user" setPage={setPage} />;
      case "login-admin": return <LoginPage role="admin" setPage={setPage} />;
      case "register": return <RegisterPage setPage={setPage} />;

      case "user-dashboard": return <UserDashboard setPage={setPage} />;
      case "user-orders": return <UserOrders setPage={setPage} />;
      case "user-new-order": return <UserNewOrder setPage={setPage} />;
      case "user-profile": return <UserProfile setPage={setPage} />;

      case "admin-dashboard": return <AdminDashboard setPage={setPage} />;
      case "admin-transactions": return <AdminTransactions setPage={setPage} />;
      case "admin-customers": return <AdminCustomers setPage={setPage} />;
      case "admin-services": return <AdminServices setPage={setPage} />;

      default: return <RolePage setPage={setPage} />;
    }
  };

  return (
    <AppProvider>
      <div className="app">
        {renderPage()}
      </div>
    </AppProvider>
  );
}

export default App;