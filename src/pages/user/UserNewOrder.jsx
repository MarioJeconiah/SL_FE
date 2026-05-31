import { useState, useContext, useEffect } from "react";
import Sidebar from "../../components/common/Sidebar";
import { formatRp } from "../../utils/helper";
import { AppContext } from "../../context/AppContext";
import api from "../../services/api";
import { getAllServices } from "../../services/laundryService";

export default function UserNewOrder({ setPage }) {
  const { currentUser } = useContext(AppContext);
  
  // State untuk menyimpan daftar jenis layanan dari backend
  const [laundryServices, setLaundryServices] = useState([]);
  
  // State Form Input
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "", // Fleksibel jika backend membutuhkan nomor telepon pelanggan baru
    serviceId: "",
    weight: "",
    notes: ""
  });
  
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Ambil daftar layanan laundry dari backend saat komponen dimuat
  useEffect(() => {
    getAllServices()
      .then(data => setLaundryServices(data))
      .catch(err => console.error("Gagal memuat jenis layanan:", err));
  }, []);

  const upd = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(v => ({ ...v, [k]: "" }));
  };

  // Mencari objek layanan yang dipilih untuk kalkulasi harga dinamis
  const selectedService = laundryServices.find(s => s.id === Number(form.serviceId));
  
  // Otomatis menghitung perkiraan total biaya (Berat x Harga Layanan)
  const totalEstimation = selectedService && form.weight ? Number(selectedService.price) * Number(form.weight) : 0;

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = "Nama customer wajib diisi";
    if (!form.serviceId) e.serviceId = "Pilih jenis layanan";
    if (!form.weight) e.weight = "Berat (kg) wajib diisi";
    else if (isNaN(form.weight) || Number(form.weight) <= 0) e.weight = "Berat harus berupa angka positif";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    try {
      setLoading(true);

      // Mapping payload request disesuaikan dengan struktur TransactionRequest.java backend kamu
      const payload = {
        customerName: form.customerName,
        customerPhone: form.customerPhone, 
        serviceId: Number(form.serviceId),
        weight: Number(form.weight),
        totalPrice: totalEstimation, // Mengirimkan total harga hasil kalkulasi frontend
        notes: form.notes
      };

      await api.post("/transactions", payload);
      
      setSuccess("Pesanan laundry berhasil disimpan!");
      setForm({ customerName: "", customerPhone: "", serviceId: "", weight: "", notes: "" });
      
      setTimeout(() => {
        setSuccess("");
        setPage("user-orders"); // Dialihkan kembali ke riwayat antrean pesanan
      }, 1500);
    } catch (error) {
      console.error("Gagal menyimpan transaksi baru:", error);
      setErrors({ api: "Gagal memproses transaksi ke server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar active="user-new-order" setPage={setPage} role={currentUser?.role?.toLowerCase()} />
      <div className="main">
        <div className="page-title">Buat Pesanan</div>
        <div className="page-sub">Catat cucian masuk dari pelanggan secara langsung</div>

        {success && <div className="alert alert-success">{success}</div>}
        {errors.api && <div className="alert alert-error">{errors.api}</div>}

        <div className="card" style={{ maxWidth: 520 }}>
          
          {/* INPUT MANUAL NAMA CUSTOMER */}
          <div className="field">
            <label>Nama Pelanggan (Customer)</label>
            <input 
              type="text" 
              placeholder="Ketik nama pelanggan..." 
              value={form.customerName} 
              onChange={upd("customerName")} 
            />
            {errors.customerName && <div className="err">{errors.customerName}</div>}
          </div>

          {/* INPUT MANUAL KONTAK CUSTOMER */}
          <div className="field">
            <label>No. HP Pelanggan (Opsional)</label>
            <input 
              type="text" 
              placeholder="Contoh: 0812xxxxxxxx" 
              value={form.customerPhone} 
              onChange={upd("customerPhone")} 
            />
          </div>

          {/* DROPDOWN PILIHAN SERVICE LAUNDRY */}
          <div className="field">
            <label>Layanan Laundry</label>
            <select value={form.serviceId} onChange={upd("serviceId")}>
              <option value="">-- Pilih Layanan --</option>
              {laundryServices.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} — {formatRp(s.price)}
                </option>
              ))}
            </select>
            {errors.serviceId && <div className="err">{errors.serviceId}</div>}
          </div>

          {/* INPUT BERAT */}
          <div className="field">
            <label>Berat Cucian (kg)</label>
            <input 
              type="number" 
              placeholder="Contoh: 3.5" 
              step="0.1" 
              min="0.1" 
              value={form.weight} 
              onChange={upd("weight")} 
            />
            {errors.weight && <div className="err">{errors.weight}</div>}
          </div>

          {/* INPUT CATATAN */}
          <div className="field">
            <label>Catatan Tambahan (Opsional)</label>
            <textarea 
              placeholder="Keterangan tambahan pakaian..." 
              value={form.notes} 
              onChange={upd("notes")} 
            />
          </div>

          {/* LIVE KALKULASI ESTIMASI BIAYA */}
          {totalEstimation > 0 && (
            <div style={{ background: "#eff6ff", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#4b5563" }}>
                Estimasi Total ({form.weight} kg x {formatRp(selectedService?.price)})
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#2563eb" }}>
                {formatRp(totalEstimation)}
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button className="btn-secondary" onClick={() => setPage("user-dashboard")} disabled={loading}>Batal</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Menyimpan..." : "Buat Pesanan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}