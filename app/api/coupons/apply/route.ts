export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { applyCoupon } from "@/app/lib/coupons";

const PRICES = { "7dias": 19.90, vitalicio: 29.90 };

export async function POST(req: NextRequest) {
  const { code, plan } = await req.json();
  if (!code || !plan) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const baseAmount = PRICES[plan as keyof typeof PRICES];
  if (!baseAmount) return NextResponse.json({ error: "Plano inválido." }, { status: 400 });

  const result = applyCoupon(code, baseAmount);
  if (!result.valid) return NextResponse.json({ error: result.message }, { status: 400 });

  return NextResponse.json({ newAmount: result.newAmount, originalAmount: baseAmount });
}
