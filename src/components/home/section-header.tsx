import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Ver todo",
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal
      className={`flex flex-col gap-3 ${
        align === "center" ? "items-center text-center" : "items-start"
      }`}
    >
      <span className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
        {eyebrow}
      </span>
      <div className="flex w-full flex-wrap items-end justify-between gap-4">
        <h2 className="max-w-xl font-display text-3xl font-medium text-olive-900 sm:text-4xl">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="group hidden shrink-0 items-center gap-1.5 font-sans text-sm font-semibold text-olive-700 transition-colors hover:text-gold-dark sm:inline-flex"
          >
            {linkLabel}
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        )}
      </div>
      {description && (
        <p className="max-w-2xl font-sans text-base leading-relaxed text-olive-700/80">
          {description}
        </p>
      )}
    </Reveal>
  );
}
