"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "done">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // No backend email provider configured yet — this simply confirms intent.
    setStatus("done");
    setEmail("");
  }

  if (status === "done") {
    return (
      <p className="font-sans text-sm text-gold-light">
        ¡Listo! Ya sos parte de la cosecha. Revisá tu correo pronto.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm gap-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Correo electrónico
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        className="w-full rounded-full border border-cream/25 bg-transparent px-4 py-2.5 text-sm text-cream placeholder:text-cream/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/50"
      />
      <button
        type="submit"
        className="shrink-0 cursor-pointer rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-olive-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
      >
        Sumarme
      </button>
    </form>
  );
}
