export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { savePage } from "@/app/lib/pageStore";
import { uploadToR2, processImagesInPayload } from "@/app/lib/r2";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const dataJson = formData.get("data") as string;
    if (!dataJson) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = JSON.parse(dataJson);
    const pageId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    // Upload video files to R2
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("video_") && value instanceof File && value.size > 0) {
        const epId = key.replace("video_", "");
        const ext = path.extname(value.name) || ".mp4";
        const fileName = `${epId}${ext}`;
        const buffer = Buffer.from(await value.arrayBuffer());
        const contentType = value.type || "video/mp4";
        const url = await uploadToR2(`${pageId}/${fileName}`, buffer, contentType);

        const ep = payload.episodios?.find((e: { id: string }) => e.id === epId);
        if (ep) {
          ep.videoUrl = url;
          ep.videoTipo = "arquivo";
        }
      }
    }

    // Upload all base64 images (capa, momentos, episódios covers) to R2
    await processImagesInPayload(payload, pageId);

    const plan = (payload.plano as "7dias" | "vitalicio") || "7dias";
    const now = Date.now();
    const expiresAt = plan === "7dias" ? now + 7 * 24 * 60 * 60 * 1000 : null;

    await savePage(pageId, { data: payload, plan, createdAt: now, expiresAt });

    return NextResponse.json({ pageId });
  } catch (err) {
    console.error("Error creating page:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
