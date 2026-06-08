import api from "./api";

// Mengambil profil data toko laundry (nama, dll)
export const getBusinessProfile = async () => {
  const response = await api.get("/business");
  return response.data;
};

// Memperbarui nama toko menggunakan @RequestParam String businessName
export const updateBusinessName = async (businessName) => {
  const response = await api.put("/business", null, {
    params: {
      businessName: businessName
    }
  });
  return response.data;
};