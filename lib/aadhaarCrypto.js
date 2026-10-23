import crypto from "node:crypto";

// SERVER ONLY. Never import this from a Client Component.
// Aadhaar numbers are stored encrypted with AES-256-GCM. The key lives in
// AADHAAR_ENCRYPTION_KEY (base64, 32 bytes). Keep a backup of it: without the
// key the stored numbers cannot be read. Generate one with:
//   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

function getKey() {
  const key = Buffer.from(process.env.AADHAAR_ENCRYPTION_KEY ?? "", "base64");
  if (key.length !== 32) {
    throw new Error("AADHAAR_ENCRYPTION_KEY is missing or is not a base64 32-byte key.");
  }
  return key;
}

export function encryptAadhaar(digits) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const data = Buffer.concat([cipher.update(digits, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv, tag, data].map((p, i) => (i === 0 ? p : p.toString("base64"))).join(":");
}

export function decryptAadhaar(payload) {
  const [version, iv, tag, data] = String(payload ?? "").split(":");
  if (version !== "v1" || !iv || !tag || !data) throw new Error("Unknown Aadhaar format.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(data, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

// Same Aadhaar always gives the same hash, so we can refuse a second sign up
// with it without keeping the number readable.
export function hashAadhaar(digits) {
  return crypto.createHmac("sha256", getKey()).update(`aadhaar:${digits}`).digest("hex");
}
