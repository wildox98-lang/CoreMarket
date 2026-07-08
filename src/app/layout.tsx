import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { STORE } from "@/lib/constants";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://coremarket.com.ar"),
  title: {
    default: "Core Market — Nutrición real para tu rendimiento",
    template: "%s | Core Market",
  },
  description:
    "Suplementos deportivos, proteínas, superalimentos y productos naturales en Belgrano, Buenos Aires. Retiro en tienda o envío a todo CABA.",
  openGraph: {
    title: "Core Market",
    description:
      "Suplementos deportivos, proteínas, superalimentos y productos naturales en Buenos Aires.",
    locale: "es_AR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GroceryStore",
  name: STORE.name,
  url: "https://coremarket.com.ar",
  telephone: `+${STORE.whatsapp}`,
  email: STORE.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: STORE.address,
    addressLocality: STORE.neighborhood,
    addressRegion: "Buenos Aires",
    addressCountry: "AR",
  },
  sameAs: [STORE.instagram],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${workSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-sand text-charcoal">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
