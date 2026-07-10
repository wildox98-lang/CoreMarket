import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { StampBadge } from "@/components/brand/stamp-badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-sand">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-2 lg:gap-16 lg:pb-28 lg:pt-20">
        <div className="flex flex-col gap-7">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-olive-700/30 px-4 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-olive-700">
              Belgrano · Buenos Aires
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="max-w-xl font-display text-5xl font-medium leading-[1.05] text-olive-900 sm:text-6xl">
              Lo que le das a tu cuerpo,{" "}
              <span className="italic text-olive-700">se nota</span>.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="max-w-md font-sans text-lg leading-relaxed text-olive-700/90">
              Alimentos naturales, productos gourmet y suplementos deportivos
              elegidos con el mismo estándar con el que entrenás: sin atajos,
              sin relleno.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/productos"
                className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-olive-900 px-7 py-3.5 font-sans text-sm font-semibold text-cream transition-colors hover:bg-olive-700"
              >
                Ver productos
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/tienda"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-olive-700/30 px-7 py-3.5 font-sans text-sm font-semibold text-olive-900 transition-colors hover:border-olive-700 hover:bg-olive-700/5"
              >
                Conocé la tienda
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120} className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card shadow-lift">
            <Image
              src="https://picsum.photos/id/65/1200/1500"
              alt="Core Market — nutrición real para tu rendimiento"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -left-6 -bottom-6 hidden sm:block">
            <StampBadge eyebrow="Calidad" label="Garantizada" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
