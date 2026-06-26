import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client dùng phía browser (publishable/anon key — an toàn public).
export const supabase = createClient(url, anon);

// Client admin CHỈ dùng phía server (service_role/secret key).
// KHÔNG bao giờ import file này vào client component.
export function supabaseAdmin() {
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, svc, { auth: { persistSession: false } });
}
