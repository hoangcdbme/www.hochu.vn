import Link from "next/link";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";

export const dynamic = "force-dynamic";

async function getStatus() {
  const [sb, r2res] = await Promise.allSettled([
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
      cache: "no-store",
    }).then((r) => r.ok),
    r2.send(new ListObjectsV2Command({ Bucket: R2_BUCKET, MaxKeys: 1 })).then(() => true),
  ]);
  return {
    supabase: sb.status === "fulfilled" && sb.value === true,
    r2: r2res.status === "fulfilled",
  };
}

function Dot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`} />
  );
}

export default async function Home() {
  const s = await getStatus();
  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <header className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight">hochu.vn</h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400">
            Website thế hệ mới — Next.js · Supabase · Cloudflare R2, triển khai trên Vercel.
          </p>
        </header>

        <section className="mt-12 grid gap-3 sm:grid-cols-3">
          {[
            { t: "Frontend", d: "Next.js 16 + TypeScript + Tailwind" },
            { t: "Dữ liệu & Auth", d: "Supabase (PostgreSQL + RLS)" },
            { t: "Lưu trữ file", d: "Cloudflare R2 (S3 API)" },
          ].map((c) => (
            <div
              key={c.t}
              className="rounded-xl border border-black/10 p-4 dark:border-white/10"
            >
              <div className="text-sm font-semibold">{c.t}</div>
              <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{c.d}</div>
            </div>
          ))}
        </section>

        <section className="mt-8 flex items-center gap-6 rounded-xl bg-neutral-50 px-5 py-4 text-sm dark:bg-neutral-900">
          <span className="font-medium">Trạng thái hệ thống:</span>
          <span className="flex items-center gap-2"><Dot ok={s.supabase} /> Supabase</span>
          <span className="flex items-center gap-2"><Dot ok={s.r2} /> R2</span>
        </section>

        <section className="mt-10">
          <Link
            href="/upload"
            className="inline-flex items-center rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            → Thử upload ảnh lên R2
          </Link>
        </section>

        <footer className="mt-20 text-xs text-neutral-400">
          Vận hành bởi AI Team (Claude + Hermes) trên VPS rpa.hoangcd.com
        </footer>
      </div>
    </main>
  );
}
