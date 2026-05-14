export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getPending } from "@/app/lib/pending";

const PRICES = { "7dias": 15.90, vitalicio: 23.90 };
const EDIT_PRICE = 4.90;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tempId: string }> }
) {
  const { tempId } = await params;
  const pending = await getPending(tempId);
  if (!pending) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isEdit = !!pending.data._editPageId;

  return NextResponse.json({
    plan: pending.plan,
    amount: isEdit ? EDIT_PRICE : PRICES[pending.plan],
    email: pending.email,
    nome1: pending.data.nome1,
    nome2: pending.data.nome2,
    tituloFilme: pending.data.tituloFilme,
    isEdit,
  });
}
