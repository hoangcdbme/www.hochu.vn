import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dòng họ Chử Việt Nam",
    short_name: "Họ Chử",
    description: "Hệ sinh thái số dòng họ Chử Việt Nam — giới thiệu, tin tức, chuyên mục & phả hệ.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ea",
    theme_color: "#8a2b22",
    lang: "vi",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
