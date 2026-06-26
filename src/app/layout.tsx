import type { Metadata } from "next";
import Link from "next/link";
import { Be_Vietnam_Pro, Noto_Serif } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/cms";

const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});
const serif = Noto_Serif({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Dòng họ Chử Việt Nam", template: "%s · Dòng họ Chử Việt Nam" },
  description:
    "Hệ sinh thái số Dòng họ Chử Việt Nam — kết nối · phát triển · thịnh vượng. Giới thiệu cội nguồn, tin tức, nhân vật tiêu biểu và phả hệ dòng tộc.",
  openGraph: {
    type: "website", locale: "vi_VN", siteName: "Dòng họ Chử Việt Nam",
    title: "Dòng họ Chử Việt Nam",
    description: "Kết nối con cháu họ Chử khắp mọi miền — cội nguồn, tin tức, nhân vật và phả hệ trực tuyến.",
  },
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
};

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/chuyen-muc/gioi-thieu", label: "Giới thiệu" },
  { href: "/chuyen-muc/tin-tuc", label: "Tin tức" },
  { href: "/chuyen-muc/nhan-vat", label: "Nhân vật" },
];

const FOOT_NAV = [
  { href: "/chuyen-muc/gioi-thieu", label: "Giới thiệu dòng họ" },
  { href: "/chuyen-muc/tin-tuc", label: "Tin tức & sự kiện" },
  { href: "/chuyen-muc/nhan-vat", label: "Nhân vật tiêu biểu" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${sans.variable} ${serif.variable}`}>
      <body className="antialiased">
        <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/seal.svg" alt="" width={40} height={40} className="h-10 w-10 rounded-full shadow-seal" />
              <span className="font-serif text-base font-semibold leading-tight text-secondary-700">
                Họ Chử<span className="text-primary-600"> Việt Nam</span>
                <span className="block text-[10px] font-normal uppercase tracking-[0.18em] text-ink-soft">Kết nối · Phát triển · Thịnh vượng</span>
              </span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="text-ink transition hover:text-primary-600">{n.label}</Link>
              ))}
              <a href="#lien-he" className="rounded-md bg-primary-500 px-4 py-2 text-paper transition hover:bg-primary-600">Liên hệ</a>
            </nav>
            <nav className="flex items-center gap-3 text-sm md:hidden">
              <Link href="/chuyen-muc/tin-tuc" className="text-ink hover:text-primary-600">Tin tức</Link>
              <a href="#lien-he" className="rounded-md bg-primary-500 px-3 py-1.5 text-paper">Liên hệ</a>
            </nav>
          </div>
        </header>

        {children}

        <footer id="lien-he" className="relative mt-20 overflow-hidden bg-secondary-900 text-paper">
          <img src="/seal.svg" alt="" aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 opacity-[0.06]" />
          <div className="relative mx-auto max-w-5xl px-5 py-12">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <img src="/seal.svg" alt="" width={36} height={36} className="h-9 w-9 rounded-full" />
                  <span className="font-serif text-lg font-semibold">Họ Chử Việt Nam</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-paper/70">
                  Hệ sinh thái số kết nối con cháu dòng họ Chử trên khắp mọi miền đất nước.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-accent-300">Khám phá</h3>
                <ul className="mt-3 space-y-2 text-sm text-paper/75">
                  {FOOT_NAV.map((n) => (
                    <li key={n.href}><Link href={n.href} className="transition hover:text-accent-300">{n.label}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-accent-300">Dòng tộc</h3>
                <ul className="mt-3 space-y-2 text-sm text-paper/75">
                  <li>Hội đồng gia tộc họ Chử</li>
                  <li>Ban liên lạc các vùng</li>
                  <li>Khuyến học &amp; vinh danh</li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-accent-300">Liên hệ</h3>
                <p className="mt-3 text-sm leading-relaxed text-paper/75">
                  Góp tư liệu, kết nối chi phái hoặc gửi bài viết về dòng họ — xin liên hệ Ban biên tập website.
                </p>
              </div>
            </div>
            <div className="mt-10 border-t border-paper/15 pt-6 text-xs text-paper/55">
              © {new Date().getFullYear()} Dòng họ Chử Việt Nam · hochu.vn — Kết nối · Phát triển · Thịnh vượng.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
