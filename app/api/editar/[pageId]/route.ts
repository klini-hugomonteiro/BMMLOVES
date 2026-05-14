export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { getPage, savePage } from "@/app/lib/pageStore";
import { uploadToR2, processImagesInPayload } from "@/app/lib/r2";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const token = req.cookies.get("bmm_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await getSession(token);
  if (!session) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  const { pageId } = await params;
  if (session.type === "customer" && (session as { pageId: string }).pageId !== pageId) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const page = await getPage(pageId);
  if (!page) return NextResponse.json({ error: "Página não encontrada." }, { status: 404 });

  return NextResponse.json({ pageId, data: page.data, plan: page.plan });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const token = req.cookies.get("bmm_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await getSession(token);
  if (!session) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  const { pageId } = await params;
  if (session.type === "customer" && (session as { pageId: string }).pageId !== pageId) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const existing = await getPage(pageId);
  if (!existing) return NextResponse.json({ error: "Página não encontrada." }, { status: 404 });

  const hoursOld = (Date.now() - existing.createdAt) / (1000 * 60 * 60);
  const isFreeWindow = existing.plan === "vitalicio" && hoursOld < 24;
  const isPaidUnlocked = !!(existing as { editUnlockedAt?: number }).editUnlockedAt;

  if (!isFreeWindow && !isPaidUnlocked) {
    return NextResponse.json({ error: "Edição não autorizada." }, { status: 403 });
  }

  if (isFreeWindow && existing.freeEditUsed) {
    return NextResponse.json({ error: "Edição grátis já utilizada." }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const dataJson = formData.get("data") as string;
    if (!dataJson) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = JSON.parse(dataJson);

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("video_") && value instanceof File && value.size > 0) {
        const epId = key.replace("video_", "");
        const ext = path.extname(value.name) || ".mp4";
        const fileName = `${epId}${ext}`;
        const buffer = Buffer.from(await value.arrayBuffer());
        const contentType = value.type || "video/mp4";
        const url = await uploadToR2(`${pageId}/${fileName}`, buffer, contentType);

        const ep = payload.episodios?.find((e: { id: string }) => e.id === epId);
        if (ep) { ep.videoUrl = url; ep.videoTipo = "arquivo"; }
      }
    }

    await processImagesInPayload(payload, pageId);
    await savePage(pageId, {
      ...existing,
      data: payload,
      freeEditUsed: isFreeWindow ? true : existing.freeEditUsed,
    });

    return NextResponse.json({ ok: true, pageId });
  } catch (err) {
    console.error("Edit save error:", err);
    return NextResponse.json({ error: "Erro ao salvar." }, { status: 500 });
  }
}
