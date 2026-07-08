import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "./section-header";
import type { Category } from "@/generated/prisma/client";

export function CategoriesGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <SectionHeader
        eyebrow="Explorá"
        title="Todo lo que necesitás, en un solo lugar"
        description="Desde rendimiento deportivo hasta alimentación consciente: elegí por categoría y encontrá justo lo que buscás."
      />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category, i) => (
          <Reveal key={category.id} delay={i * 50}>
            <Link
              href={`/productos?categoria=${category.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-card"
            >
              <Image
                src={category.image}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-olive-900/80 via-olive-900/10 to-transparent" />
              <span className="absolute bottom-4 left-4 right-4 font-display text-lg font-medium text-cream">
                {category.name}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
