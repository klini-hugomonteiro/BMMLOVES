import fs from "fs";
import path from "path";

const PAGES_DIR = path.join(process.cwd(), "data", "pages");
const BASE = 297; // número base para prova social

export function getCount(): number {
  if (!fs.existsSync(PAGES_DIR)) return BASE;
  try {
    const total = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith(".json")).length;
    return BASE + total;
  } catch {
    return BASE;
  }
}

// mantida por compatibilidade — não precisa mais fazer nada
export function incrementCount(): void {}
