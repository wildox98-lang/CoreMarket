import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import type { CategoryShowcaseItem } from "@/lib/queries";

export function CategoryShowcase({ categories }: { categories: CategoryShowcaseItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, i) => (
        <Reveal key={category.slug} delay={i * 60}>
          <Link
            href={`/productos?categoria=${category.slug}`}
            className="group relative flex h-56 flex-col justify-between overflow-hidden rounded-card bg-olive-900 p-6 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative z-10 flex flex-col gap-1">
              <h3 className="font-display text-2xl font-medium text-cream">{category.name}</h3>
              <p className="font-sans text-sm text-cream/60">
                {category.productCount}+ productos
              </p>
            </div>

            <span className="group/link relative z-10 inline-flex w-fit items-center gap-1.5 font-sans text-sm font-semibold text-gold transition-colors group-hover:text-gold-light">
              Ver
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
              />
            </span>

            <div className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 opacity-90 transition-transform duration-300 group-hover:scale-105 sm:h-44 sm:w-44">
              <Image
                src={category.image}
                alt=""
                fill
                sizes="200px"
                className="object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]"
              />
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
