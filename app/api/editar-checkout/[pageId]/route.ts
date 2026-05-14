export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { getPage, savePage } from "@/app/lib/pageStore";
import { savePending } from "@/app/lib/pending";

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

  const page = await getPage(pageId);
  if (!page) return NextResponse.json({ error: "Página não encontrada." }, { status: 404 });

  if (page.plan !== "vitalicio") {
    return NextResponse.json({ error: "Plano 7 dias não permite edições." }, { status: 403 });
  }

  const hoursOld = (Date.now() - page.createdAt) / (1000 * 60 * 60);
  if (hoursOld < 24) {
    return NextResponse.json({ error: "Dentro das 24h, edição é gratuita." }, { status: 400 });
  }

  const tempId = `edit_${pageId}`;
  await savePending(tempId, {
    data: { ...page.data, _editPageId: pageId },
    plan: "vitalicio",
    email: page.data.email,
    createdAt: Date.now(),
  });

  await savePage(pageId, { ...page, data: { ...page.data, _editPending: tempId } } as typeof page);

  return NextResponse.json({ tempId });
}
