export const STORE = {
  name: "Core Market",
  legalCity: "Buenos Aires, Argentina",
  address: "Estado de Palestina 696, C1182 Buenos Aires, CABA, Argentina",
  neighborhood: "CABA",
  mapsUrl:
    "https://maps.google.com/?q=Estado+de+Palestina+696,+C1182+Buenos+Aires,+CABA,+Argentina",
  whatsapp: "5491130096750", // digits only, country + area code, no symbols
  whatsappDisplay: "+54 9 11 3009-6750",
  instagram: "https://www.instagram.com/coremarket.ba/",
  instagramHandle: "@coremarket.ba",
  email: "hola@coremarket.com.ar",
  hours: [
    { days: "Lunes a viernes", hours: "9:00 – 20:00" },
    { days: "Sábados", hours: "9:00 – 17:00" },
    { days: "Domingos", hours: "Cerrado" },
  ],
  freeShippingThreshold: 60000,
  deliveryFee: 4500,
  deliveryZoneNote: "Envíos a todo CABA y zona norte del GBA en 24–48hs.",
} as const;

export function buildWhatsappUrl(message: string) {
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${STORE.whatsapp}?${params.toString()}`;
}
