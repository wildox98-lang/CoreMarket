/**
 * The Core Market signature glyph: a single grain leaf rooted in a barbell —
 * nature and performance, drawn as one continuous monoline shape.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="7" cy="20" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="25" cy="20" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9.6 20H22.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 20V13.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 13.5C11 13.5 9.5 9 10.2 5C13.6 6.3 16 8.7 16 13.5Z"
        fill="currentColor"
      />
      <path
        d="M16 13.5C19.6 10.8 20.6 7.4 20.1 4C16.9 5.6 15.3 8.6 16 13.5Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}
