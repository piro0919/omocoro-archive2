import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#FFFFFF",
    display: "standalone",
    icons: [
      {
        purpose: "maskable",
        sizes: "192x192",
        src: "/android-chrome-192x192.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/icon-512x512.png",
        type: "image/png",
      },
    ],
    name: "オモコロアーカイブ",
    orientation: "portrait",
    short_name: "オモコロアーカイブ",
    start_url: "/",
    theme_color: "#FFFFFF",
  };
}
