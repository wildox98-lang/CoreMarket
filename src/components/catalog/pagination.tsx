import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

export function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v) as [string, string][],
    );
    params.set("page", String(p));
    return `?${params.toString()}`;
  }

  return (
    <nav
      className="mt-14 flex items-center justify-center gap-2"
      aria-label="Paginación de productos"
    >
      <Link
        href={hrefFor(Math.max(page - 1, 1))}
        aria-disabled={page === 1}
        aria-label="Página anterior"
        className={`flex h-10 w-10 items-center justify-center rounded-full border border-border text-olive-700 transition-colors hover:bg-sand-dark/60 ${
          page === 1 ? "pointer-events-none opacity-30" : "cursor-pointer"
        }`}
      >
        <CaretLeft size={16} />
      </Link>
      {Array.from({ length: totalPages }).map((_, i) => {
        const p = i + 1;
        return (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-sans text-sm transition-colors ${
              p === page
                ? "bg-olive-900 text-cream"
                : "text-olive-700 hover:bg-sand-dark/60"
            }`}
          >
            {p}
          </Link>
        );
      })}
      <Link
        href={hrefFor(Math.min(page + 1, totalPages))}
        aria-disabled={page === totalPages}
        aria-label="Página siguiente"
        className={`flex h-10 w-10 items-center justify-center rounded-full border border-border text-olive-700 transition-colors hover:bg-sand-dark/60 ${
          page === totalPages ? "pointer-events-none opacity-30" : "cursor-pointer"
        }`}
      >
        <CaretRight size={16} />
      </Link>
    </nav>
  );
}
