export const formatRp = (n) => "Rp " + Number(n).toLocaleString("id-ID");
export const today = () => new Date().toISOString().slice(0, 10);

export const addDays = (d, n) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
};

export const STATUS_ORDER = ["Menunggu", "Diproses", "Selesai", "Diambil"];
export const PAYMENT_STATUS = ["Belum Bayar", "DP", "Lunas"];