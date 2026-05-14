import { countPages } from "./pageStore";

const BASE = 297;

export async function getCount(): Promise<number> {
  try {
    return BASE + await countPages();
  } catch {
    return BASE;
  }
}

// mantida por compatibilidade — não precisa mais fazer nada
export function incrementCount(): void {}
