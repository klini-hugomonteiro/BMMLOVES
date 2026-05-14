import crypto from "crypto";
import { getJsonFromR2, putJsonToR2, deleteFromR2 } from "./r2";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "bmmservicos@bmmtech.com.br";

export type CodeMeta = { type: "admin" } | { type: "customer"; pageId: string };

type CodeRecord = { email: string; code: string; expiresAt: number } & CodeMeta;
type SessionRecord = { email: string; createdAt: number; expiresAt: number } & CodeMeta;

const CODE_PREFIX = "json/auth/codes/";
const SESSION_PREFIX = "json/auth/sessions/";

// ── Códigos de login ──────────────────────────────────

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function saveCode(email: string, code: string, meta: CodeMeta): Promise<string> {
  const tempToken = crypto.randomUUID();
  const record: CodeRecord = { email, code, expiresAt: Date.now() + 10 * 60 * 1000, ...meta };
  await putJsonToR2(`${CODE_PREFIX}${tempToken}.json`, record);
  return tempToken;
}

export async function verifyCode(tempToken: string, code: string): Promise<({ email: string } & CodeMeta) | null> {
  const record = await getJsonFromR2<CodeRecord>(`${CODE_PREFIX}${tempToken}.json`);
  if (!record) return null;
  if (Date.now() > record.expiresAt) { await deleteFromR2(`${CODE_PREFIX}${tempToken}.json`); return null; }
  if (record.code !== code) return null;
  await deleteFromR2(`${CODE_PREFIX}${tempToken}.json`);
  const { code: _, expiresAt: __, ...rest } = record;
  return rest;
}

// ── Sessões ───────────────────────────────────────────

export async function createSession(email: string, meta: CodeMeta): Promise<string> {
  const token = crypto.randomUUID();
  const record: SessionRecord = { email, ...meta, createdAt: Date.now(), expiresAt: Date.now() + 24 * 60 * 60 * 1000 };
  await putJsonToR2(`${SESSION_PREFIX}${token}.json`, record);
  return token;
}

export async function getSession(token: string): Promise<({ email: string } & CodeMeta) | null> {
  const record = await getJsonFromR2<SessionRecord>(`${SESSION_PREFIX}${token}.json`);
  if (!record) return null;
  if (Date.now() > record.expiresAt) { await deleteFromR2(`${SESSION_PREFIX}${token}.json`); return null; }
  return record;
}

export async function validateSession(token: string): Promise<boolean> {
  const record = await getJsonFromR2<SessionRecord>(`${SESSION_PREFIX}${token}.json`);
  if (!record) return false;
  if (Date.now() > record.expiresAt) { await deleteFromR2(`${SESSION_PREFIX}${token}.json`); return false; }
  return true;
}

export async function deleteSession(token: string): Promise<void> {
  await deleteFromR2(`${SESSION_PREFIX}${token}.json`);
}
