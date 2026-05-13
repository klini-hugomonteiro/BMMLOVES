import fs from "fs";
import path from "path";
import crypto from "crypto";

const CODES_DIR = path.join(process.cwd(), "data", "auth-codes");
const SESSIONS_DIR = path.join(process.cwd(), "data", "sessions");

function ensureDirs() {
  if (!fs.existsSync(CODES_DIR)) fs.mkdirSync(CODES_DIR, { recursive: true });
  if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "bmmservicos@bmmtech.com.br";

// ── Códigos de login ──────────────────────────────────

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export type CodeMeta = { type: "admin" } | { type: "customer"; pageId: string };

export function saveCode(email: string, code: string, meta: CodeMeta): string {
  ensureDirs();
  const tempToken = crypto.randomUUID();
  fs.writeFileSync(
    path.join(CODES_DIR, `${tempToken}.json`),
    JSON.stringify({ email, code, expiresAt: Date.now() + 10 * 60 * 1000, ...meta })
  );
  return tempToken;
}

export function verifyCode(tempToken: string, code: string): { email: string } & CodeMeta | null {
  ensureDirs();
  const filePath = path.join(CODES_DIR, `${tempToken}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const record = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (Date.now() > record.expiresAt) { fs.unlinkSync(filePath); return null; }
    if (record.code !== code) return null;
    fs.unlinkSync(filePath);
    const { code: _, expiresAt: __, ...rest } = record;
    return rest;
  } catch { return null; }
}

// ── Sessões ───────────────────────────────────────────

export function createSession(email: string, meta: CodeMeta): string {
  ensureDirs();
  const token = crypto.randomUUID();
  fs.writeFileSync(
    path.join(SESSIONS_DIR, `${token}.json`),
    JSON.stringify({ email, ...meta, createdAt: Date.now(), expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
  );
  return token;
}

export function getSession(token: string): ({ email: string } & CodeMeta) | null {
  const filePath = path.join(SESSIONS_DIR, `${token}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const record = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (Date.now() > record.expiresAt) { fs.unlinkSync(filePath); return null; }
    return record;
  } catch { return null; }
}

export function validateSession(token: string): boolean {
  const filePath = path.join(SESSIONS_DIR, `${token}.json`);
  if (!fs.existsSync(filePath)) return false;
  try {
    const record = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (Date.now() > record.expiresAt) { fs.unlinkSync(filePath); return false; }
    return true;
  } catch { return false; }
}

export function deleteSession(token: string): void {
  const filePath = path.join(SESSIONS_DIR, `${token}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
