import Link from "next/link";
import { getLatestArticles, getCategories, fmtDate } from "@/lib/cms";

export const revalidate = 1800; // ISR: làm mới mỗi 30 phút

export default async function Home() {
  const [articles, categories] = await Promise.all([getLatestArticles(9), getCategories()]);
  const [featured, ...rest] = articles;

  return (
    <main>
      {/* ===== Hero nghi lễ ===== */}
      <section className="paper-grain relative overflow-hidden border-b border-line">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:py-20">
          <img src="/seal.svg" alt="Con dấu Dòng họ Chử Việt Nam" width={112} height={112}
               className="mx-auto h-28 w-28 rounded-full shadow-seal" />
          <h1 className="mt-7 font-serif text-4xl font-bold leading-tight text-secondary-900 sm:text-5xl">
            Hệ sinh thái số <span className="text-primary-600">Dòng họ Chử</span> Việt Nam
          </h1>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.22em] text-accent-700">
            Kết nối · Phát triển · Thịnh vượng
          </p>
          <p className="mx-auto mt-5 max-w-xl text-ink-soft">
            Nơi hội tụ con cháu họ Chử khắp mọi miền — lưu giữ cội nguồn, lan tỏa tin tức
            và tôn vinh những giá trị văn hóa của dòng tộc.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/chuyen-muc/tin-tuc"
                  className="rounded-md bg-primary-500 px-6 py-3 font-medium text-paper transition hover:bg-primary-600">
              Đọc bài viết
            </Link>
            <Link href="/chuyen-muc/gioi-thieu"
                  className="rounded-md border border-primary-500 px-6 py-3 font-medium text-primary-700 transition hover:bg-primary-50">
              Giới thiệu dòng họ
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Dải câu đối / gia huấn ===== */}
      <section className="bg-ink-gradient">
        <div className="mx-auto max-w-4xl px-5 py-10 text-center">
          <p className="font-serif text-xl italic leading-relaxed text-accent-100 sm:text-2xl">
            “Cây có cội, nước có nguồn — con cháu họ Chử một lòng hướng về tiên tổ.”
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5">
        {!featured && (
          <p className="my-12 rounded-lg border border-line bg-sunken p-6 text-center text-ink-soft">
            Nội dung đang được cập nhật. Vui lòng quay lại sau.
          </p>
        )}

        {/* ===== Bài nổi bật ===== */}
        {featured && (
          <section className="py-12">
            <h2 className="tick-heading font-serif text-2xl font-bold text-secondary-900">Bài nổi bật</h2>
            <Link href={`/bai-viet/${featured.slug}`}
                  className="group mt-5 block rounded-2xl border border-line bg-surface p-7 shadow-soft transition hover:shadow-card">
              <span className="text-xs font-medium uppercase tracking-wider text-accent-700">Tiêu điểm</span>
              <h3 className="mt-2 font-serif text-2xl font-semibold leading-snug text-secondary-900 transition group-hover:text-primary-600 sm:text-3xl">
                {featured.title}
              </h3>
              {featured.excerpt && <p className="mt-3 max-w-3xl text-ink-soft">{featured.excerpt}</p>}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-700">Đọc tiếp →</span>
            </Link>
          </section>
        )}

        {/* ===== Mới cập nhật ===== */}
        {rest.length > 0 && (
          <section className="pb-14">
            <h2 className="tick-heading font-serif text-2xl font-bold text-secondary-900">Mới cập nhật</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => (
                <Link key={a.id} href={`/bai-viet/${a.slug}`}
                      className="group flex flex-col rounded-xl border border-line bg-surface p-5 shadow-soft transition hover:shadow-card">
                  <h3 className="font-serif text-lg font-semibold leading-snug text-secondary-900 transition group-hover:text-primary-600">{a.title}</h3>
                  {a.excerpt && <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{a.excerpt}</p>}
                  <span className="mt-auto pt-4 font-mono text-xs text-ink-soft">{fmtDate(a.published_at)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== Chuyên mục ===== */}
        {categories.length > 0 && (
          <section className="pb-16">
            <h2 className="tick-heading font-serif text-2xl font-bold text-secondary-900">Chuyên mục</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {categories.map((c) => (
                <Link key={c.id} href={`/chuyen-muc/${c.slug}`}
                      className="group rounded-xl border border-line bg-sunken p-5 transition hover:border-primary-300 hover:bg-surface hover:shadow-card">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-seal-gradient font-serif text-xl font-bold text-secondary-900 shadow-soft">C</span>
                  <div className="mt-3 font-serif text-lg font-semibold text-secondary-900 transition group-hover:text-primary-600">{c.name}</div>
                  {c.description && <div className="mt-1 text-sm text-ink-soft">{c.description}</div>}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
