import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/home/section-header";
import { StampBadge } from "@/components/brand/stamp-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "La historia de Core Market: un almacén de barrio en Buenos Aires con estándar de alto rendimiento, desde 2016.",
};

const VALUES = [
  {
    title: "Calidad sin atajos",
    description:
      "Probamos cada producto antes de subirlo a la góndola. Si no lo tomaríamos nosotros, no lo vendemos.",
  },
  {
    title: "Cercanía real",
    description:
      "Somos un local de barrio, no un depósito. Nos conocemos con nuestros clientes por nombre.",
  },
  {
    title: "Transparencia",
    description:
      "Etiquetamos cada producto con lo que realmente contiene: sin letra chica ni promesas vacías.",
  },
  {
    title: "Comunidad",
    description:
      "Creemos en construir una comunidad alrededor de entrenar bien y comer mejor, no solo en vender.",
  },
];

export default function NosotrosPage() {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-5">
            <Reveal>
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
                Nuestra historia
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="font-display text-4xl font-medium text-olive-900 sm:text-5xl">
                Un almacén de barrio, con estándar de alto rendimiento
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="font-sans text-base leading-relaxed text-olive-700/90">
                Core Market nació en 2016 en Buenos Aires de una idea simple: en
                Buenos Aires no había un lugar donde el mundo del entrenamiento
                y el de la alimentación natural convivieran sin resignar
                calidad. Del otro lado del mostrador, atletas y curiosos de la
                buena alimentación se cruzaban con las mismas preguntas: ¿esto
                realmente sirve? ¿qué tiene adentro?
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p className="font-sans text-base leading-relaxed text-olive-700/90">
                Empezamos con una góndola de suplementos y una heladera de
                snacks caseros. Hoy seguimos siendo el mismo local de barrio,
                pero con un catálogo que crece cada mes, siempre con el mismo
                filtro: si no lo probamos nosotros primero, no entra.
              </p>
            </Reveal>
          </div>

          <Reveal delay={120} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-card shadow-lift">
              <Image
                src="https://picsum.photos/id/76/1000/1250"
                alt="El local de Core Market en Buenos Aires"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -left-6 -bottom-6 hidden sm:block">
              <StampBadge eyebrow="Desde" label="2016" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border/70 bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 sm:grid-cols-4">
          {[
            { value: 2016, label: "Abrimos nuestras puertas" },
            { value: 2500, suffix: "+", label: "Clientes en Buenos Aires" },
            { value: 300, suffix: "+", label: "Productos naturales" },
            { value: 5, suffix: "", label: "Personas en el equipo" },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80} className="text-center">
              <p className="font-display text-3xl font-medium text-olive-900 sm:text-4xl">
                <AnimatedCounter to={stat.value} suffix={stat.suffix ?? ""} />
              </p>
              <p className="mt-1 font-sans text-xs uppercase tracking-wide text-olive-500">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeader
          eyebrow="Lo que nos guía"
          title="Cuatro ideas que no negociamos"
          align="center"
        />
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value, i) => (
            <Reveal key={value.title} delay={i * 90} className="flex flex-col gap-3">
              <span className="font-display text-3xl italic text-gold-dark">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl font-medium text-olive-900">
                {value.title}
              </h3>
              <p className="font-sans text-sm leading-relaxed text-olive-700/80">
                {value.description}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-olive-900 text-cream">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-medium italic sm:text-4xl">
            ¿Querés conocernos en persona?
          </h2>
          <p className="max-w-md font-sans text-sm text-cream/75">
            Te esperamos en nuestro local para asesorarte sin apuro y contarte por
            qué elegimos cada producto de nuestro catálogo.
          </p>
          <Link
            href="/tienda"
            className="cursor-pointer rounded-full bg-gold px-6 py-3 font-sans text-sm font-semibold text-olive-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          >
            Ver la tienda
          </Link>
        </div>
      </section>
    </div>
  );
}
