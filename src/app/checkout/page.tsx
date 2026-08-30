"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore, useCartSubtotal } from "@/lib/store/cart";
import { formatPrice } from "@/lib/format";
import { STORE } from "@/lib/constants";

export default function CheckoutPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const subtotal = useCartSubtotal();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "tiendanube" | "local">(
    "mercadopago",
  );

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(
    null,
  );

  const total = Math.max(0, subtotal - (appliedCoupon?.discountAmount ?? 0));

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponError(null);
    setCouponLoading(true);

    const email = formRef.current ? new FormData(formRef.current).get("customerEmail") : null;

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          customerEmail: typeof email === "string" && email ? email : undefined,
        }),
      });
      const data = await res.json();

      if (!data.valid) {
        setAppliedCoupon(null);
        setCouponError(data.message ?? "No pudimos aplicar el cupón.");
        return;
      }
      setAppliedCoupon({ code: data.code, discountAmount: data.discountAmount });
    } catch {
      setCouponError("No pudimos validar el cupón. Intentá de nuevo.");
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.get("customerName"),
          customerEmail: formData.get("customerEmail"),
          customerPhone: formData.get("customerPhone"),
          notes: formData.get("notes") || undefined,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No pudimos procesar tu pedido. Intentá de nuevo.");
        setSubmitting(false);
        return;
      }

      clearCart();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(`/pedido/${data.orderId}`);
      }
    } catch {
      setError("No pudimos conectar con el servidor. Intentá de nuevo.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="font-display text-2xl italic text-olive-500">
          Tu carrito está vacío.
        </h1>
        <Link
          href="/productos"
          className="cursor-pointer rounded-full bg-olive-900 px-6 py-3 font-sans text-sm font-semibold text-cream transition-colors hover:bg-olive-700"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-10 font-display text-4xl font-medium text-olive-900">Checkout</h1>

      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="rounded-card border border-olive-700/20 bg-olive-700/5 px-5 py-4">
            <span className="font-sans text-sm font-semibold text-olive-900">Retiro en tienda</span>
            <p className="mt-1 font-sans text-xs text-olive-500">
              Sin costo, en {STORE.address}. Te avisamos por WhatsApp cuando esté listo.
            </p>
          </div>

          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 font-sans text-sm font-semibold text-olive-900">
              Tus datos
            </legend>
            <Field label="Nombre y apellido" name="customerName" required />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" name="customerEmail" type="email" required />
              <Field label="Teléfono" name="customerPhone" type="tel" required />
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-sm text-olive-700">Notas (opcional)</span>
              <textarea
                name="notes"
                rows={2}
                className="rounded-xl border border-border bg-cream px-4 py-2.5 font-sans text-sm text-olive-900 focus:border-olive-700 focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </label>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 font-sans text-sm font-semibold text-olive-900">
              Cómo querés pagar
            </legend>
            <PaymentOption
              value="mercadopago"
              selected={paymentMethod === "mercadopago"}
              onSelect={setPaymentMethod}
              title="Mercado Pago"
              description="Saldo en cuenta, tarjeta de crédito o débito."
            />
            <PaymentOption
              value="tiendanube"
              selected={paymentMethod === "tiendanube"}
              onSelect={setPaymentMethod}
              title="Tarjeta, MODO o transferencia"
              description="Te lleva a una página segura para elegir el medio de pago."
            />
            <PaymentOption
              value="local"
              selected={paymentMethod === "local"}
              onSelect={setPaymentMethod}
              title="Arreglo en el local"
              description="Te redirigimos a WhatsApp para coordinar cómo pagás cuando retirás tu pedido."
            />
          </fieldset>

          {error && (
            <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer rounded-full bg-gold px-6 py-4 font-sans text-sm font-semibold text-olive-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Procesando..." : "Confirmar pedido"}
          </button>
        </form>

        <div className="h-fit rounded-card border border-border bg-cream p-6">
          <h2 className="mb-5 font-display text-lg font-medium text-olive-900">
            Tu pedido
          </h2>
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sand-dark">
                  <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-sm text-olive-900">{item.name}</p>
                  <p className="font-sans text-xs text-olive-500">Cantidad: {item.quantity}</p>
                </div>
                <span className="font-sans text-sm tabular-nums text-olive-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-border pt-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-olive-700/30 bg-olive-700/5 px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-sans text-sm font-semibold text-olive-900">
                    Cupón {appliedCoupon.code}
                  </span>
                  <span className="font-sans text-xs text-olive-500">
                    Descuento de {formatPrice(appliedCoupon.discountAmount)} aplicado
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="cursor-pointer font-sans text-xs font-semibold text-olive-700 underline underline-offset-2 hover:text-olive-900"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Código de descuento"
                    className="flex-1 rounded-xl border border-border bg-cream px-4 py-2.5 font-sans text-sm uppercase text-olive-900 placeholder:normal-case placeholder:text-olive-500/60 focus:border-olive-700 focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="cursor-pointer rounded-xl bg-olive-900 px-4 py-2.5 font-sans text-sm font-semibold text-cream transition-colors hover:bg-olive-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Aplicar"}
                  </button>
                </div>
                {couponError && (
                  <p className="font-sans text-xs text-destructive">{couponError}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 font-sans text-sm">
            <div className="flex justify-between text-olive-700">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-olive-700">
                <span>Descuento</span>
                <span className="tabular-nums">-{formatPrice(appliedCoupon.discountAmount)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between border-t border-border pt-3 font-semibold text-olive-900">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({
  value,
  selected,
  onSelect,
  title,
  description,
}: {
  value: "mercadopago" | "tiendanube" | "local";
  selected: boolean;
  onSelect: (value: "mercadopago" | "tiendanube" | "local") => void;
  title: string;
  description: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
        selected ? "border-olive-700 bg-olive-700/5" : "border-border bg-cream"
      }`}
    >
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        checked={selected}
        onChange={() => onSelect(value)}
        className="mt-1 accent-olive-700"
      />
      <span className="flex flex-col gap-0.5">
        <span className="font-sans text-sm font-medium text-olive-900">{title}</span>
        <span className="font-sans text-xs text-olive-500">{description}</span>
      </span>
    </label>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="font-sans text-sm text-olive-700">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="rounded-xl border border-border bg-cream px-4 py-2.5 font-sans text-sm text-olive-900 focus:border-olive-700 focus:outline-none focus:ring-2 focus:ring-gold/40"
      />
    </label>
  );
}
