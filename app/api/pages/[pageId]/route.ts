export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getPage } from "@/app/lib/pageStore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const record = getPage(pageId);

  if (!record) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const now = Date.now();
  if (record.expiresAt && now > record.expiresAt) {
    return NextResponse.json({
      expired: true,
      plan: record.plan,
      nome1: record.data.nome1,
      nome2: record.data.nome2,
      tituloFilme: record.data.tituloFilme,
    });
  }

  return NextResponse.json({ data: record.data, plan: record.plan, expiresAt: record.expiresAt });
}
