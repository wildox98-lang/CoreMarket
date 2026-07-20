import Link from "next/link";
import {
  InstagramLogo,
  WhatsappLogo,
  EnvelopeSimple,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/brand/logo";
import { NewsletterForm } from "./newsletter-form";
import { STORE, buildWhatsappUrl } from "@/lib/constants";
import { db } from "@/lib/db";

export default async function Footer() {
  const categories = await db.category.findMany({
    orderBy: { position: "asc" },
    take: 6,
    select: { slug: true, name: true },
  });

  return (
    <footer className="bg-olive-900 text-cream">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
          <Logo className="text-cream" />
          <p className="max-w-xs font-sans text-sm leading-relaxed text-cream/70">
            Nutrición real para quienes entrenan fuerte y comen bien. Desde
            Buenos Aires para todo CABA y el GBA.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <a
              href={STORE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Core Market"
              className="cursor-pointer rounded-full border border-cream/20 p-2 transition-colors hover:border-gold hover:text-gold"
            >
              <InstagramLogo size={18} />
            </a>
            <a
              href={buildWhatsappUrl("Hola! Quiero hacer una consulta.")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp de Core Market"
              className="cursor-pointer rounded-full border border-cream/20 p-2 transition-colors hover:border-gold hover:text-gold"
            >
              <WhatsappLogo size={18} />
            </a>
          </div>
        </div>

        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
            Categorías
          </p>
          <ul className="mt-4 flex flex-col gap-2.5 font-sans text-sm text-cream/80">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/productos?categoria=${c.slug}`}
                  className="transition-colors hover:text-gold"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
            Core Market
          </p>
          <ul className="mt-4 flex flex-col gap-2.5 font-sans text-sm text-cream/80">
            <li>
              <Link href="/nosotros" className="transition-colors hover:text-gold">
                Nosotros
              </Link>
            </li>
            <li>
              <Link href="/tienda" className="transition-colors hover:text-gold">
                La tienda
              </Link>
            </li>
            <li>
              <Link href="/faq" className="transition-colors hover:text-gold">
                Preguntas frecuentes
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="transition-colors hover:text-gold">
                Contacto
              </Link>
            </li>
          </ul>
          <div className="mt-5 flex flex-col gap-2 font-sans text-sm text-cream/70">
            <a
              href={STORE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 transition-colors hover:text-gold"
            >
              <MapPin size={16} className="mt-0.5 shrink-0" />
              {STORE.address}
            </a>
            <a
              href={`mailto:${STORE.email}`}
              className="flex items-center gap-2 transition-colors hover:text-gold"
            >
              <EnvelopeSimple size={16} className="shrink-0" />
              {STORE.email}
            </a>
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
            Sumate a la cosecha
          </p>
          <p className="mt-4 font-sans text-sm text-cream/70">
            Novedades, recetas y promos exclusivas, una vez por semana.
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10 px-6 py-6">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-2 font-sans text-xs text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Core Market. Todos los derechos reservados.</p>
          <p>Hecho con cariño en Buenos Aires.</p>
        </div>
      </div>
    </footer>
  );
}
