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
      "Sí, controlamos el stock semanalmente para asegurarnos de que todo lo que vendemos tenga la fecha de vencimiento vigente.",
  },
  {
    question: "¿Puedo cambiar o devolver un producto?",
    answer:
      "Si el producto llegó en mal estado, dañado o no es el que pediste, lo cambiamos sin problema — escribinos por WhatsApp apenas lo recibís. Al ser un almacén y dietética, no hacemos cambios por arrepentimiento una vez entregado el pedido.",
  },
  {
    question: "¿Ofrecen asesoramiento sobre qué suplemento elegir?",
    answer:
      "Sí, nuestro equipo puede orientarte según tu objetivo (fuerza, recuperación, alimentación saludable). Escribinos por WhatsApp o consultá en el local.",
  },
  {
    question: "¿Tienen opciones sin TACC o veganas?",
    answer:
      "Sí, tenemos varias opciones sin TACC, veganas, sin azúcar y otras variantes. Esos atributos vienen indicados por cada marca en su propio envase — nosotros no los certificamos, pero podés filtrarlos fácil en el catálogo según lo que declara cada producto.",
  },
] as const;
