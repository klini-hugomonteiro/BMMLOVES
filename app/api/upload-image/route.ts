export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/app/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const key = form.get("key") as string | null;
    if (!file || !key) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(key, buffer, file.type || "image/jpeg");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("upload-image error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
