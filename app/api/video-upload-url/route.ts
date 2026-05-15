export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/app/lib/r2";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const contentType = req.nextUrl.searchParams.get("contentType") || "video/mp4";
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
  try {
    const url = await getPresignedUploadUrl(key, contentType);
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    return NextResponse.json({ url, publicUrl });
  } catch (err) {
    console.error("video-upload-url error:", err);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
