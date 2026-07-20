import type { Metadata } from "next";
import { FilterBar } from "@/components/catalog/filter-bar";
import { Pagination } from "@/components/catalog/pagination";
import { ProductGrid } from "@/components/product/product-grid";
import { getCategories, getBrands, getFilteredProducts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Gourmet, congelados, snacks, granolas, suplementos deportivos y mucho más. Filtrá por categoría, marca o precio.",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const filters = {
    q: first(params.q),
    categoria: first(params.categoria),
    marca: first(params.marca),
    sort: first(params.sort) as
      | "relevancia"
      | "precio-asc"
      | "precio-desc"
      | "novedades"
      | undefined,
    page: params.page ? Number(first(params.page)) : 1,
  };

  const [categories, brands, result] = await Promise.all([
    getCategories(),
    getBrands(),
    getFilteredProducts(filters),
  ]);

  const activeCategory = categories.find((c) => c.slug === filters.categoria);

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-12">
      <div className="mb-8 flex flex-col gap-2">
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
          Catálogo
        </span>
        <h1 className="font-display text-4xl font-medium text-olive-900">
          {activeCategory ? activeCategory.name : "Todos los productos"}
        </h1>
        {activeCategory && (
          <p className="max-w-xl font-sans text-base text-olive-700/80">
            {activeCategory.description}
          </p>
        )}
      </div>

      <FilterBar categories={categories} brands={brands} />

      <p className="mt-6 mb-4 font-sans text-sm text-olive-500">
        {result.total} {result.total === 1 ? "producto" : "productos"}
      </p>

      {result.products.length > 0 ? (
        <ProductGrid products={result.products} />
      ) : (
        <div className="flex flex-col items-center gap-2 py-24 text-center">
          <p className="font-display text-xl italic text-olive-500">
            No encontramos productos con esos filtros.
          </p>
          <p className="font-sans text-sm text-olive-500">
            Probá con otra búsqueda o quitá algún filtro.
          </p>
        </div>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        searchParams={{
          q: filters.q,
          categoria: filters.categoria,
          marca: filters.marca,
          sort: filters.sort,
        }}
      />
    </div>
  );
}
