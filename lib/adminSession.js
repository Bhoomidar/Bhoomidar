// Admin login: a self-signed cookie (HMAC-SHA256), checked against the
// ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_SESSION_SECRET values in .env.
// Web Crypto is used so it also works from proxy.js.
export const COOKIE_NAME = "admin_session";
export const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const toBase64Url = (bytes) => Buffer.from(bytes).toString("base64url");
const fromBase64Url = (str) => new Uint8Array(Buffer.from(str, "base64url"));

async function getKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createAdminSessionToken(email) {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ email, expires })).toString("base64url");
  const sig = await crypto.subtle.sign(
    "HMAC",
    await getKey(),
    new TextEncoder().encode(payload),
  );
  return `${payload}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifyAdminSessionToken(token) {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await getKey(),
      fromBase64Url(sig),
      new TextEncoder().encode(payload),
    );
    if (!valid) return null;

    const { email, expires } = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (!email || !expires || Date.now() > expires) return null;
    return { email };
  } catch {
    return null;
  }
}
