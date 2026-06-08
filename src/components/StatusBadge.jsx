export function StatusBadge({ s }) {
  const map = {
    "PENDING": "badge-pending",
    "WASHING": "badge-washing",
    "DRYING": "badge-drying",
    "IRONING": "badge-ironing",
    "READY": "badge-ready",
    "COMPLETED": "badge-completed",
    "CANCELLED": "badge-cancelled",
    "PAID": "badge-paid",
    "UNPAID": "badge-unpaid"
  };
  return <span className={"badge " + (map[s] || "badge-pending")}>{s}</span>;
}