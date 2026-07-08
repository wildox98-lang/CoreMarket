"use client";

import { useState } from "react";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { buildWhatsappUrl } from "@/lib/constants";

export function ContactForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = `Hola! Soy ${name}.\n\n${message}`;
    window.open(buildWhatsappUrl(text), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="font-sans text-sm text-olive-700">Tu nombre</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-border bg-cream px-4 py-2.5 font-sans text-sm text-olive-900 focus:border-olive-700 focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-sans text-sm text-olive-700">Tu consulta</span>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="rounded-xl border border-border bg-cream px-4 py-2.5 font-sans text-sm text-olive-900 focus:border-olive-700 focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
      </label>
      <button
        type="submit"
        className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-olive-900 px-6 py-3.5 font-sans text-sm font-semibold text-cream transition-colors hover:bg-olive-700"
      >
        <WhatsappLogo size={18} />
        Enviar por WhatsApp
      </button>
      <p className="font-sans text-xs text-olive-500">
        Al enviar, se abrirá WhatsApp con tu mensaje ya escrito.
      </p>
    </form>
  );
}
