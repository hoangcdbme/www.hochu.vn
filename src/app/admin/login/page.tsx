"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabaseClient";

export default function Login() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await sb.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) setErr(error.message);
    else r.push("/admin");
  }

  const I = "w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm";
  return (
    <main className="mx-auto max-w-sm px-5 py-24">
      <h1 className="font-serif text-2xl font-bold">Quản trị · Đăng nhập</h1>
      <p className="mt-1 text-sm text-[#7a6f5b]">Khu vực dành cho biên tập viên dòng họ Chử.</p>
      <form onSubmit={go} className="mt-6 space-y-3">
        <input className={I} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={I} type="password" placeholder="Mật khẩu" value={pw} onChange={(e) => setPw(e.target.value)} required />
        <button disabled={busy} className="w-full rounded-lg bg-[#8a2b22] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {busy ? "Đang đăng nhập…" : "Đăng nhập"}</button>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
    </main>
  );
}
