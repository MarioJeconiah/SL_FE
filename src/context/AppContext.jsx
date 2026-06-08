import { createContext, useState } from "react";
import { getCurrentUser } from "../services/authService";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  if (localStorage.getItem("user") === "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser, customers, setCustomers, orders, setOrders, services, setServices }}>
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;