export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getPending, deletePending } from "@/app/lib/pending";
import { savePage, getPage } from "@/app/lib/pageStore";
import { sendPageReadyEmail } from "@/app/lib/email";
import { incrementCouponUse } from "@/app/lib/coupons";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bmmmlove.com";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId");
    const tempId = searchParams.get("tempId");

    if (!paymentId || !tempId) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
    const paymentApi = new Payment(client);
    const result = await paymentApi.get({ id: paymentId });

    if (result.status !== "approved") {
      return NextResponse.json({ status: result.status });
    }

    const pending = await getPending(tempId);
    if (!pending) {
      return NextResponse.json({ status: "approved", redirectUrl: `/casal/${tempId}` });
    }

    const now = Date.now();
    if (pending.data._couponCode) await incrementCouponUse(pending.data._couponCode);

    if (pending.data._editPageId) {
      const editPageId = pending.data._editPageId as string;
      const existing = await getPage(editPageId);
      if (existing) {
        await savePage(editPageId, {
          ...existing,
          data: { ...existing.data, _editPageId: undefined, _editPending: undefined },
          editUnlockedAt: now,
        } as typeof existing);
      }
      await deletePending(tempId);
      return NextResponse.json({ status: "approved", redirectUrl: `/minha-pagina/${editPageId}?editUnlocked=1` });
    }

    const expiresAt = pending.plan === "7dias" ? now + 7 * 24 * 60 * 60 * 1000 : null;
    await savePage(tempId, { data: pending.data, plan: pending.plan, createdAt: now, expiresAt });
    await deletePending(tempId);

    const pageUrl = `${BASE_URL}/casal/${tempId}`;
    sendPageReadyEmail({
      to: pending.email,
      nome1: pending.data.nome1 || "",
      nome2: pending.data.nome2 || "",
      tituloFilme: pending.data.tituloFilme || "",
      pageUrl,
    }).catch(err => console.error("Email error:", err));

    const params = new URLSearchParams({
      pageId: tempId,
      nome1: pending.data.nome1 || "",
      nome2: pending.data.nome2 || "",
      tituloFilme: pending.data.tituloFilme || "",
      email: pending.email || "",
    });

    return NextResponse.json({ status: "approved", redirectUrl: `/pronto?${params}` });
  } catch (err) {
    console.error("Check error:", err);
    return NextResponse.json({ error: "Erro ao verificar pagamento" }, { status: 500 });
  }
}
