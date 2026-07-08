// Placeholder store details — replace with the real values before launch.
export const STORE = {
  name: "Core Market",
  legalCity: "Buenos Aires, Argentina",
  address: "Av. Cabildo 2140, Belgrano, CABA",
  neighborhood: "Belgrano",
  mapsUrl: "https://maps.google.com/?q=Av.+Cabildo+2140,+Buenos+Aires",
  whatsapp: "5491100000000", // digits only, country + area code, no symbols
  whatsappDisplay: "+54 9 11 0000-0000",
  instagram: "https://instagram.com/coremarket.ar",
  instagramHandle: "@coremarket.ar",
  email: "hola@coremarket.com.ar",
  hours: [
    { days: "Lunes a viernes", hours: "9:00 – 20:00" },
    { days: "Sábados", hours: "9:00 – 14:00" },
  ],
  freeShippingThreshold: 60000,
  deliveryFee: 4500,
  deliveryZoneNote: "Envíos a todo CABA y zona norte del GBA en 24–48hs.",
} as const;

export function buildWhatsappUrl(message: string) {
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${STORE.whatsapp}?${params.toString()}`;
}
