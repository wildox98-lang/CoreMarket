import Image from "next/image";
import Link from "next/link";

export function Logo({
  className,
  imgClassName = "h-9 w-9",
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className ?? "text-olive-900"}`}
      aria-label="Core Market — inicio"
    >
      <Image
        src="/logo.png"
        alt=""
        width={96}
        height={96}
        className={`shrink-0 rounded-full transition-transform duration-300 group-hover:-translate-y-0.5 ${imgClassName}`}
      />
      <span className="font-display text-[1.35rem] leading-none tracking-tight">
        <span className="italic font-medium">Core</span>{" "}
        <span className="font-semibold">Market</span>
      </span>
    </Link>
  );
}
