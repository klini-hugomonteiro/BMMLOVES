export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/app/lib/auth";
import { getCoupon, saveCoupon, deleteCoupon } from "@/app/lib/coupons";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const token = req.cookies.get("bmm_session")?.value;
  if (!token || !await validateSession(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await params;
  const coupon = await getCoupon(code);
  if (!coupon) return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });

  const body = await req.json();
  await saveCoupon({ ...coupon, ...body });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const token = req.cookies.get("bmm_session")?.value;
  if (!token || !await validateSession(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await params;
  await deleteCoupon(code);
  return NextResponse.json({ ok: true });
}
