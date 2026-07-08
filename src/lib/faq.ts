import { STORE } from "./constants";

export const FAQ_ITEMS = [
  {
    question: "¿Hacen envíos a domicilio?",
    answer: `Sí. ${STORE.deliveryZoneNote} Los pedidos confirmados antes de las 15hs salen el mismo día.`,
  },
  {
    question: "¿Puedo retirar mi pedido en el local?",
    answer: `Por supuesto. Podés elegir "Retiro en tienda" en el checkout y pasar a buscarlo por ${STORE.address} sin costo de envío.`,
  },
  {
    question: "¿Qué medios de pago aceptan?",
    answer:
      "Tarjetas de crédito y débito, y todos los medios disponibles a través de Mercado Pago, incluyendo dinero en cuenta y transferencia.",
  },
  {
    question: "¿Los productos tienen fecha de vencimiento vigente?",
    answer:
      "Sí, controlamos el stock semanalmente y solo vendemos productos con al menos 6 meses de vigencia al momento de la entrega.",
  },
  {
    question: "¿Puedo cambiar o devolver un producto?",
    answer:
      "Si el producto está sin abrir y con su envase original, podés cambiarlo dentro de los 10 días de la compra. Escribinos por WhatsApp para coordinarlo.",
  },
  {
    question: "¿Ofrecen asesoramiento sobre qué suplemento elegir?",
    answer:
      "Sí, nuestro equipo puede orientarte según tu objetivo (fuerza, recuperación, alimentación saludable). Escribinos por WhatsApp o consultá en el local.",
  },
  {
    question: "¿Tienen opciones sin TACC o veganas?",
    answer:
      "Sí, marcamos cada producto con sus atributos (sin TACC, vegano, sin azúcar, etc.) para que puedas filtrar fácilmente en el catálogo.",
  },
] as const;
