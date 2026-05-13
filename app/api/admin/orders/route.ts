export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/app/lib/auth";
import fs from "fs";
import path from "path";

const PAGES_DIR = path.join(process.cwd(), "data", "pages");
const PENDING_DIR = path.join(process.cwd(), "data", "pending");

export async function GET(req: NextRequest) {
  const token = req.cookies.get("bmm_session")?.value;
  if (!token || !validateSession(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pages: object[] = [];
  if (fs.existsSync(PAGES_DIR)) {
    for (const file of fs.readdirSync(PAGES_DIR).filter(f => f.endsWith(".json"))) {
      try {
        const pageId = file.replace(".json", "");
        const record = JSON.parse(fs.readFileSync(path.join(PAGES_DIR, file), "utf-8"));
        const now = Date.now();
        const expired = record.expiresAt !== null && now > record.expiresAt;
        pages.push({
          pageId,
          nome1: record.data?.nome1 || "",
          nome2: record.data?.nome2 || "",
          tituloFilme: record.data?.tituloFilme || "",
          email: record.data?.email || "",
          plan: record.plan,
          createdAt: record.createdAt,
          expiresAt: record.expiresAt,
          status: expired ? "expired" : "active",
        });
      } catch { /* skip */ }
    }
  }

  const pending: object[] = [];
  if (fs.existsSync(PENDING_DIR)) {
    for (const file of fs.readdirSync(PENDING_DIR).filter(f => f.endsWith(".json"))) {
      try {
        const tempId = file.replace(".json", "");
        const record = JSON.parse(fs.readFileSync(path.join(PENDING_DIR, file), "utf-8"));
        pending.push({
          tempId,
          nome1: record.data?.nome1 || "",
          nome2: record.data?.nome2 || "",
          tituloFilme: record.data?.tituloFilme || "",
          email: record.email || "",
          plan: record.plan,
          createdAt: record.createdAt,
        });
      } catch { /* skip */ }
    }
  }

  pages.sort((a: any, b: any) => b.createdAt - a.createdAt);
  pending.sort((a: any, b: any) => b.createdAt - a.createdAt);

  return NextResponse.json({ pages, pending });
}
