import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "pages");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PageRecord = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  plan: "7dias" | "vitalicio";
  createdAt: number;
  expiresAt: number | null;
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function savePage(pageId: string, record: PageRecord): void {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, `${pageId}.json`), JSON.stringify(record));
}

export function getPage(pageId: string): PageRecord | null {
  const filePath = path.join(DATA_DIR, `${pageId}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

export function findPageByEmail(email: string): { pageId: string; record: PageRecord } | null {
  ensureDir();
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
  for (const file of files) {
    try {
      const record: PageRecord = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
      if (record.data?.email?.toLowerCase() === email.toLowerCase()) {
        return { pageId: file.replace(".json", ""), record };
      }
    } catch { /* skip */ }
  }
  return null;
}
