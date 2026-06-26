import { NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/r2-health — kiểm tra kết nối R2 (liệt kê tối đa 5 object).
export async function GET() {
  try {
    const out = await r2.send(
      new ListObjectsV2Command({ Bucket: R2_BUCKET, MaxKeys: 5 })
    );
    return NextResponse.json({
      ok: true,
      bucket: R2_BUCKET,
      count: out.KeyCount ?? 0,
      keys: (out.Contents ?? []).map((o) => o.Key),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
