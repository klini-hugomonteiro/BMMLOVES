export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getPending, deletePending } from "@/app/lib/pending";
import { savePage } from "@/app/lib/pageStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const tempId = searchParams.get("external_reference");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bmmmlove.com";

  if (!tempId) {
    return NextResponse.redirect(`${baseUrl}/criar?erro=referencia_invalida`);
  }

  // Verify payment status via MP API (don't trust query params alone)
  if (paymentId && process.env.MERCADOPAGO_ACCESS_TOKEN) {
    try {
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
      });
      const payment = new Payment(client);
      const result = await payment.get({ id: paymentId });
      if (result.status !== "approved") {
        return NextResponse.redirect(`${baseUrl}/criar?erro=pagamento_nao_aprovado`);
      }
    } catch {
      // If verification fails, fall back to trusting the redirect status
      if (status !== "approved") {
        return NextResponse.redirect(`${baseUrl}/criar?erro=pagamento_nao_aprovado`);
      }
    }
  } else if (status !== "approved") {
    return NextResponse.redirect(`${baseUrl}/criar?erro=pagamento_nao_aprovado`);
  }

  const pending = getPending(tempId);
  if (!pending) {
    // Page may already have been created (duplicate redirect)
    return NextResponse.redirect(
      `${baseUrl}/pronto?pageId=${tempId}&nome1=&nome2=&tituloFilme=&email=`
    );
  }

  const now = Date.now();
  const expiresAt = pending.plan === "7dias" ? now + 7 * 24 * 60 * 60 * 1000 : null;

  savePage(tempId, {
    data: pending.data,
    plan: pending.plan,
    createdAt: now,
    expiresAt,
  });

  deletePending(tempId);

  const { nome1, nome2, tituloFilme, email, zap } = pending.data;
  const params = new URLSearchParams({
    pageId: tempId,
    nome1: nome1 || "",
    nome2: nome2 || "",
    tituloFilme: tituloFilme || "",
    email: email || "",
    ...(zap ? { zap } : {}),
  });

  return NextResponse.redirect(`${baseUrl}/pronto?${params.toString()}`);
}
