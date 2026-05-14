export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/app/lib/auth";
import { listAllPages } from "@/app/lib/pageStore";
import { listAllPending } from "@/app/lib/pending";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("bmm_session")?.value;
  if (!token || !validateSession(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = Date.now();

  const [allPages, allPending] = await Promise.all([listAllPages(), listAllPending()]);

  const pages = allPages
    .map(({ pageId, record }) => ({
      pageId,
      nome1: record.data?.nome1 || "",
      nome2: record.data?.nome2 || "",
      tituloFilme: record.data?.tituloFilme || "",
      email: record.data?.email || "",
      plan: record.plan,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
      status: record.expiresAt !== null && now > record.expiresAt ? "expired" : "active",
    }))
    .sort((a, b) => b.createdAt - a.createdAt);

  const pending = allPending
    .map(({ tempId, record }) => ({
      tempId,
      nome1: record.data?.nome1 || "",
      nome2: record.data?.nome2 || "",
      tituloFilme: record.data?.tituloFilme || "",
      email: record.email || "",
      plan: record.plan,
      createdAt: record.createdAt,
    }))
    .sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({ pages, pending });
}
