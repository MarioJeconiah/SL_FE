import api from "./api";

// Mengambil semua daftar layanan laundry (Cuci Kering, Setrika, Ekspres, dll)
export const getAllServices = async () => {
  const response = await api.get("/services");
  return response.data;
};

// Mengambil detail satu layanan berdasarkan ID
export const getServiceById = async (id) => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};

// Menambah layanan baru (Gunakan DTO LaundryServiceRequest)
export const createService = async (serviceData) => {
  const response = await api.post("/services", serviceData);
  return response.data;
};

// Memperbarui data layanan
export const updateService = async (id, serviceData) => {
  const response = await api.put(`/services/${id}`, serviceData);
  return response.data;
};

// Menghapus layanan
export const deleteService = async (id) => {
  await api.delete(`/services/${id}`);
};