import Image from "next/image";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { STORE } from "@/lib/constants";

const PHOTO_IDS = [102, 19, 116, 30, 89, 62];

export function InstagramSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <Reveal className="flex flex-col items-center gap-2 text-center">
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
          Seguinos
        </span>
        <a
          href={STORE.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 font-display text-3xl font-medium text-olive-900 transition-colors hover:text-gold-dark sm:text-4xl"
        >
          <InstagramLogo size={30} />
          {STORE.instagramHandle}
        </a>
      </Reveal>

      <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-6">
        {PHOTO_IDS.map((id, i) => (
          <Reveal key={id} delay={i * 60}>
            <a
              href={STORE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-xl"
            >
              <Image
                src={`https://picsum.photos/id/${id}/500/500`}
                alt="Publicación de Instagram de Core Market"
                fill
                sizes="(max-width: 640px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
