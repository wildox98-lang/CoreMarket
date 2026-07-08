import Link from "next/link";
import { Mark } from "./mark";

export function Logo({
  className,
  markClassName = "text-olive-700",
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className ?? "text-olive-900"}`}
      aria-label="Core Market — inicio"
    >
      <Mark
        className={`h-7 w-7 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 ${markClassName}`}
      />
      <span className="font-display text-[1.35rem] leading-none tracking-tight">
        <span className="italic font-medium">Core</span>{" "}
        <span className="font-semibold">Market</span>
      </span>
    </Link>
  );
}
