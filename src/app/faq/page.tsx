import type { Metadata } from "next";
import Link from "next/link";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { FaqAccordion } from "@/components/home/faq-accordion";
import { FAQ_ITEMS } from "@/lib/faq";
import { buildWhatsappUrl } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description: "Retiro en tienda, pagos, cambios y devoluciones en Core Market.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Reveal className="flex flex-col items-center gap-3 text-center">
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
          Ayuda
        </span>
        <h1 className="font-display text-4xl font-medium text-olive-900">
          Preguntas frecuentes
        </h1>
        <p className="max-w-md font-sans text-base text-olive-700/80">
          Todo lo que necesitás saber sobre el retiro en el local, pagos y
          nuestra política de cambios.
        </p>
      </Reveal>

      <Reveal delay={100} className="mt-12">
        <FaqAccordion items={[...FAQ_ITEMS]} />
      </Reveal>

      <Reveal
        delay={160}
        className="mt-14 flex flex-col items-center gap-4 rounded-card bg-cream p-8 text-center"
      >
        <p className="font-display text-lg italic text-olive-900">
          ¿No encontraste tu respuesta?
        </p>
        <Link
          href={buildWhatsappUrl("Hola! Tengo una consulta que no encontré en las preguntas frecuentes.")}
          target="_blank"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-olive-900 px-6 py-3 font-sans text-sm font-semibold text-cream transition-colors hover:bg-olive-700"
        >
          <WhatsappLogo size={18} />
          Escribinos por WhatsApp
        </Link>
      </Reveal>
    </div>
  );
}
