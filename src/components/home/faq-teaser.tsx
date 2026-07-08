import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "./section-header";
import { FaqAccordion } from "./faq-accordion";
import { FAQ_ITEMS } from "@/lib/faq";

export function FaqTeaser() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <SectionHeader
        eyebrow="Dudas frecuentes"
        title="Antes de que preguntes"
        align="center"
      />
      <Reveal delay={100} className="mt-10">
        <FaqAccordion items={FAQ_ITEMS.slice(0, 4)} />
      </Reveal>
      <Reveal delay={160} className="mt-8 flex justify-center">
        <Link
          href="/faq"
          className="group inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-olive-700 transition-colors hover:text-gold-dark"
        >
          Ver todas las preguntas
          <ArrowUpRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </Reveal>
    </section>
  );
}
