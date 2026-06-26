import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getArticlesByCategory, getCategories, fmtDate } from "@/lib/cms";

export const revalidate = 1800;
export const dynamicParams = true;

export async function generateStaticParams() {
  try { return (await getCategories()).map((c) => ({ slug: c.slug })); }
  catch { return []; }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCategoryBySlug(slug);
  if (!c) return { title: "Không tìm thấy chuyên mục" };
  return {
    title: c.name, description: c.description || undefined,
    alternates: { canonical: `/chuyen-muc/${c.slug}` },
  };
}

export default async function CategoryPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const c = await getCategoryBySlug(slug);
  if (!c) notFound();
  const articles = await getArticlesByCategory(c.id, 50);

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <nav className="flex items-center gap-1.5 text-sm text-ink-soft">
        <Link href="/" className="hover:text-primary-600">Trang chủ</Link>
        <span aria-hidden>/</span>
        <span className="text-ink">Chuyên mục</span>
      </nav>

      <header className="mt-5 border-b border-line pb-6">
        <h1 className="tick-heading font-serif text-3xl font-bold text-secondary-900 sm:text-4xl">{c.name}</h1>
        {c.description && <p className="mt-3 max-w-2xl text-ink-soft">{c.description}</p>}
        <p className="mt-3 font-mono text-xs text-ink-soft">{articles.length} bài viết</p>
      </header>

      {articles.length === 0 ? (
        <p className="mt-8 rounded-lg border border-line bg-sunken p-6 text-ink-soft">Chưa có bài viết trong chuyên mục này.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {articles.map((a) => (
            <Link key={a.id} href={`/bai-viet/${a.slug}`}
                  className="group flex flex-col rounded-xl border border-line bg-surface p-5 shadow-soft transition hover:shadow-card">
              <h2 className="font-serif text-lg font-semibold leading-snug text-secondary-900 transition group-hover:text-primary-600">{a.title}</h2>
              {a.excerpt && <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{a.excerpt}</p>}
              <span className="mt-auto pt-4 font-mono text-xs text-ink-soft">{fmtDate(a.published_at)}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
