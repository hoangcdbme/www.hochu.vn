"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb, slugify } from "@/lib/supabaseClient";

type Cat = { id: string; name: string };
export type ArticleInit = {
  id?: string; title?: string; slug?: string; excerpt?: string; body_md?: string;
  category_id?: string | null; status?: string; seo_title?: string | null; seo_description?: string | null;
};

export default function ArticleForm({ init }: { init?: ArticleInit }) {
  const r = useRouter();
  const [cats, setCats] = useState<Cat[]>([]);
  const [title, setTitle] = useState(init?.title ?? "");
  const [slug, setSlug] = useState(init?.slug ?? "");
  const [excerpt, setExcerpt] = useState(init?.excerpt ?? "");
  const [body, setBody] = useState(init?.body_md ?? "");
  const [categoryId, setCategoryId] = useState(init?.category_id ?? "");
  const [status, setStatus] = useState(init?.status ?? "draft");
  const [seoTitle, setSeoTitle] = useState(init?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(init?.seo_description ?? "");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);

  useEffect(() => {
    sb.from("category").select("id,name").order("sort").then(({ data }) => setCats((data as Cat[]) ?? []));
  }, []);

  async function save() {
    if (!title.trim()) { setMsg("Cần nhập tiêu đề."); return; }
    setBusy(true); setMsg("Đang lưu…");
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setMsg("Phiên hết hạn — đăng nhập lại."); setBusy(false); return; }
    const finalSlug = slug.trim() || slugify(title);
    const payload: Record<string, string | null> = {
      title: title.trim(), slug: finalSlug, excerpt: excerpt || null, body_md: body || "",
      category_id: categoryId || null, status,
      seo_title: seoTitle || null, seo_description: seoDesc || null,
      published_at: status === "published" ? new Date().toISOString() : null,
    };
    const res = init?.id
      ? await sb.from("article").update(payload).eq("id", init.id)
      : await sb.from("article").insert({ ...payload, author_id: user.id });
    if (res.error) { setMsg("Lỗi: " + res.error.message); setBusy(false); }
    else r.push("/admin");
  }

  const I = "w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm";
  const L = "block text-sm font-medium mb-1";
  return (
    <div className="space-y-4">
      <div><label className={L}>Tiêu đề</label>
        <input className={I} value={title} onChange={(e) => setTitle(e.target.value)}
          onBlur={() => { if (!slug) setSlug(slugify(title)); }} /></div>
      <div><label className={L}>Slug (đường dẫn URL)</label>
        <input className={I} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(title) || "tu-dong-sinh"} /></div>
      <div><label className={L}>Chuyên mục</label>
        <select className={I} value={categoryId ?? ""} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">— Chọn chuyên mục —</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select></div>
      <div><label className={L}>Tóm tắt</label>
        <textarea className={I} rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} /></div>
      <div><label className={L}>Nội dung (Markdown)</label>
        <textarea className={I + " font-mono leading-relaxed"} rows={16} value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="## Tiêu đề mục&#10;&#10;Nội dung… **in đậm**, [liên kết](https://…), - gạch đầu dòng" /></div>
      <details className="rounded-lg border border-black/10 p-3">
        <summary className="cursor-pointer text-sm font-medium">SEO (tuỳ chọn)</summary>
        <div className="mt-3 space-y-3">
          <div><label className={L}>SEO title</label><input className={I} value={seoTitle ?? ""} onChange={(e) => setSeoTitle(e.target.value)} /></div>
          <div><label className={L}>SEO description</label><input className={I} value={seoDesc ?? ""} onChange={(e) => setSeoDesc(e.target.value)} /></div>
        </div>
      </details>
      <div className="flex flex-wrap items-center gap-3 border-t border-black/10 pt-4">
        <select className={I + " w-auto"} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="draft">Nháp</option>
          <option value="pending_review">Chờ duyệt</option>
          <option value="published">Xuất bản</option>
        </select>
        <button onClick={save} disabled={busy}
          className="rounded-lg bg-[#8a2b22] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#6f231c] disabled:opacity-50">
          {busy ? "Đang lưu…" : "Lưu"}</button>
        {msg && <span className="text-sm text-[#7a6f5b]">{msg}</span>}
      </div>
    </div>
  );
}
