import { createContext, useState } from "react";
import { INIT_SERVICES, INIT_CUSTOMERS, INIT_ORDERS } from "../data/initialData";

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [customers, setCustomers] = useState(INIT_CUSTOMERS);
  const [orders, setOrders] = useState(INIT_ORDERS);
  const [services, setServices] = useState(INIT_SERVICES);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      customers, setCustomers,
      orders, setOrders,
      services, setServices
    }}>
      {children}
    </AppContext.Provider>
  );
};