// ใช้ได้ทั้งฝั่ง server และ client (ไม่แตะฐานข้อมูล)

export const SORT_OPTIONS = [
  { key: "recommended", label: "แนะนำ" },
  { key: "rating", label: "หอมติดอันดับ" },
  { key: "price-asc", label: "ราคาต่ำ-สูง" },
  { key: "price-desc", label: "ราคาสูง-ต่ำ" },
  { key: "name", label: "ชื่อ ก-ฮ" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export function isSortKey(value: unknown): value is SortKey {
  return SORT_OPTIONS.some((option) => option.key === value);
}

export function catalogHref(params: { q?: string; category?: number; sort?: SortKey }): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", String(params.category));
  if (params.sort && params.sort !== "recommended") search.set("sort", params.sort);
  const query = search.toString();
  return query ? `/?${query}` : "/";
}
