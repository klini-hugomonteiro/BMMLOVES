export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/app/lib/auth";
import { listCoupons, saveCoupon } from "@/app/lib/coupons";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("bmm_session")?.value;
  if (!token || !validateSession(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(await listCoupons());
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("bmm_session")?.value;
  if (!token || !validateSession(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code, type, discount, maxUses } = await req.json();

  if (!code || !type || !discount) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  if (!["percent", "fixed"].includes(type)) return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });

  await saveCoupon({
    code: code.toUpperCase().trim(),
    type,
    discount: Number(discount),
    maxUses: maxUses ? Number(maxUses) : null,
    uses: 0,
    active: true,
    createdAt: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
