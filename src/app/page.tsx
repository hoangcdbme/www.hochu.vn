import Link from "next/link";
import { getLatestArticles, getCategories, fmtDate } from "@/lib/cms";

export const revalidate = 1800; // ISR: làm mới mỗi 30 phút

export default async function Home() {
  const [articles, categories] = await Promise.all([getLatestArticles(9), getCategories()]);
  const [featured, ...rest] = articles;

  return (
    <main className="mx-auto max-w-5xl px-5">
      {/* Hero */}
      <section className="py-12 text-center">
        <p className="font-serif text-sm uppercase tracking-[0.2em] text-[#9c742f]">Hệ sinh thái số dòng tộc</p>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">Dòng họ Chử Việt Nam</h1>
        <p className="mx-auto mt-4 max-w-2xl text-[#4a4234]">
          Nơi kết nối con cháu họ Chử khắp mọi miền — giới thiệu cội nguồn, lưu giữ tư liệu,
          lan tỏa tin tức và các giá trị văn hóa của dòng tộc.
        </p>
      </section>

      {!featured && (
        <p className="rounded-lg border border-black/10 bg-[#fbf7ee] p-6 text-center text-[#7a6f5b]">
          Chưa có bài viết. (Sau khi chạy schema + thêm bài, nội dung sẽ hiển thị tại đây.)
        </p>
      )}

      {/* Featured */}
      {featured && (
        <section className="mb-10">
          <Link href={`/bai-viet/${featured.slug}`} className="block rounded-2xl border border-black/10 bg-[#fbf7ee] p-7 transition hover:border-[#8a2b22]/40">
            <span className="text-xs uppercase tracking-wider text-[#9c742f]">Bài nổi bật</span>
            <h2 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">{featured.title}</h2>
            {featured.excerpt && <p className="mt-2 max-w-3xl text-[#4a4234]">{featured.excerpt}</p>}
            <span className="mt-3 inline-block text-sm text-[#8a2b22]">Đọc tiếp →</span>
          </Link>
        </section>
      )}

      {/* Latest grid */}
      {rest.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 font-serif text-xl font-semibold">Mới cập nhật</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <Link key={a.id} href={`/bai-viet/${a.slug}`} className="flex flex-col rounded-xl border border-black/10 bg-[#fbf7ee] p-5 transition hover:border-[#8a2b22]/40">
                <h3 className="font-serif text-lg font-semibold leading-snug">{a.title}</h3>
                {a.excerpt && <p className="mt-2 line-clamp-3 text-sm text-[#4a4234]">{a.excerpt}</p>}
                <span className="mt-auto pt-3 text-xs text-[#7a6f5b]">{fmtDate(a.published_at)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-4 font-serif text-xl font-semibold">Chuyên mục</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {categories.map((c) => (
              <Link key={c.id} href={`/chuyen-muc/${c.slug}`} className="rounded-xl border border-black/10 bg-[#fbf7ee] p-4 transition hover:border-[#8a2b22]/40">
                <div className="font-serif font-semibold">{c.name}</div>
                {c.description && <div className="mt-1 text-sm text-[#7a6f5b]">{c.description}</div>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
