export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { savePending } from "@/app/lib/pending";
import { uploadToR2, processImagesInPayload } from "@/app/lib/r2";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const dataJson = formData.get("data") as string;
    if (!dataJson) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = JSON.parse(dataJson);
    const plan = (payload.plano as "7dias" | "vitalicio") || "7dias";
    const tempId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    // Upload video files to R2 (tempId = eventual pageId)
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("video_") && value instanceof File && value.size > 0) {
        const epId = key.replace("video_", "");
        const ext = path.extname(value.name) || ".mp4";
        const fileName = `${epId}${ext}`;
        const buffer = Buffer.from(await value.arrayBuffer());
        const contentType = value.type || "video/mp4";
        const url = await uploadToR2(`${tempId}/${fileName}`, buffer, contentType);

        const ep = payload.episodios?.find((e: { id: string }) => e.id === epId);
        if (ep) { ep.videoUrl = url; ep.videoTipo = "arquivo"; }
      }
    }

    // Upload all base64 images to R2
    await processImagesInPayload(payload, tempId);

    await savePending(tempId, {
      data: payload,
      plan,
      createdAt: Date.now(),
      email: payload.email,
    });

    return NextResponse.json({ tempId, plan });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
