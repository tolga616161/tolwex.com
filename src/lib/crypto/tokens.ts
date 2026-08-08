import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;

function getKey(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY || "";
  if (!raw) {
    // Dev fallback derived from SESSION_SECRET — still encrypted at rest,
    // but production must set TOKEN_ENCRYPTION_KEY explicitly.
    const fallback = process.env.SESSION_SECRET || "dev-only-insecure-fallback-key";
    return createHash("sha256").update(fallback).digest();
  }
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  return createHash("sha256").update(raw).digest();
}

/** Encrypt a secret string (access token / app secret). Never log plaintext or ciphertext in app logs. */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted payload");
  }
  const decipher = createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/** Redact any token-like string for safe logging */
export function redactToken(value: string | null | undefined): string {
  if (!value) return "[empty]";
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}…${value.slice(-2)} (${value.length} chars)`;
}
