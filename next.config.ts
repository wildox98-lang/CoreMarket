import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.mitiendanube.com" },
      { protocol: "https", hostname: "cdn.newgarden.com.ar" },
    ],
  },
};

export default nextConfig;
