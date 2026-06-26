import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hochu.vn",
  description: "hochu.vn — Next.js + Supabase + Cloudflare R2, vận hành bởi AI Team.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
