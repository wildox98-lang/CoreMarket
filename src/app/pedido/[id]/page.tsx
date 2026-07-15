import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Clock, WhatsappLogo, XCircle } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { buildWhatsappUrl } from "@/lib/constants";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const isPaid = order.status === "paid";
  const isCancelled = order.status === "cancelled";
  const isPendingManual = order.status === "pending" && !order.mpPreferenceId;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        {isPaid ? (
          <CheckCircle size={48} weight="fill" className="text-olive-700" />
        ) : isCancelled ? (
          <XCircle size={48} weight="fill" className="text-destructive" />
        ) : (
          <Clock size={48} weight="fill" className="text-gold-dark" />
        )}

        <h1 className="font-display text-3xl font-medium text-olive-900">
          {isPaid
            ? "¡Pago confirmado!"
            : isCancelled
              ? "El pago no pudo procesarse"
              : "Pedido recibido"}
        </h1>

        <p className="max-w-md font-sans text-base text-olive-700/90">
          {isPaid &&
            "Gracias por tu compra. Te avisaremos apenas tu pedido esté listo para retirar o en camino."}
          {isCancelled &&
            "No pudimos confirmar el pago. Podés intentar de nuevo o escribirnos por WhatsApp para coordinarlo."}
          {isPendingManual &&
            "Registramos tu pedido. Escribinos por WhatsApp con tu número de pedido para coordinar el pago y la entrega."}
          {!isPaid && !isCancelled && !isPendingManual &&
            "Estamos confirmando tu pago. Te avisaremos por email apenas se acredite."}
        </p>

        <p className="font-sans text-xs uppercase tracking-wide text-olive-500">
          Pedido #{order.id.slice(-8)}
        </p>

        {(isPendingManual || isPaid) && (
          <a
            href={buildWhatsappUrl(
              isPaid
                ? `Hola! Ya pagué mi pedido #${order.id.slice(-8)}, quiero coordinar la ${order.fulfillment === "delivery" ? "entrega" : "el retiro"}.`
                : `Hola! Quiero coordinar el pago de mi pedido #${order.id.slice(-8)}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full bg-olive-900 px-6 py-3.5 font-sans text-sm font-semibold text-cream transition-colors hover:bg-olive-700"
          >
            <WhatsappLogo size={18} />
            Coordinar por WhatsApp
          </a>
        )}
      </div>

      <div className="mt-12 rounded-card border border-border bg-cream p-6">
        <h2 className="mb-5 font-display text-lg font-medium text-olive-900">
          Resumen del pedido
        </h2>
        <ul className="flex flex-col divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-sans text-sm text-olive-900">{item.name}</p>
                <p className="font-sans text-xs text-olive-500">Cantidad: {item.quantity}</p>
              </div>
              <span className="font-sans text-sm tabular-nums text-olive-900">
                {formatPrice(item.subtotal)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 font-sans text-sm">
          <div className="flex justify-between text-olive-700">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-olive-700">
            <span>Envío</span>
            <span className="tabular-nums">
              {order.shipping === 0 ? "Gratis" : formatPrice(order.shipping)}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-semibold text-olive-900">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/productos"
          className="font-sans text-sm font-semibold text-olive-700 hover:text-gold-dark"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
