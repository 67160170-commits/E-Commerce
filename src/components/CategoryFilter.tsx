import Link from "next/link";
import { catalogHref, type SortKey } from "@/lib/catalog-url";
import type { Category } from "@/lib/products";

type Props = {
  categories: Category[];
  activeId?: number;
  q: string;
  sort: SortKey;
};

function chipClass(active: boolean) {
  return `inline-flex whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors ${
    active
      ? "border-brand bg-brand text-white"
      : "border-line bg-white hover:border-brand hover:text-brand"
  }`;
}

export default function CategoryFilter({ categories, activeId, q, sort }: Props) {
  return (
    <nav aria-label="หมวดหมู่สินค้า" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-2 pb-1">
        <li>
          <Link
            href={`${catalogHref({ q, sort })}#catalog`}
            className={chipClass(!activeId)}
            aria-current={!activeId ? "true" : undefined}
          >
            ทั้งหมด
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`${catalogHref({ q, sort, category: category.id })}#catalog`}
              className={chipClass(activeId === category.id)}
              aria-current={activeId === category.id ? "true" : undefined}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
