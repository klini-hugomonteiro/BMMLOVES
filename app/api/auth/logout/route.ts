export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("bmm_session")?.value;
  if (token) deleteSession(token);

  const res = NextResponse.json({ ok: true });
  res.cookies.delete("bmm_session");
  return res;
}
