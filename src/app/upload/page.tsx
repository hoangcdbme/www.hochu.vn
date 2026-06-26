"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Item = { key: string; size: number; url: string };

export default function UploadPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/upload", { cache: "no-store" });
      const d = await r.json();
      if (d.ok) setItems(d.items as Item[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("file") as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      setMsg("Chọn 1 file đã.");
      return;
    }
    setBusy(true);
    setMsg("Đang upload...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await r.json();
      setMsg(d.ok ? `✓ Đã upload: ${d.key}` : `✗ Lỗi: ${d.error}`);
      if (d.ok) {
        input.value = "";
        await load();
      }
    } catch (err) {
      setMsg("✗ Lỗi mạng: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  }

  const isImg = (k: string) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(k);

  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-neutral-500 hover:underline">
          ← hochu.vn
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Upload lên Cloudflare R2</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          File lưu vào bucket <code>hochu-media</code>. Tối đa 10MB.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-wrap items-center gap-3">
          <input
            type="file"
            name="file"
            className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-white dark:file:bg-white dark:file:text-neutral-900"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy ? "Đang..." : "Upload"}
          </button>
          {msg && <span className="text-sm text-neutral-500">{msg}</span>}
        </form>

        <h2 className="mt-12 text-sm font-semibold text-neutral-500">
          Đã upload ({items.length})
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it) => (
            <a
              key={it.key}
              href={it.url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-lg border border-black/10 dark:border-white/10"
            >
              {isImg(it.key) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.url} alt={it.key} className="h-32 w-full object-cover" />
              ) : (
                <div className="flex h-32 items-center justify-center bg-neutral-100 text-xs text-neutral-500 dark:bg-neutral-900">
                  {it.key.split("/").pop()}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
