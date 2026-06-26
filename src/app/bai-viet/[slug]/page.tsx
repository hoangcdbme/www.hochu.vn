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
      <Link href="/" className="text-sm text-[#7a6f5b] hover:text-[#8a2b22]">← Trang chủ</Link>
      <article className="mt-4">
        <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">{a.title}</h1>
        {a.published_at && <p className="mt-2 text-sm text-[#7a6f5b]">{fmtDate(a.published_at)}</p>}
        {a.excerpt && <p className="mt-4 text-lg text-[#4a4234]">{a.excerpt}</p>}
        <div className="article-prose mt-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{a.body_md}</ReactMarkdown>
        </div>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
