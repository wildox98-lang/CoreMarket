import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Reveal } from "@/components/ui/reveal";

const STATS = [
  { value: 2500, suffix: "+", label: "Clientes en Buenos Aires" },
  { value: 300, suffix: "+", label: "Productos naturales" },
  { value: 2016, suffix: "", label: "Abrimos nuestras puertas" },
  { value: 48, suffix: "hs", label: "Entrega en CABA" },
];

export function StatsBar() {
  return (
    <section className="border-y border-border/70 bg-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 sm:grid-cols-4">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 80} className="text-center">
            <p className="font-display text-3xl font-medium text-olive-900 sm:text-4xl">
              <AnimatedCounter to={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-1 font-sans text-xs uppercase tracking-wide text-olive-500">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
