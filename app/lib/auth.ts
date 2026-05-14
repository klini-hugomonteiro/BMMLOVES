import crypto from "crypto";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "bmmservicos@bmmtech.com.br";

export type CodeMeta = { type: "admin" } | { type: "customer"; pageId: string };

type CodeRecord = { email: string; code: string; expiresAt: number } & CodeMeta;
type SessionRecord = { email: string; createdAt: number; expiresAt: number } & CodeMeta;

// In-memory stores — ephemeral by design (auth codes expire in 10 min, sessions in 24h)
const codes = new Map<string, CodeRecord>();
const sessions = new Map<string, SessionRecord>();

// ── Códigos de login ──────────────────────────────────

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function saveCode(email: string, code: string, meta: CodeMeta): string {
  const tempToken = crypto.randomUUID();
  codes.set(tempToken, { email, code, expiresAt: Date.now() + 10 * 60 * 1000, ...meta });
  return tempToken;
}

export function verifyCode(tempToken: string, code: string): ({ email: string } & CodeMeta) | null {
  const record = codes.get(tempToken);
  if (!record) return null;
  if (Date.now() > record.expiresAt) { codes.delete(tempToken); return null; }
  if (record.code !== code) return null;
  codes.delete(tempToken);
  const { code: _, expiresAt: __, ...rest } = record;
  return rest;
}

// ── Sessões ───────────────────────────────────────────

export function createSession(email: string, meta: CodeMeta): string {
  const token = crypto.randomUUID();
  sessions.set(token, { email, ...meta, createdAt: Date.now(), expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
  return token;
}

export function getSession(token: string): ({ email: string } & CodeMeta) | null {
  const record = sessions.get(token);
  if (!record) return null;
  if (Date.now() > record.expiresAt) { sessions.delete(token); return null; }
  return record;
}

export function validateSession(token: string): boolean {
  const record = sessions.get(token);
  if (!record) return false;
  if (Date.now() > record.expiresAt) { sessions.delete(token); return false; }
  return true;
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}
