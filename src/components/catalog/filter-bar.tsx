"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "@phosphor-icons/react/dist/ssr";
import type { Category, Brand } from "@/generated/prisma/client";

const SORT_OPTIONS = [
  { value: "az", label: "A - Z" },
  { value: "relevancia", label: "Relevancia" },
  { value: "novedades", label: "Novedades" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "descuentos", label: "Descuentos" },
] as const;

export function FilterBar({
  categories,
  brands,
}: {
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeCategoria = searchParams.get("categoria") ?? "";
  const activeMarca = searchParams.get("marca") ?? "";
  const activeSort = searchParams.get("sort") ?? "az";
  const activeQ = searchParams.get("q") ?? "";

  const hasFilters = activeCategoria || activeMarca || activeQ;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={activeCategoria}
          onChange={(e) => setParam("categoria", e.target.value)}
          aria-label="Filtrar por categoría"
          className="cursor-pointer rounded-full border border-border bg-cream px-4 py-2.5 font-sans text-sm text-olive-900 focus:border-olive-700 focus:outline-none focus:ring-2 focus:ring-gold/40"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={activeMarca}
          onChange={(e) => setParam("marca", e.target.value)}
          aria-label="Filtrar por marca"
          className="cursor-pointer rounded-full border border-border bg-cream px-4 py-2.5 font-sans text-sm text-olive-900 focus:border-olive-700 focus:outline-none focus:ring-2 focus:ring-gold/40"
        >
          <option value="">Todas las marcas</option>
          {brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={activeSort}
          onChange={(e) => setParam("sort", e.target.value)}
          aria-label="Ordenar por"
          className="ml-auto cursor-pointer rounded-full border border-border bg-cream px-4 py-2.5 font-sans text-sm text-olive-900 focus:border-olive-700 focus:outline-none focus:ring-2 focus:ring-gold/40"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {activeQ && (
            <FilterChip label={`"${activeQ}"`} onClear={() => setParam("q", "")} />
          )}
          {activeCategoria && (
            <FilterChip
              label={categories.find((c) => c.slug === activeCategoria)?.name ?? activeCategoria}
              onClear={() => setParam("categoria", "")}
            />
          )}
          {activeMarca && (
            <FilterChip
              label={brands.find((b) => b.slug === activeMarca)?.name ?? activeMarca}
              onClear={() => setParam("marca", "")}
            />
          )}
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="cursor-pointer font-sans text-xs font-semibold text-olive-500 underline-offset-2 hover:underline"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-olive-700/10 px-3 py-1.5 font-sans text-xs font-medium text-olive-700 transition-colors hover:bg-olive-700/20"
    >
      {label}
      <X size={12} />
    </button>
  );
}
