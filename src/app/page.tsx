import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";

export const dynamic = "force-dynamic";

async function checkR2() {
  try {
    const o = await r2.send(new ListObjectsV2Command({ Bucket: R2_BUCKET, MaxKeys: 1 }));
    return { ok: true, detail: `${R2_BUCKET} · ${o.KeyCount ?? 0} object` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message.slice(0, 80) : "error" };
  }
}

async function checkSupabase() {
  try {
    const r = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
      cache: "no-store",
    });
    return { ok: r.ok, detail: `HTTP ${r.status}` };
  } catch {
    return { ok: false, detail: "unreachable" };
  }
}

function Row({ name, ok, detail }: { name: string; ok: boolean; detail: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-black/10 dark:border-white/15 px-4 py-3">
      <span className="font-medium">{name}</span>
      <span className="flex items-center gap-2 text-sm">
        <span className={ok ? "text-emerald-600" : "text-red-500"}>{ok ? "● online" : "● lỗi"}</span>
        <span className="text-black/50 dark:text-white/50">{detail}</span>
      </span>
    </div>
  );
}

export default async function Home() {
  const [sb, r2s] = await Promise.all([checkSupabase(), checkR2()]);
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">hochu.vn</h1>
          <p className="text-black/50 dark:text-white/50 text-sm">
            Next.js · Supabase · Cloudflare R2 — deploy trên Vercel
          </p>
        </div>
        <div className="space-y-2">
          <Row name="Supabase" ok={sb.ok} detail={sb.detail} />
          <Row name="Cloudflare R2" ok={r2s.ok} detail={r2s.detail} />
        </div>
        <p className="text-center text-xs text-black/40 dark:text-white/40">
          Hệ thống vận hành bởi AI Team (Claude + Hermes) trên VPS rpa.hoangcd.com
        </p>
      </div>
    </main>
  );
}
