import Link from "next/link";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { ProductGrid } from "@/components/product/product-grid";
import { getCategories, getCategoryShowcase, getFilteredProducts } from "@/lib/queries";

export default async function Home() {
  const [categories, categoryShowcase, result] = await Promise.all([
    getCategories(),
    getCategoryShowcase(),
    getFilteredProducts({ page: 1 }),
  ]);

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-12">
        <CategoryShowcase categories={categoryShowcase} />
      </div>

      <nav
        aria-label="Categorías"
        className="-mx-6 mb-10 flex gap-3 overflow-x-auto px-6 pb-1"
      >
        <Link
          href="/productos"
          className="shrink-0 rounded-full bg-olive-900 px-5 py-2.5 font-sans text-sm font-medium text-cream"
        >
          Todos los productos
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/productos?categoria=${category.slug}`}
            className="shrink-0 rounded-full border border-border bg-cream px-5 py-2.5 font-sans text-sm font-medium text-olive-700 transition-colors hover:border-olive-700"
          >
            {category.name}
          </Link>
        ))}
      </nav>

      <ProductGrid products={result.products} />

      <div className="mt-14 flex justify-center">
        <Link
          href="/productos"
          className="cursor-pointer rounded-full border border-olive-700 px-8 py-3.5 font-sans text-sm font-semibold text-olive-700 transition-colors hover:bg-olive-700 hover:text-cream"
        >
          Ver todos los productos
        </Link>
      </div>
    </div>
  );
}
