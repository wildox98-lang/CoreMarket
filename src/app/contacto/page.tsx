import type { Metadata } from "next";
import { InstagramLogo, MapPin, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "@/components/contact/contact-form";
import { STORE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escribinos por WhatsApp o Instagram. Te respondemos a la brevedad.",
};

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Reveal className="flex flex-col gap-3">
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
          Contacto
        </span>
        <h1 className="font-display text-4xl font-medium text-olive-900">
          Hablemos
        </h1>
        <p className="max-w-md font-sans text-base text-olive-700/80">
          Contanos qué necesitás y te respondemos por el medio que prefieras.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <Reveal delay={80}>
          <ContactForm />
        </Reveal>

        <Reveal delay={140} className="flex flex-col gap-6 rounded-card bg-cream p-8">
          <ContactLink
            icon={<WhatsappLogo size={20} />}
            label="WhatsApp"
            value={STORE.whatsappDisplay}
            href={`https://wa.me/${STORE.whatsapp}`}
          />
          <ContactLink
            icon={<InstagramLogo size={20} />}
            label="Instagram"
            value={STORE.instagramHandle}
            href={STORE.instagram}
          />
          <ContactLink
            icon={<MapPin size={20} />}
            label="Dirección"
            value={STORE.address}
            href={STORE.mapsUrl}
          />

          <div className="mt-2 border-t border-border pt-6">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-olive-500">
              Horarios de atención
            </p>
            {STORE.hours.map((h) => (
              <p key={h.days} className="mt-2 font-sans text-sm text-olive-700">
                {h.days}: {h.hours}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function ContactLink({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-olive-700 transition-colors group-hover:border-olive-700">
        {icon}
      </span>
      <span>
        <span className="block font-sans text-xs uppercase tracking-wide text-olive-500">
          {label}
        </span>
        <span className="block font-sans text-sm font-medium text-olive-900 group-hover:text-gold-dark">
          {value}
        </span>
      </span>
    </a>
  );
}
