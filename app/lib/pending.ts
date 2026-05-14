import { getJsonFromR2, putJsonToR2, deleteFromR2, listR2Keys } from "./r2";

const PREFIX = "json/pending/";

export type PendingRecord = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  plan: "7dias" | "vitalicio";
  createdAt: number;
  email: string;
};

export async function savePending(tempId: string, record: PendingRecord): Promise<void> {
  await putJsonToR2(`${PREFIX}${tempId}.json`, record);
}

export async function getPending(tempId: string): Promise<PendingRecord | null> {
  return getJsonFromR2<PendingRecord>(`${PREFIX}${tempId}.json`);
}

export async function deletePending(tempId: string): Promise<void> {
  await deleteFromR2(`${PREFIX}${tempId}.json`);
}

export async function listAllPending(): Promise<{ tempId: string; record: PendingRecord }[]> {
  const keys = await listR2Keys(PREFIX);
  const results = await Promise.all(
    keys.map(async key => {
      const record = await getJsonFromR2<PendingRecord>(key);
      if (!record) return null;
      const tempId = key.replace(PREFIX, "").replace(".json", "");
      return { tempId, record };
    })
  );
  return results.filter((r): r is { tempId: string; record: PendingRecord } => r !== null);
}
