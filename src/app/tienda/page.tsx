import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/home/section-header";
import { StoreLocation } from "@/components/home/store-location";

export const metadata: Metadata = {
  title: "La Tienda",
  description: "Conocé nuestro local: dirección, horarios y qué vas a encontrar.",
};

const HIGHLIGHTS = [
  {
    photo: 53,
    title: "Góndola de suplementos",
    description: "Proteínas, creatina y suplementos organizados por objetivo, con etiquetas claras.",
  },
  {
    photo: 62,
    title: "Heladera de congelados",
    description: "Helados, panificados y preparaciones congeladas que renovamos toda la semana.",
  },
  {
    photo: 63,
    title: "Rincón gourmet y almacén",
    description: "Salsas, condimentos, granolas y productos de despensa para tu día a día.",
  },
];

export default function TiendaPage() {
  return (
    <div>
      <section className="relative">
        <div className="relative h-[50vh] min-h-[360px] w-full overflow-hidden">
          <Image
            src="https://picsum.photos/id/116/1600/900"
            alt="El local de Core Market en Buenos Aires"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-olive-900/40" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-cream">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em]">
            CABA · Buenos Aires
          </span>
          <h1 className="font-display text-4xl font-medium sm:text-5xl">La tienda</h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeader
          eyebrow="Qué vas a encontrar"
          title="Un local pensado para pasar y quedarte"
          description="Cada sector del local está organizado para que encuentres lo que buscás sin apuro, y descubras algo nuevo en el camino."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {HIGHLIGHTS.map((item, i) => (
            <Reveal key={item.title} delay={i * 100} className="flex flex-col gap-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-card">
                <Image
                  src={`https://picsum.photos/id/${item.photo}/700/525`}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 90vw, 30vw"
                  className="object-cover"
                />
              </div>
              <h3 className="font-display text-xl font-medium text-olive-900">
                {item.title}
              </h3>
              <p className="font-sans text-sm leading-relaxed text-olive-700/80">
                {item.description}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <StoreLocation />
    </div>
  );
}
