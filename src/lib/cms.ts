import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hochu.vn";

// Client đọc công khai (anon key) — RLS đảm bảo chỉ thấy bài 'published'.
export function db(): SupabaseClient {
  return createClient(url, anon, { auth: { persistSession: false } });
}

export type Category = { id: string; slug: string; name: string; description: string | null };
export type ArticleCard = {
  id: string; slug: string; title: string; excerpt: string | null;
  cover_url: string | null; published_at: string | null; category_id: string | null;
};
export type Article = ArticleCard & {
  body_md: string; seo_title: string | null; seo_description: string | null;
};

const CARD = "id,slug,title,excerpt,cover_url,published_at,category_id";

export async function getLatestArticles(limit = 12): Promise<ArticleCard[]> {
  const { data } = await db().from("article").select(CARD)
    .eq("status", "published").order("published_at", { ascending: false }).limit(limit);
  return data ?? [];
}
export async function getArticle(slug: string): Promise<Article | null> {
  const { data } = await db().from("article").select("*")
    .eq("slug", slug).eq("status", "published").maybeSingle();
  return (data as Article) ?? null;
}
export async function getCategories(): Promise<Category[]> {
  const { data } = await db().from("category").select("id,slug,name,description").order("sort");
  return (data as Category[]) ?? [];
}
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data } = await db().from("category").select("id,slug,name,description")
    .eq("slug", slug).maybeSingle();
  return (data as Category) ?? null;
}
export async function getArticlesByCategory(categoryId: string, limit = 30): Promise<ArticleCard[]> {
  const { data } = await db().from("article").select(CARD)
    .eq("status", "published").eq("category_id", categoryId)
    .order("published_at", { ascending: false }).limit(limit);
  return data ?? [];
}
export async function getPublishedSlugs(): Promise<{ slug: string; published_at: string | null }[]> {
  const { data } = await db().from("article").select("slug,published_at").eq("status", "published");
  return data ?? [];
}
export function fmtDate(d: string | null): string {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }); }
  catch { return ""; }
}
