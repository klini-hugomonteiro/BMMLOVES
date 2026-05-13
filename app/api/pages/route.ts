export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { savePage } from "@/app/lib/pageStore";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const dataJson = formData.get("data") as string;
    if (!dataJson) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = JSON.parse(dataJson);
    const pageId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    // Save uploaded video files to public/uploads/[pageId]/
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("video_") && value instanceof File && value.size > 0) {
        const epId = key.replace("video_", "");
        const uploadDir = path.join(process.cwd(), "public", "uploads", pageId);
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const buffer = Buffer.from(await value.arrayBuffer());
        const fileName = `${epId}.mp4`;
        fs.writeFileSync(path.join(uploadDir, fileName), buffer);

        // Update episode videoUrl to the public path
        const ep = payload.episodios?.find((e: { id: string }) => e.id === epId);
        if (ep) {
          ep.videoUrl = `/uploads/${pageId}/${fileName}`;
          ep.videoTipo = "arquivo";
        }
      }
    }

    const plan = (payload.plano as "7dias" | "vitalicio") || "7dias";
    const now = Date.now();
    const expiresAt = plan === "7dias" ? now + 7 * 24 * 60 * 60 * 1000 : null;

    savePage(pageId, { data: payload, plan, createdAt: now, expiresAt });

    return NextResponse.json({ pageId });
  } catch (err) {
    console.error("Error creating page:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
