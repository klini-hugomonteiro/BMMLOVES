export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { getPage, savePage } from "@/app/lib/pageStore";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const token = req.cookies.get("bmm_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = getSession(token);
  if (!session) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  const { pageId } = await params;
  if (session.type === "customer" && (session as { pageId: string }).pageId !== pageId) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const page = getPage(pageId);
  if (!page) return NextResponse.json({ error: "Página não encontrada." }, { status: 404 });

  return NextResponse.json({ pageId, data: page.data, plan: page.plan });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const token = req.cookies.get("bmm_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = getSession(token);
  if (!session) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  const { pageId } = await params;
  if (session.type === "customer" && (session as { pageId: string }).pageId !== pageId) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const existing = getPage(pageId);
  if (!existing) return NextResponse.json({ error: "Página não encontrada." }, { status: 404 });

  try {
    const formData = await req.formData();
    const dataJson = formData.get("data") as string;
    if (!dataJson) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = JSON.parse(dataJson);

    // Reprocessa vídeos novos enviados
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("video_") && value instanceof File && value.size > 0) {
        const epId = key.replace("video_", "");
        const uploadDir = path.join(process.cwd(), "public", "uploads", pageId);
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        fs.writeFileSync(path.join(uploadDir, `${epId}.mp4`), Buffer.from(await value.arrayBuffer()));
        const ep = payload.episodios?.find((e: { id: string }) => e.id === epId);
        if (ep) { ep.videoUrl = `/uploads/${pageId}/${epId}.mp4`; ep.videoTipo = "arquivo"; }
      }
    }

    // Preserva plano e datas; só atualiza data
    savePage(pageId, {
      ...existing,
      data: payload,
    });

    return NextResponse.json({ ok: true, pageId });
  } catch (err) {
    console.error("Edit save error:", err);
    return NextResponse.json({ error: "Erro ao salvar." }, { status: 500 });
  }
}
