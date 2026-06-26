"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { sb } from "@/lib/supabaseClient";
import ArticleForm, { type ArticleInit } from "@/components/ArticleForm";

export default function EditArticle() {
  const r = useRouter();
  const params = useParams();
  const id = String(params.id);
  const [init, setInit] = useState<ArticleInit | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) { r.replace("/admin/login"); return; }
      const { data } = await sb.from("article").select("*").eq("id", id).maybeSingle();
      if (data) setInit(data as ArticleInit); else r.replace("/admin");
    })();
  }, [id, r]);

  if (!init) return <main className="p-12 text-center text-[#7a6f5b]">Đang tải…</main>;
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/admin" className="text-sm text-[#7a6f5b] hover:text-[#8a2b22]">← Danh sách</Link>
      <h1 className="mb-6 mt-3 font-serif text-2xl font-bold">Sửa bài viết</h1>
      <ArticleForm init={init} />
    </main>
  );
}
