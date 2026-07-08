const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number) {
  return currencyFormatter.format(value);
}

export function formatTag(tag: string) {
  return tag
    .split("-")
    .map((word) => (word === "tacc" ? "TACC" : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}
