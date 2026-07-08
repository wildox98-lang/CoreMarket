import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import type { Brand } from "@/generated/prisma/client";

export function BrandsStrip({ brands }: { brands: Brand[] }) {
  return (
    <section className="border-y border-border/70 bg-cream">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <Reveal>
          <p className="text-center font-sans text-xs font-semibold uppercase tracking-[0.25em] text-olive-500">
            Las marcas que elegimos para vos
          </p>
        </Reveal>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {brands.map((brand, i) => (
            <Reveal
              key={brand.id}
              delay={i * 60}
              className="flex items-center gap-3 opacity-80 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
              <span className="font-display text-lg italic text-olive-900">
                {brand.name}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
