export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyCode, createSession } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  const { tempToken, code } = await req.json();
  if (!tempToken || !code) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const record = verifyCode(tempToken, code.trim());
  if (!record) return NextResponse.json({ error: "Código inválido ou expirado." }, { status: 401 });

  const sessionToken = createSession(record.email, record.type === "admin"
    ? { type: "admin" }
    : { type: "customer", pageId: (record as { type: "customer"; pageId: string }).pageId }
  );

  const redirectUrl = record.type === "admin"
    ? "/admin"
    : `/minha-pagina/${(record as { type: "customer"; pageId: string }).pageId}`;

  const res = NextResponse.json({ ok: true, redirectUrl });
  res.cookies.set("bmm_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60,
    path: "/",
  });
  return res;
}
