import { Clock, MapPin, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "./section-header";
import { STORE, buildWhatsappUrl } from "@/lib/constants";

export function StoreLocation() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-[1600px] px-6 py-20">
        <SectionHeader
          eyebrow="Visitanos"
          title="Te esperamos en nuestro local"
          description="Retirá tu pedido sin costo, recibí asesoramiento en persona o simplemente vení a conocernos."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <Reveal className="overflow-hidden rounded-card border border-border/70">
            <iframe
              title="Ubicación de Core Market en el mapa"
              src={`https://www.google.com/maps?q=${encodeURIComponent(STORE.address)}&output=embed`}
              className="h-80 w-full lg:h-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>

          <Reveal
            delay={100}
            className="flex flex-col justify-center gap-6 rounded-card border border-border/70 bg-sand p-8"
          >
            <div className="flex items-start gap-3">
              <MapPin size={22} className="mt-0.5 shrink-0 text-gold-dark" />
              <div>
                <p className="font-sans text-sm font-semibold text-olive-900">
                  Dirección
                </p>
                <p className="font-sans text-sm text-olive-700/90">
                  {STORE.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={22} className="mt-0.5 shrink-0 text-gold-dark" />
              <div>
                <p className="font-sans text-sm font-semibold text-olive-900">
                  Horarios
                </p>
                {STORE.hours.map((h) => (
                  <p key={h.days} className="font-sans text-sm text-olive-700/90">
                    {h.days}: {h.hours}
                  </p>
                ))}
              </div>
            </div>

            <a
              href={buildWhatsappUrl("Hola! Quiero consultar sobre un producto.")}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-2 inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-olive-900 px-6 py-3 font-sans text-sm font-semibold text-cream transition-colors hover:bg-olive-700"
            >
              <WhatsappLogo size={18} />
              Escribinos por WhatsApp
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
