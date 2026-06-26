import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getArticle, getPublishedSlugs, fmtDate, SITE_URL } from "@/lib/cms";

export const revalidate = 1800;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const rows = await getPublishedSlugs();
    return rows.slice(0, 50).map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return { title: "Không tìm thấy bài viết" };
  const title = a.seo_title || a.title;
  const description = a.seo_description || a.excerpt || undefined;
  const urlPath = `/bai-viet/${a.slug}`;
  return {
    title, description,
    alternates: { canonical: urlPath },
    openGraph: { type: "article", title, description, url: urlPath, publishedTime: a.published_at || undefined },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Article",
    headline: a.title, description: a.excerpt || undefined,
    datePublished: a.published_at || undefined,
    mainEntityOfPage: `${SITE_URL}/bai-viet/${a.slug}`,
    publisher: { "@type": "Organization", name: "Dòng họ Chử Việt Nam" },
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <nav className="flex items-center gap-1.5 text-sm text-ink-soft">
        <Link href="/" className="hover:text-primary-600">Trang chủ</Link>
        <span aria-hidden>/</span>
        <Link href="/chuyen-muc/tin-tuc" className="hover:text-primary-600">Bài viết</Link>
      </nav>

      <article className="mt-5">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-accent-700">Dòng họ Chử Việt Nam</span>
        <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-secondary-900 sm:text-4xl text-balance">{a.title}</h1>
        <div className="mt-4 flex items-center gap-3 border-b border-line pb-5 text-sm text-ink-soft">
          {a.published_at && <span className="font-mono">{fmtDate(a.published_at)}</span>}
          <span aria-hidden>·</span>
          <span>Ban biên tập</span>
        </div>
        {a.excerpt && <p className="mt-6 font-serif text-lg italic leading-relaxed text-secondary-700">{a.excerpt}</p>}
        <div className="article-prose mt-7">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{a.body_md}</ReactMarkdown>
        </div>
      </article>

      <div className="mt-12 rounded-xl border border-line bg-sunken p-6 text-center">
        <p className="font-serif text-lg font-semibold text-secondary-900">Cùng vun đắp di sản dòng họ Chử</p>
        <p className="mt-1.5 text-sm text-ink-soft">Đọc thêm tin tức, nhân vật và truyền thống của dòng tộc.</p>
        <Link href="/chuyen-muc/tin-tuc" className="mt-4 inline-block rounded-md bg-primary-500 px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-primary-600">
          Xem tất cả bài viết
        </Link>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
