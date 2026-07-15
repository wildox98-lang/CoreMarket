import { Resend } from "resend";
import { formatPrice } from "./format";
import { STORE } from "./constants";

type NotifiableOrder = {
  id: string;
  fulfillment: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string | null;
  city: string | null;
  total: number;
  items: { name: string; quantity: number; subtotal: number }[];
};

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendOwnerOrderNotification(order: NotifiableOrder) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "Core Market <onboarding@resend.dev>";
  const orderRef = order.id.slice(-8);

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr><td style="padding:4px 8px">${item.name} × ${item.quantity}</td><td style="padding:4px 8px;text-align:right">${formatPrice(item.subtotal)}</td></tr>`,
    )
    .join("");

  const deliveryLine =
    order.fulfillment === "delivery"
      ? `Envío a: ${order.address ?? "-"}${order.city ? `, ${order.city}` : ""}`
      : "Retira en el local";

  await resend.emails.send({
    from,
    to: STORE.notificationEmail,
    subject: `Nuevo pedido pagado #${orderRef} — ${formatPrice(order.total)}`,
    html: `
      <h2>Nuevo pedido pagado</h2>
      <p><strong>Pedido #${orderRef}</strong></p>
      <p>${order.customerName} — ${order.customerEmail} — ${order.customerPhone}</p>
      <p>${deliveryLine}</p>
      <table style="border-collapse:collapse;width:100%;max-width:480px">${itemsHtml}</table>
      <p style="margin-top:12px"><strong>Total: ${formatPrice(order.total)}</strong></p>
      <p>Ya se registró en TiendaNube. Coordiná la entrega por WhatsApp cuando el cliente te escriba.</p>
    `,
  });
}
