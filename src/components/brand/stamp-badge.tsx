import { Mark } from "./mark";

/**
 * The recurring "seal" motif — modeled on the ink stamps used on produce
 * crates and butcher paper at a real market. Used to mark freshness/quality
 * claims, review counts, and other trust signals throughout the site.
 */
export function StampBadge({
  eyebrow,
  label,
  className,
  rotate = -6,
}: {
  eyebrow: string;
  label: string;
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      className={`relative inline-flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-olive-700/50 text-olive-700 ${className ?? ""}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full border border-olive-700/70 text-center">
        <Mark className="h-4 w-4" />
        <span className="font-sans text-[0.55rem] font-semibold tracking-[0.2em] uppercase">
          {eyebrow}
        </span>
        <span className="font-display text-sm leading-tight italic">
          {label}
        </span>
      </div>
    </div>
  );
}
