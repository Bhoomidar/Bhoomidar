import crypto from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { otpMail, resetMail, sendMail } from "@/lib/mail";

// Email codes (registration, login) and the "forgot password" link. See supabase/027_auth_codes.sql.
// Server only. Only the hash of a code or token is stored.

const CODE_MINUTES = 10;
const VERIFIED_MINUTES = 30; // after the registration code was right, the form may be sent for this long
const RESET_MINUTES = 30;
const MAX_TRIES = 5;
const MIN_GAP_SECONDS = 45; // between two codes to the same email
const MAX_PER_HOUR = 5;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function secret() {
  const s = process.env.AUTH_CODE_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("No secret to protect the email codes with.");
  return s;
}

const hmac = (value) => crypto.createHmac("sha256", secret()).update(value).digest("hex");
const same = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const inMinutes = (n) => new Date(Date.now() + n * 60_000).toISOString();

export const cleanEmail = (value) => String(value ?? "").trim().toLowerCase();

// The address the site is reached on, for the link in the reset email.
async function siteUrl() {
  const fixed = String(process.env.SITE_URL ?? "").trim().replace(/\/+$/, "");
  if (fixed) return fixed;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Is a new code to this email allowed now? Returns an error message, or "".
async function throttled(admin, email, purpose) {
  const { data } = await admin
    .from("auth_codes")
    .select("created_at")
    .eq("email", email)
    .eq("purpose", purpose)
    .gte("created_at", new Date(Date.now() - 3600_000).toISOString())
    .order("created_at", { ascending: false });
  if (!data?.length) return "";
  if (Date.now() - new Date(data[0].created_at).getTime() < MIN_GAP_SECONDS * 1000) {
    return "Please wait a minute before asking for another code.";
  }
  if (data.length >= MAX_PER_HOUR) return "Too many codes were asked for. Please try again after an hour.";
  return "";
}

// Makes a 6-digit code for this email and sends it. Returns { error } or {}.
export async function sendEmailCode(emailRaw, purpose) {
  const email = cleanEmail(emailRaw);
  const admin = createAdminClient();

  const wait = await throttled(admin, email, purpose);
  if (wait) return { error: wait };

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const { data: row, error } = await admin
    .from("auth_codes")
    .insert({ email, purpose, code_hash: hmac(`${purpose}:${email}:${code}`), expires_at: inMinutes(CODE_MINUTES) })
    .select("id")
    .single();
  if (error) {
    console.error("Email code error:", error.message);
    return { error: "We could not send the code. Please try again." };
  }

  try {
    await sendMail({ to: email, ...otpMail(code, purpose) });
  } catch (err) {
    console.error("Email send error:", err.message);
    await admin.from("auth_codes").delete().eq("id", row.id);
    return { error: "We could not send the email. Please try again in a little while." };
  }
  return {};
}

// Checks the code a person typed. Right: the code is used up (login) or marked as verified
// (register). Wrong five times: the code is dead. Returns true or false.
export async function checkEmailCode(emailRaw, purpose, codeRaw) {
  const email = cleanEmail(emailRaw);
  const code = String(codeRaw ?? "").replace(/\D/g, "");
  if (code.length !== 6) return false;

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("auth_codes")
    .select("id, code_hash, attempts, verified_at")
    .eq("email", email)
    .eq("purpose", purpose)
    .is("used_at", null)
    .is("verified_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!row || row.attempts >= MAX_TRIES) return false;

  if (!same(row.code_hash, hmac(`${purpose}:${email}:${code}`))) {
    await admin.from("auth_codes").update({ attempts: row.attempts + 1 }).eq("id", row.id);
    return false;
  }

  // used_at only when it is a one-time use (login); registration stays "verified" until the account is made
  const patch =
    purpose === "register"
      ? { verified_at: new Date().toISOString(), expires_at: inMinutes(VERIFIED_MINUTES) }
      : { used_at: new Date().toISOString() };
  const { data: done } = await admin
    .from("auth_codes")
    .update(patch)
    .eq("id", row.id)
    .is("used_at", null)
    .is("verified_at", null)
    .select("id");
  return !!done?.length;
}

// Has this email been verified (registration code entered right, not too long ago)?
export async function isEmailVerified(emailRaw) {
  const { data } = await createAdminClient()
    .from("auth_codes")
    .select("id")
    .eq("email", cleanEmail(emailRaw))
    .eq("purpose", "register")
    .is("used_at", null)
    .not("verified_at", "is", null)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();
  return !!data;
}

// The account was made: the verification cannot be used again.
export async function finishEmailVerification(emailRaw) {
  await createAdminClient()
    .from("auth_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("email", cleanEmail(emailRaw))
    .eq("purpose", "register")
    .is("used_at", null);
}

// "Forgot password": makes a one-time link for this email and sends it. Returns { error } or {}.
export async function sendResetLink(emailRaw) {
  const email = cleanEmail(emailRaw);
  const admin = createAdminClient();

  const wait = await throttled(admin, email, "reset");
  if (wait) return { error: wait };

  const token = crypto.randomBytes(32).toString("hex");
  const { data: row, error } = await admin
    .from("auth_codes")
    .insert({ email, purpose: "reset", code_hash: hmac(`reset:${token}`), expires_at: inMinutes(RESET_MINUTES) })
    .select("id")
    .single();
  if (error) {
    console.error("Reset link error:", error.message);
    return { error: "We could not send the email. Please try again." };
  }

  try {
    await sendMail({ to: email, ...resetMail(`${await siteUrl()}/reset-password?token=${token}`) });
  } catch (err) {
    console.error("Email send error:", err.message);
    await admin.from("auth_codes").delete().eq("id", row.id);
    return { error: "We could not send the email. Please try again in a little while." };
  }
  return {};
}

// Is this reset link still good? (Does not use it up.) Returns the email, or "".
export async function peekResetToken(token) {
  if (!/^[0-9a-f]{64}$/.test(String(token ?? ""))) return "";
  const { data } = await createAdminClient()
    .from("auth_codes")
    .select("email")
    .eq("purpose", "reset")
    .eq("code_hash", hmac(`reset:${token}`))
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();
  return data?.email ?? "";
}

// Uses the reset link up. Returns the email once, "" when the link is bad, used or old.
export async function consumeResetToken(token) {
  if (!/^[0-9a-f]{64}$/.test(String(token ?? ""))) return "";
  const admin = createAdminClient();
  const { data } = await admin
    .from("auth_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("purpose", "reset")
    .eq("code_hash", hmac(`reset:${token}`))
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("email");
  const email = data?.[0]?.email ?? "";
  // any other link sent before is dead too
  if (email) {
    await admin
      .from("auth_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("email", email)
      .eq("purpose", "reset")
      .is("used_at", null);
  }
  return email;
}
