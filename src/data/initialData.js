export const INIT_SERVICES = [
  { id: 1, name: "Cuci Reguler", price: 7000, unit: "kg", duration: "3 hari" },
  { id: 2, name: "Cuci Express", price: 12000, unit: "kg", duration: "1 hari" },
  { id: 3, name: "Cuci Setrika", price: 10000, unit: "kg", duration: "3 hari" },
  { id: 4, name: "Setrika Saja", price: 5000, unit: "kg", duration: "2 hari" },
  { id: 5, name: "Dry Cleaning", price: 25000, unit: "pcs", duration: "2 hari" },
];

export const INIT_CUSTOMERS = [
  { id: 1, name: "Ahmad Rizky", email: "ahmad@example.com", phone: "08123456789", room: "B-204", building: "Boys Hostel", bagNumber: "#247", password: "123456", role: "user" },
  { id: 2, name: "Siti Rahayu", email: "siti@example.com", phone: "08234567890", room: "A-101", building: "Girls Hostel", bagNumber: "#112", password: "123456", role: "user" },
  { id: 3, name: "Admin", email: "admin@laundryhub.com", phone: "08001234567", room: "-", building: "-", bagNumber: "-", password: "admin123", role: "admin" },
];

export const INIT_ORDERS = [
  { id: 1, customerId: 1, customerName: "Ahmad Rizky", bagNumber: "#247", serviceId: 1, serviceName: "Cuci Reguler", weight: 3, totalPrice: 21000, status: "Selesai", paymentStatus: "Lunas", createdAt: "2026-05-20", estimatedDone: "2026-05-23", notes: "" },
  { id: 2, customerId: 2, customerName: "Siti Rahayu", bagNumber: "#112", serviceId: 2, serviceName: "Cuci Express", weight: 2, totalPrice: 24000, status: "Diproses", paymentStatus: "Belum Bayar", createdAt: "2026-05-27", estimatedDone: "2026-05-28", notes: "Pisahkan baju putih" },
  { id: 3, customerId: 1, customerName: "Ahmad Rizky", bagNumber: "#247", serviceId: 3, serviceName: "Cuci Setrika", weight: 4, totalPrice: 40000, status: "Menunggu", paymentStatus: "Belum Bayar", createdAt: "2026-05-28", estimatedDone: "2026-05-31", notes: "" },
];