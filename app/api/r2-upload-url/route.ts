export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/app/lib/r2";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { fileName, contentType } = await req.json();
    if (!fileName || !contentType) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const ext = path.extname(fileName) || ".mp4";
    const key = `videos/${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}${ext}`;
    const uploadUrl = await getPresignedUploadUrl(key, contentType);
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (err) {
    console.error("Presigned URL error:", err);
    return NextResponse.json({ error: "Erro ao gerar URL de upload." }, { status: 500 });
  }
}
