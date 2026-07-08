/**
 * A torn-kraft-paper edge used between sections instead of a hairline rule —
 * echoes the butcher paper / produce crates this brand is built around.
 */
export function DeckleDivider({
  flip = false,
  className,
}: {
  flip?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`divider-deckle text-sand ${flip ? "rotate-180" : ""} ${className ?? ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1200 24" preserveAspectRatio="none">
        <path
          d="M0 24 L0 10 Q15 2 30 9 T60 8 T90 11 T120 6 T150 10 T180 7 T210 12 T240 9 T270 6 T300 11 T330 8 T360 10 T390 7 T420 12 T450 9 T480 6 T510 11 T540 8 T570 10 T600 7 T630 12 T660 9 T690 6 T720 11 T750 8 T780 10 T810 7 T840 12 T870 9 T900 6 T930 11 T960 8 T990 10 T1020 7 T1050 12 T1080 9 T1110 6 T1140 11 T1170 8 T1200 10 L1200 24 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
