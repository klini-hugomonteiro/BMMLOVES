export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { savePending } from "@/app/lib/pending";
import fs from "fs";
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

    // Save video files now (tempId = eventual pageId)
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("video_") && value instanceof File && value.size > 0) {
        const epId = key.replace("video_", "");
        const uploadDir = path.join(process.cwd(), "data", "uploads", tempId);
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const ext = path.extname(value.name) || ".mp4";
        const fileName = `${epId}${ext}`;
        fs.writeFileSync(path.join(uploadDir, fileName), Buffer.from(await value.arrayBuffer()));
        const ep = payload.episodios?.find((e: { id: string }) => e.id === epId);
        if (ep) { ep.videoUrl = `/api/uploads/${tempId}/${fileName}`; ep.videoTipo = "arquivo"; }
      }
    }

    savePending(tempId, {
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
