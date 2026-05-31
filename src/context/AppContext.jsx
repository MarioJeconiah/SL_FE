import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  // 1. Ambil data langsung dari localStorage saat pertama kali aplikasi dimuat
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error("Gagal parse data user dari localStorage", e);
      }
    }
    // Nilai Fallback jika belum login (Hardcode awal)
    return {
      id: 1,
      name: "User Frontend (Hardcode)",
      role: "user"
    };
  });
  
  const [orders, setOrders] = useState([
    { id: 101, customerId: 1, serviceName: "Cuci Kering", weight: 3, status: "Proses", paymentStatus: "Belum Bayar", totalPrice: 15000, createdAt: "2026-05-30" },
    // ... data orders hardcode kamu lainnya
  ]);

  // 2. useEffect ini sekarang hanya bertugas memantau sinkronisasi token jika diperlukan
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token aktif saat ini:", token);
    
    // Jika kamu memiliki endpoint validasi token / ambil profil asli, silakan pakai di sini.
    // Jika tidak ada, biarkan useEffect ini kosong atau hapus fetch-nya agar tidak membentur endpoint /login.
    
  }, []);

  return (
    <AppContext.Provider value={{ orders, setOrders, currentUser, setCurrentUser }}>
      {children}
    </AppContext.Provider>
  );
}