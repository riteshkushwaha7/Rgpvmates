import crypto from "node:crypto";
import { requireEnv } from "@/lib/config";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  return crypto.createHash("sha256").update(requireEnv("MESSAGE_ENCRYPTION_KEY", process.env.MESSAGE_ENCRYPTION_KEY)).digest();
}

export function encryptMessage(content: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(content, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptMessage(input: { ciphertext: string; iv: string; authTag: string }) {
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(input.iv, "base64"));
  decipher.setAuthTag(Buffer.from(input.authTag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(input.ciphertext, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
