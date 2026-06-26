"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabaseClient";
import ArticleForm from "@/components/ArticleForm";

export default function NewArticle() {
  const r = useRouter();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) r.replace("/admin/login"); else setOk(true);
    });
  }, [r]);
  if (!ok) return <main className="p-12 text-center text-[#7a6f5b]">…</main>;
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/admin" className="text-sm text-[#7a6f5b] hover:text-[#8a2b22]">← Danh sách</Link>
      <h1 className="mb-6 mt-3 font-serif text-2xl font-bold">Bài viết mới</h1>
      <ArticleForm />
    </main>
  );
}
