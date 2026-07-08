import { Reveal } from "@/components/ui/reveal";
import { DeckleDivider } from "@/components/brand/deckle-divider";
import { NewsletterForm } from "@/components/layout/newsletter-form";

export function NewsletterBanner() {
  return (
    <section className="relative bg-olive-700">
      <DeckleDivider className="absolute -top-6 left-0 right-0 text-olive-700" />
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-20 text-center">
        <Reveal>
          <h2 className="font-display text-3xl font-medium italic text-cream sm:text-4xl">
            La cosecha de la semana, directo a tu correo
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="max-w-md font-sans text-sm text-cream/75">
            Recetas, novedades de productos y promociones exclusivas para
            suscriptores. Sin spam, cancelás cuando quieras.
          </p>
        </Reveal>
        <Reveal delay={140}>
          <NewsletterForm />
        </Reveal>
      </div>
    </section>
  );
}
