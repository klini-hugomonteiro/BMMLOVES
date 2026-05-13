export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getPending, deletePending } from "@/app/lib/pending";
import { savePage, getPage } from "@/app/lib/pageStore";
import { sendPageReadyEmail } from "@/app/lib/email";
import { incrementCouponUse } from "@/app/lib/coupons";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bmmmlove.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Suporta formato novo (type/data) e antigo (topic/id)
    const isPayment =
      body.type === "payment" ||
      body.topic === "payment" ||
      body.action === "payment.updated";

    if (!isPayment) return NextResponse.json({ ok: true });

    const paymentId = body.data?.id || body.id;
    if (!paymentId) return NextResponse.json({ ok: true });

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    });

    const paymentApi = new Payment(client);
    const result = await paymentApi.get({ id: String(paymentId) });

    console.log("Webhook payment:", result.id, "status:", result.status, "ref:", result.external_reference);

    if (result.status !== "approved") return NextResponse.json({ ok: true });

    const tempId = result.external_reference;
    if (!tempId) return NextResponse.json({ ok: true });

    const pending = getPending(tempId);
    if (!pending) return NextResponse.json({ ok: true }); // já processado

    const now = Date.now();
    if (pending.data._couponCode) incrementCouponUse(pending.data._couponCode);

    // Pagamento de edição
    if (pending.data._editPageId) {
      const editPageId = pending.data._editPageId as string;
      const existing = getPage(editPageId);
      if (existing) {
        savePage(editPageId, {
          ...existing,
          data: { ...existing.data, _editPageId: undefined, _editPending: undefined },
          editUnlockedAt: now,
        } as typeof existing);
      }
      deletePending(tempId);
      return NextResponse.json({ ok: true });
    }

    // Pagamento normal — cria a página
    const expiresAt = pending.plan === "7dias" ? now + 7 * 24 * 60 * 60 * 1000 : null;
    savePage(tempId, { data: pending.data, plan: pending.plan, createdAt: now, expiresAt });
    deletePending(tempId);

    const pageUrl = `${BASE_URL}/casal/${tempId}`;
    sendPageReadyEmail({
      to: pending.email,
      nome1: pending.data.nome1 || "",
      nome2: pending.data.nome2 || "",
      tituloFilme: pending.data.tituloFilme || "",
      pageUrl,
    }).catch(err => console.error("Email error:", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    // Sempre retorna 200 para o MP não ficar reenviando
    return NextResponse.json({ ok: true });
  }
}
