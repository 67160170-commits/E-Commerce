// ฟังก์ชันช่วยแสดงผล ไม่แตะฐานข้อมูล

export function formatPrice(baht: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(baht);
}

export type StockStatus = "in" | "low" | "out";

export function stockStatus(product: { stock: number; low_stock_threshold: number }): StockStatus {
  if (product.stock <= 0) return "out";
  if (product.stock <= product.low_stock_threshold) return "low";
  return "in";
}
