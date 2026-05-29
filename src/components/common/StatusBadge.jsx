export default function StatusBadge({ s }) {
  const m = {
    "Menunggu": "badge-menunggu",
    "Diproses": "badge-diproses",
    "Selesai": "badge-selesai",
    "Diambil": "badge-diambil",
    "Lunas": "badge-lunas",
    "Belum Bayar": "badge-belum",
    "DP": "badge-dp"
  };
  return <span className={`badge ${m[s] || "badge-menunggu"}`}>{s}</span>;
}