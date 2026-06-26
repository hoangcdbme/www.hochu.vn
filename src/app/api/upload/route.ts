import { NextRequest, NextResponse } from "next/server";
import {
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

// POST /api/upload — nhận file (multipart) → đẩy lên R2.
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Thiếu file" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "File > 10MB" }, { status: 400 });
    }
    const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const key = `uploads/${Date.now()}-${safe}`;
    const body = Buffer.from(await file.arrayBuffer());
    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: file.type || "application/octet-stream",
      })
    );
    return NextResponse.json({ ok: true, key });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// GET /api/upload — liệt kê file đã upload (kèm presigned URL để xem).
export async function GET() {
  try {
    const out = await r2.send(
      new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: "uploads/", MaxKeys: 50 })
    );
    const items = await Promise.all(
      (out.Contents ?? [])
        .sort((a, b) => (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0))
        .map(async (o) => ({
          key: o.Key as string,
          size: o.Size ?? 0,
          url: await getSignedUrl(
            r2,
            new GetObjectCommand({ Bucket: R2_BUCKET, Key: o.Key }),
            { expiresIn: 3600 }
          ),
        }))
    );
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
