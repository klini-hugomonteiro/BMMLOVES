export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { savePending } from "@/app/lib/pending";
import { processImagesInPayload } from "@/app/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const dataJson = formData.get("data") as string;
    if (!dataJson) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = JSON.parse(dataJson);
    const plan = (payload.plano as "7dias" | "vitalicio") || "7dias";
    const tempId = (formData.get("tempId") as string) || crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    // Upload all base64 images to R2 (videos and images are pre-uploaded client-side)
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
