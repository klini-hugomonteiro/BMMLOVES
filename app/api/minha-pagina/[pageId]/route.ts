export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { getPage } from "@/app/lib/pageStore";

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

  const page = await getPage(pageId);
  if (!page) return NextResponse.json({ error: "Página não encontrada." }, { status: 404 });

  const now = Date.now();
  const hoursOld = (now - page.createdAt) / (1000 * 60 * 60);
  const editUnlocked = (page as { editUnlockedAt?: number }).editUnlockedAt;

  return NextResponse.json({
    pageId,
    nome1: page.data.nome1,
    nome2: page.data.nome2,
    tituloFilme: page.data.tituloFilme,
    email: page.data.email,
    plan: page.plan,
    createdAt: page.createdAt,
    expiresAt: page.expiresAt,
    canEdit: page.plan === "vitalicio",
    editFree: page.plan === "vitalicio" && hoursOld < 24,
    editUnlocked: !!editUnlocked,
  });
}
