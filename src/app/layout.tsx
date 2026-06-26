import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE_URL } from "@/lib/cms";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Dòng họ Chử Việt Nam", template: "%s · Dòng họ Chử Việt Nam" },
  description:
    "Hệ sinh thái số Dòng họ Chử Việt Nam — giới thiệu dòng họ, tin tức, chuyên mục và phả hệ trực tuyến.",
  openGraph: {
    type: "website", locale: "vi_VN", siteName: "Dòng họ Chử Việt Nam",
    title: "Dòng họ Chử Việt Nam",
    description: "Giới thiệu dòng họ, tin tức, chuyên mục và phả hệ trực tuyến của dòng họ Chử.",
  },
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
};

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/chuyen-muc/gioi-thieu", label: "Giới thiệu" },
  { href: "/chuyen-muc/tin-tuc", label: "Tin tức" },
  { href: "/chuyen-muc/nhan-vat", label: "Nhân vật" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="antialiased bg-[#f7f3ea] text-[#211d16]">
        <header className="border-b border-black/10 bg-[#fbf7ee]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-[#8a2b22] font-serif text-xl font-bold text-[#f7f3ea]">譜</span>
              <span className="font-serif text-lg font-semibold leading-tight">Dòng họ Chử<br /><span className="text-xs font-normal tracking-wide text-[#7a6f5b]">Việt Nam</span></span>
            </Link>
            <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="text-[#4a4234] hover:text-[#8a2b22]">{n.label}</Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-16 border-t border-black/10 bg-[#fbf7ee]">
          <div className="mx-auto max-w-5xl px-5 py-8 text-sm text-[#7a6f5b]">
            <p className="font-serif text-base text-[#211d16]">Dòng họ Chử Việt Nam</p>
            <p className="mt-1">Hệ sinh thái số dòng tộc — giới thiệu, tin tức, chuyên mục &amp; phả hệ.</p>
            <p className="mt-3 text-xs">© {new Date().getFullYear()} Hội đồng gia tộc họ Chử Việt Nam.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
