"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabaseClient";

type Row = { id: string; title: string; status: string; slug: string };
const LABEL: Record<string, string> = { draft: "Nháp", pending_review: "Chờ duyệt", published: "Đã xuất bản", archived: "Lưu trữ" };

export default function Admin() {
  const r = useRouter();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) { r.replace("/admin/login"); return; }
      setEmail(session.user.email ?? "");
      const { data } = await sb.from("article").select("id,title,status,slug").order("updated_at", { ascending: false });
      setRows((data as Row[]) ?? []);
    })();
  }, [r]);

  async function logout() { await sb.auth.signOut(); r.replace("/admin/login"); }

  if (rows === null) return <main className="p-12 text-center text-[#7a6f5b]">Đang tải…</main>;
  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-bold">Quản trị bài viết</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/" className="text-[#7a6f5b] hover:text-[#8a2b22]">Xem web ↗</Link>
          <span className="text-[#7a6f5b]">{email}</span>
          <button onClick={logout} className="text-[#8a2b22]">Đăng xuất</button>
        </div>
      </div>
      <Link href="/admin/new" className="mt-5 inline-block rounded-lg bg-[#8a2b22] px-4 py-2 text-sm font-medium text-white">+ Bài viết mới</Link>
      <div className="mt-6 divide-y divide-black/10 rounded-xl border border-black/10 bg-white">
        {rows.length === 0 && <p className="p-4 text-sm text-[#7a6f5b]">Chưa có bài viết nào.</p>}
        {rows.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="truncate font-medium">{a.title}</div>
              <div className="mt-0.5 text-xs text-[#7a6f5b]">{LABEL[a.status] ?? a.status} · /{a.slug}</div>
            </div>
            <Link href={`/admin/edit/${a.id}`} className="shrink-0 rounded-md border border-black/15 px-3 py-1 text-sm text-[#8a2b22]">Sửa</Link>
          </div>
        ))}
      </div>
    </main>
  );
}
