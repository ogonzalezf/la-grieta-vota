import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com", // Para las fotos de perfil de Google Auth
      },
      {
        protocol: "http",
        hostname: "static.lolesports.com", // Reemplaza esto por el dominio real donde guardes los logos
      },
      {
        protocol: "https",
        hostname: "example.com", // Reemplaza esto por el dominio real donde guardes los logos
      },
      {
        protocol: "https",
        hostname: "cdn.datalisk.io", // Reemplaza esto por el dominio real donde guardes los logos
      },

      // Puedes añadir más dominios aquí según necesites
    ],
  },
};

export default nextConfig;
