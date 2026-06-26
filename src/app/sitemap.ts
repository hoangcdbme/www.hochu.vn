// ===== app/sitemap.ts =====
import type { MetadataRoute } from "next";
import { getPublishedSlugs, getCategories, SITE_URL } from "@/lib/cms";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const out: MetadataRoute.Sitemap = [{ url: SITE_URL, lastModified: now, priority: 1 }];
  try {
    const [arts, cats] = await Promise.all([getPublishedSlugs(), getCategories()]);
    for (const c of cats) out.push({ url: `${SITE_URL}/chuyen-muc/${c.slug}`, lastModified: now, priority: 0.7 });
    for (const a of arts) out.push({
      url: `${SITE_URL}/bai-viet/${a.slug}`,
      lastModified: a.published_at ? new Date(a.published_at) : now, priority: 0.8,
    });
  } catch { /* DB chưa sẵn sàng → chỉ trả trang chủ */ }
  return out;
}
