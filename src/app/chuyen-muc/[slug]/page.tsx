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
      <Link href="/" className="text-sm text-[#7a6f5b] hover:text-[#8a2b22]">← Trang chủ</Link>
      <header className="mt-4 mb-8">
        <h1 className="font-serif text-3xl font-bold">{c.name}</h1>
        {c.description && <p className="mt-2 text-[#4a4234]">{c.description}</p>}
      </header>
      {articles.length === 0 ? (
        <p className="rounded-lg border border-black/10 bg-[#fbf7ee] p-6 text-[#7a6f5b]">Chưa có bài viết trong chuyên mục này.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {articles.map((a) => (
            <Link key={a.id} href={`/bai-viet/${a.slug}`} className="flex flex-col rounded-xl border border-black/10 bg-[#fbf7ee] p-5 transition hover:border-[#8a2b22]/40">
              <h2 className="font-serif text-lg font-semibold leading-snug">{a.title}</h2>
              {a.excerpt && <p className="mt-2 line-clamp-3 text-sm text-[#4a4234]">{a.excerpt}</p>}
              <span className="mt-auto pt-3 text-xs text-[#7a6f5b]">{fmtDate(a.published_at)}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
