import {
  Leaf,
  ShieldCheck,
  Truck,
  ChatCircleDots,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "./section-header";

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Calidad verificada",
    description:
      "Cada producto pasa por nuestro control antes de llegar a la góndola. Sin marcas truchas, sin vencidos.",
  },
  {
    icon: Leaf,
    title: "Ingredientes reales",
    description:
      "Priorizamos fórmulas limpias, sin rellenos innecesarios. Leemos cada etiqueta antes de sumarla al catálogo.",
  },
  {
    icon: Truck,
    title: "Entrega el mismo día",
    description:
      "Pedís antes de las 15hs y lo recibís hoy en CABA. También podés retirar gratis en el local.",
  },
  {
    icon: ChatCircleDots,
    title: "Asesoramiento real",
    description:
      "Nuestro equipo entrena y prueba lo que vende. Escribinos por WhatsApp si tenés dudas sobre qué elegir.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-olive-900 text-cream">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeader
          eyebrow="Por qué Core Market"
          title="Elegido por quienes no negocian su rendimiento"
          align="center"
        />
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason, i) => (
            <Reveal
              key={reason.title}
              delay={i * 90}
              className="flex flex-col items-center gap-4 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-cream/25 text-gold">
                <reason.icon size={26} />
              </span>
              <h3 className="font-display text-xl font-medium">{reason.title}</h3>
              <p className="font-sans text-sm leading-relaxed text-cream/70">
                {reason.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
