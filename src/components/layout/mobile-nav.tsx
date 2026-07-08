"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/brand/logo";
import { NAV_LINKS } from "./nav-links";
import { STORE, buildWhatsappUrl } from "@/lib/constants";

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        className={`absolute inset-0 bg-olive-900/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-cream shadow-lift transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-2 text-olive-900"
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-5 py-6 font-sans text-lg text-olive-900">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="border-b border-border/60 py-3"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/faq" onClick={onClose} className="border-b border-border/60 py-3">
            Preguntas Frecuentes
          </Link>
          <Link href="/contacto" onClick={onClose} className="py-3">
            Contacto
          </Link>
        </nav>
        <div className="mt-auto px-5 py-6">
          <a
            href={buildWhatsappUrl("Hola! Quiero hacer una consulta.")}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-full bg-gold px-5 py-3 text-center font-sans text-sm font-semibold text-olive-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          >
            Escribinos por WhatsApp
          </a>
          <p className="mt-3 text-center text-xs text-olive-500">
            {STORE.address}
          </p>
        </div>
      </div>
    </div>
  );
}
