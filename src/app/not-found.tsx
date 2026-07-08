import Link from "next/link";
import { Mark } from "@/components/brand/mark";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-5 px-6 py-24 text-center">
      <Mark className="h-10 w-10 text-olive-300" />
      <h1 className="font-display text-4xl font-medium text-olive-900">
        Esta góndola está vacía
      </h1>
      <p className="max-w-sm font-sans text-base text-olive-700/80">
        No encontramos la página que buscabas. Puede que se haya movido o que
        el link ya no esté vigente.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="cursor-pointer rounded-full bg-olive-900 px-6 py-3 font-sans text-sm font-semibold text-cream transition-colors hover:bg-olive-700"
        >
          Volver al inicio
        </Link>
        <Link
          href="/productos"
          className="cursor-pointer rounded-full border border-olive-700/30 px-6 py-3 font-sans text-sm font-semibold text-olive-900 transition-colors hover:border-olive-700 hover:bg-olive-700/5"
        >
          Ver productos
        </Link>
      </div>
    </div>
  );
}
