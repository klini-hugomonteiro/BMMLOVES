export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/app/lib/auth";
import { getPending, deletePending } from "@/app/lib/pending";
import { savePage } from "@/app/lib/pageStore";
import { sendPageReadyEmail } from "@/app/lib/email";
import { incrementCount } from "@/app/lib/counter";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bmmmlove.com";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tempId: string }> }
) {
  const token = req.cookies.get("bmm_session")?.value;
  if (!token || !validateSession(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tempId } = await params;
  const pending = getPending(tempId);
  if (!pending) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

  const now = Date.now();
  const expiresAt = pending.plan === "7dias" ? now + 7 * 24 * 60 * 60 * 1000 : null;

  savePage(tempId, { data: pending.data, plan: pending.plan, createdAt: now, expiresAt });
  deletePending(tempId);
  incrementCount();

  const pageUrl = `${BASE_URL}/casal/${tempId}`;
  sendPageReadyEmail({
    to: pending.email,
    nome1: pending.data.nome1 || "",
    nome2: pending.data.nome2 || "",
    tituloFilme: pending.data.tituloFilme || "",
    pageUrl,
  }).catch(err => console.error("Email error:", err));

  return NextResponse.json({ ok: true });
}
