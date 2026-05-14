import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "counter.json");

function ensureDir() {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function getCount(): number {
  ensureDir();
  if (!fs.existsSync(FILE)) return 297;
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8")).count ?? 297;
  } catch {
    return 297;
  }
}

export function incrementCount(): void {
  ensureDir();
  const count = getCount();
  fs.writeFileSync(FILE, JSON.stringify({ count: count + 1 }));
}
