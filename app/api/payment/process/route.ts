export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getPending, savePending, deletePending } from "@/app/lib/pending";
import { savePage, getPage } from "@/app/lib/pageStore";
import { sendPageReadyEmail } from "@/app/lib/email";
import { applyCoupon, incrementCouponUse } from "@/app/lib/coupons";
import { incrementCount } from "@/app/lib/counter";

const PRICES: Record<string, number> = { "7dias": 15.90, vitalicio: 23.90, edit: 4.90 };

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bmmmlove.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tempId, couponCode, ...formData } = body;

    if (!tempId) return NextResponse.json({ error: "Missing tempId" }, { status: 400 });

    const pending = await getPending(tempId);
    if (!pending) return NextResponse.json({ error: "Session expired" }, { status: 404 });

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    });

    const payment = new Payment(client);
    const isEdit = !!pending.data._editPageId;
    const baseAmount = isEdit ? PRICES.edit : PRICES[pending.plan];
    const couponResult = couponCode ? await applyCoupon(couponCode, baseAmount) : null;
    const amount = couponResult ? couponResult.newAmount : baseAmount;

    const result = await payment.create({
      body: {
        ...formData,
        transaction_amount: amount,
        description: pending.plan === "vitalicio" ? "BMM Love - Vitalício" : "BMM Love - 7 Dias",
        external_reference: tempId,
        payer: {
          ...formData.payer,
          email: formData.payer?.email || pending.email,
        },
      },
    });

    if (result.status === "approved") {
      const now = Date.now();
      if (couponCode) await incrementCouponUse(couponCode);

      if (isEdit) {
        const editPageId = pending.data._editPageId as string;
        const existing = await getPage(editPageId);
        if (existing) {
          await savePage(editPageId, { ...existing, data: { ...existing.data, _editPageId: undefined, _editPending: undefined }, editUnlockedAt: now } as typeof existing);
        }
        await deletePending(tempId);
        return NextResponse.json({ status: "approved", redirectUrl: `/minha-pagina/${editPageId}?editUnlocked=1` });
      }

      const expiresAt = pending.plan === "7dias" ? now + 7 * 24 * 60 * 60 * 1000 : null;
      await savePage(tempId, { data: pending.data, plan: pending.plan, createdAt: now, expiresAt });
      incrementCount();
      await deletePending(tempId);

      const pageUrl = `${BASE_URL}/casal/${tempId}`;
      sendPageReadyEmail({
        to: pending.email,
        nome1: pending.data.nome1 || "",
        nome2: pending.data.nome2 || "",
        tituloFilme: pending.data.tituloFilme || "",
        pageUrl,
      }).catch((err) => console.error("Email send error:", err));

      const params = new URLSearchParams({
        pageId: tempId,
        nome1: pending.data.nome1 || "",
        nome2: pending.data.nome2 || "",
        tituloFilme: pending.data.tituloFilme || "",
        email: pending.email || "",
      });

      return NextResponse.json({ status: "approved", redirectUrl: `/pronto?${params}` });
    }

    if (couponCode) {
      await savePending(tempId, { ...pending, data: { ...pending.data, _couponCode: couponCode } });
    }

    const pixResponse: Record<string, unknown> = { status: result.status, paymentId: result.id };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pointOfInteraction = (result as any).point_of_interaction;
    if (pointOfInteraction?.transaction_data?.qr_code) {
      pixResponse.qrCode = pointOfInteraction.transaction_data.qr_code;
      pixResponse.qrCodeBase64 = pointOfInteraction.transaction_data.qr_code_base64;
    }
    return NextResponse.json(pixResponse);
  } catch (err) {
    console.error("Payment process error:", err);
    const mpErr = err as { cause?: { code: number; description: string }[]; message?: string };
    const cause = mpErr?.cause?.[0];
    const errorMap: Record<number, string> = {
      2067: "CPF inválido. Verifique o número informado.",
      2001: "Token do cartão inválido. Tente novamente.",
      3034: "Cartão recusado. Tente outro cartão ou use PIX.",
      3035: "Cartão recusado. Tente outro cartão ou use PIX.",
      10105: "Cartão não reconhecido. Verifique o número digitado.",
    };
    const message = cause ? (errorMap[cause.code] ?? cause.description) : "Erro ao processar pagamento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
