import crypto from "crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12; // GCM recommended

function getKey(): Buffer {
  const raw = process.env.AES_MASTER_KEY || "";
  if (!raw) throw new Error("AES_MASTER_KEY missing");
  // Support formats: base64:..., hex:..., or raw string padded
  if (raw.startsWith("base64:")) return Buffer.from(raw.slice(7), "base64");
  if (raw.startsWith("hex:")) return Buffer.from(raw.slice(4), "hex");
  const buf = Buffer.alloc(32);
  Buffer.from(raw).copy(buf);
  return buf;
}

export function encryptString(plain: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptString(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + 16);
  const data = buf.subarray(IV_LENGTH + 16);
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}
