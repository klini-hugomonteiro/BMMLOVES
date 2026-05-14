import { getJsonFromR2, putJsonToR2, deleteFromR2, listR2Keys } from "./r2";

const PREFIX = "json/pages/";
const EMAIL_PREFIX = "json/email-to-page/";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PageRecord = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  plan: "7dias" | "vitalicio";
  createdAt: number;
  expiresAt: number | null;
  freeEditUsed?: boolean;
};

export async function savePage(pageId: string, record: PageRecord): Promise<void> {
  await putJsonToR2(`${PREFIX}${pageId}.json`, record);
  const email = record.data?.email;
  if (email) {
    await putJsonToR2(`${EMAIL_PREFIX}${email.toLowerCase()}.json`, { pageId });
  }
}

export async function getPage(pageId: string): Promise<PageRecord | null> {
  return getJsonFromR2<PageRecord>(`${PREFIX}${pageId}.json`);
}

export async function deletePage(pageId: string): Promise<void> {
  const record = await getPage(pageId);
  if (record?.data?.email) {
    await deleteFromR2(`${EMAIL_PREFIX}${record.data.email.toLowerCase()}.json`);
  }
  await deleteFromR2(`${PREFIX}${pageId}.json`);
}

export async function findPageByEmail(email: string): Promise<{ pageId: string; record: PageRecord } | null> {
  const index = await getJsonFromR2<{ pageId: string }>(`${EMAIL_PREFIX}${email.toLowerCase()}.json`);
  if (!index?.pageId) return null;
  const record = await getPage(index.pageId);
  if (!record) return null;
  return { pageId: index.pageId, record };
}

export async function listAllPages(): Promise<{ pageId: string; record: PageRecord }[]> {
  const keys = await listR2Keys(PREFIX);
  const results = await Promise.all(
    keys.map(async key => {
      const record = await getJsonFromR2<PageRecord>(key);
      if (!record) return null;
      const pageId = key.replace(PREFIX, "").replace(".json", "");
      return { pageId, record };
    })
  );
  return results.filter((r): r is { pageId: string; record: PageRecord } => r !== null);
}

export async function countPages(): Promise<number> {
  const keys = await listR2Keys(PREFIX);
  return keys.length;
}
