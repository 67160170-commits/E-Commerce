import { stockStatus } from "@/lib/format";

export default function StockBadge({
  product,
  showCount = true,
}: {
  product: { stock: number; low_stock_threshold: number };
  showCount?: boolean;
}) {
  const status = stockStatus(product);
  if (status === "in") return null;

  return status === "out" ? (
    <span className="inline-block rounded-full bg-line px-2.5 py-0.5 text-xs font-medium text-ink-soft">
      สินค้าหมด
    </span>
  ) : (
    <span className="inline-block rounded-full bg-citrus/20 px-2.5 py-0.5 text-xs font-medium text-ink">
      {showCount ? `เหลือ ${product.stock} ชิ้น` : "เหลือน้อย"}
    </span>
  );
}
