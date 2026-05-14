export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { generateCode, saveCode, ADMIN_EMAIL } from "@/app/lib/auth";
import { findPageByEmail } from "@/app/lib/pageStore";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "E-mail obrigatório." }, { status: 400 });

    const normalized = email.trim().toLowerCase();
    const isAdmin = normalized === ADMIN_EMAIL.toLowerCase();
    const code = generateCode();

    let tempToken: string;
    let type: "admin" | "customer";

    if (isAdmin) {
      tempToken = saveCode(normalized, code, { type: "admin" });
      type = "admin";
    } else {
      const found = await findPageByEmail(normalized);
      if (!found) {
        return NextResponse.json({ error: "Nenhuma página encontrada para este e-mail." }, { status: 404 });
      }
      tempToken = saveCode(normalized, code, { type: "customer", pageId: found.pageId });
      type = "customer";
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`\n🔑 CÓDIGO ${type.toUpperCase()}: ${code}\n`);
    }

    const { error: sendError } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "BMM Love <onboarding@resend.dev>",
      to: normalized,
      subject: `Seu código de acesso BMM Love: ${code}`,
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#0d0d1a;color:#fff;border-radius:16px;">
          <h2 style="margin:0 0 8px;color:#E8185A;">BMM Love</h2>
          <p style="color:rgba(255,255,255,0.6);margin:0 0 24px;">Seu código de acesso de uso único:</p>
          <div style="background:#1a1a2e;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#fff;">${code}</span>
          </div>
          <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">Expira em 10 minutos. Não compartilhe este código.</p>
        </div>
      `,
    });

    if (sendError) {
      console.error("Resend error:", sendError);
      return NextResponse.json({ error: "Erro ao enviar o e-mail." }, { status: 500 });
    }

    return NextResponse.json({ tempToken, type });
  } catch (err) {
    console.error("Send code error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
