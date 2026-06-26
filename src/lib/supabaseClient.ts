"use client";
import { createClient } from "@supabase/supabase-js";

// Client phía trình duyệt — giữ phiên đăng nhập (localStorage). RLS bảo vệ dữ liệu.
export const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }
);

// Bỏ dấu tiếng Việt -> slug ASCII. Xử lý đ/Đ trước, rồi NFD + strip non-ASCII.
export function slugify(s: string): string {
  return (s || "")
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
