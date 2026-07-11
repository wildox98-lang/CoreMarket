import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.mitiendanube.com" },
      { protocol: "https", hostname: "cdn.newgarden.com.ar" },
      { protocol: "https", hostname: "elbanquito.com.ar" },
      { protocol: "https", hostname: "d22fxaf9t8d39k.cloudfront.net" },
      { protocol: "https", hostname: "distribuidoraliliana.com.ar" },
      { protocol: "https", hostname: "**.vtexassets.com" },
      { protocol: "https", hostname: "pedidos.delicel.com.ar" },
      { protocol: "https", hostname: "naturalseed.com.ar" },
      { protocol: "https", hostname: "granerorosario.com" },
      { protocol: "https", hostname: "pampavida.com" },
      { protocol: "https", hostname: "glutenfreemarket.com.ar" },
      { protocol: "https", hostname: "www.aptomarket.com.ar" },
      { protocol: "https", hostname: "happyfood.com.ar" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
};

export default nextConfig;
