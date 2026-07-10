import { Reveal } from "@/components/ui/reveal";
import { StampBadge } from "@/components/brand/stamp-badge";
import { SectionHeader } from "./section-header";
import { RatingStars } from "@/components/product/rating-stars";

const TESTIMONIALS = [
  {
    name: "Julieta Méndez",
    role: "Entrena hace 4 años",
    quote:
      "Dejé de comprar suplementos por internet a ciegas. Acá te explican qué llevás y por qué, y se nota la diferencia en el cuerpo.",
  },
  {
    name: "Santiago Ruiz",
    role: "Powerlifting amateur",
    quote:
      "La creatina y las proteínas son mi base semanal. Pido por WhatsApp a la mañana y a la tarde ya lo tengo en casa.",
  },
  {
    name: "Delfina Acosta",
    role: "Alimentación consciente",
    quote:
      "Encontré superalimentos y snacks que no estaban en ningún lado. Además, el local tiene una onda hermosa.",
  },
  {
    name: "Gonzalo Ibáñez",
    role: "Cliente desde 2019",
    quote:
      "Lo que más valoro es que nunca te empujan a comprar de más. Te asesoran como si fueran parte de tu equipo.",
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-sand">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-start justify-between gap-8">
          <SectionHeader
            eyebrow="La comunidad"
            title="Lo que dicen quienes ya nos eligen"
          />
          <div className="hidden shrink-0 lg:block">
            <StampBadge eyebrow="4.8 / 5" label="En reseñas" rotate={8} />
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 90}
              className="flex flex-col gap-4 rounded-card border border-border/70 bg-cream p-6"
            >
              <RatingStars rating={5} />
              <p className="font-display text-lg italic leading-snug text-olive-900">
                “{t.quote}”
              </p>
              <div>
                <p className="font-sans text-sm font-semibold text-olive-900">
                  {t.name}
                </p>
                <p className="font-sans text-xs text-olive-500">{t.role}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
