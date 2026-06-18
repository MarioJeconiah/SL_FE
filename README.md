# 🧺 SmartLaundry

Aplikasi Smart Laundry, tujuannya untuk membantu manajemen sistem usaha laundry lokal, manfaatnya mempermudah pencatatan transaksi, penyimpanan data pelanggan dan hasil transaksi mingguan, harian dan seluruhnya. 
Framework backend Springboot, Framework frontend React js.

Backend: https://github.com/MarioJeconiah/SL_API
---
## Teknologi
- **Frontend:** React 18 + Vite
- **Backend:** Spring Boot + JWT
- **HTTP Client:** Axios
---
## Instalasi

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
./mvnw spring-boot:run
```
---
## Konfigurasi

Buat `.env` di folder `SL_FE/`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```
---
## Fitur

| Fitur | Owner | Karyawan |
|-------|:-----:|:--------:|
| Dashboard | ✅ | ✅ |
| Laporan | ✅ | ✅ |
| Kelola Transaksi | ✅ | ✅ |
| Hapus Transaksi | ✅ | ❌ |
| Kelola Pelanggan | ✅ | ✅ |
| Kelola Layanan | ✅ | ❌ |
| Edit Profil Bisnis | ✅ | ❌ |
---
## Link Website
https://sl-fe-rqsk.vercel.app/
---
## Link Video
https://drive.google.com/file/d/1RTTyRGBN9W_soP9MelcEzBABiNsjyzy7/view
