import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";

export function AboutTeaser() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative order-2 aspect-[4/3] overflow-hidden rounded-card lg:order-1">
          <Image
            src="https://picsum.photos/id/76/1000/750"
            alt="El local de Core Market en Buenos Aires"
            fill
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="object-cover"
          />
        </Reveal>
        <div className="order-1 flex flex-col gap-5 lg:order-2">
          <Reveal>
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
              Nuestra historia
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display text-3xl font-medium text-olive-900 sm:text-4xl">
              Un almacén de barrio, con estándar de alto rendimiento
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="font-sans text-base leading-relaxed text-olive-700/90">
              Core Market nació en 2016 en Buenos Aires de una idea simple: en
              Buenos Aires no había un lugar donde el mundo del entrenamiento
              y el de la alimentación natural convivieran sin resignar
              calidad. Hoy seguimos probando cada producto antes de subirlo a
              la góndola, como el primer día.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <Link
              href="/nosotros"
              className="group inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-olive-700/30 px-6 py-3 font-sans text-sm font-semibold text-olive-900 transition-colors hover:border-olive-700 hover:bg-olive-700/5"
            >
              Conocer nuestra historia
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
