import fs from "fs";
import path from "path";

const PENDING_DIR = path.join(process.cwd(), "data", "pending");

export type PendingRecord = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  plan: "7dias" | "vitalicio";
  createdAt: number;
  email: string;
};

function ensureDir() {
  if (!fs.existsSync(PENDING_DIR)) fs.mkdirSync(PENDING_DIR, { recursive: true });
}

export function savePending(tempId: string, record: PendingRecord): void {
  ensureDir();
  fs.writeFileSync(path.join(PENDING_DIR, `${tempId}.json`), JSON.stringify(record));
}

export function getPending(tempId: string): PendingRecord | null {
  const filePath = path.join(PENDING_DIR, `${tempId}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

export function deletePending(tempId: string): void {
  const filePath = path.join(PENDING_DIR, `${tempId}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
