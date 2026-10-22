export type ProductDetails = { brand: string; scent: string; size: string; ingredients: string; usage: string; source_url: string };
export const PRODUCT_DETAIL_LABELS: Record<keyof ProductDetails, string> = {
  brand: "แบรนด์", scent: "แนวกลิ่น", size: "ขนาดบรรจุ / หน่วยขาย",
  ingredients: "ส่วนประกอบตามฉลาก", usage: "วิธีใช้และข้อควรระวัง", source_url: "ลิงก์ข้อมูลสินค้าต้นทาง",
};

export function readProductDetails(form: FormData): ProductDetails {
  return Object.fromEntries(Object.keys(PRODUCT_DETAIL_LABELS).map((key) => {
    const value = form.get(key);
    return [key, typeof value === "string" ? value.trim().slice(0, key === "source_url" ? 2000 : 1000) : ""];
  })) as ProductDetails;
}
