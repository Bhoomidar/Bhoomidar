import { headers } from "next/headers";

// "up-8101 " -> "UP-8101". Returns "" when it cannot be a referral code.
export function normalizeReferralCode(value) {
  const code = String(value ?? "").trim().toUpperCase();
  return /^[A-Z]{2}-\d{4,}$/.test(code) ? code : "";
}

// Full link a partner can share, e.g. https://bhoomidar.com/register?ref=UP-8101
export async function referralLink(code) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/register?ref=${encodeURIComponent(code)}`;
}

// 18 years ago today, as yyyy-mm-dd. The latest date of birth we accept.
export function latestDobISO() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

// Returns an error message, or "" when the date of birth is acceptable.
export function dobError(value) {
  const v = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) {
    return "Enter your date of birth.";
  }
  if (v > latestDobISO()) return "You must be at least 18 years old to become a partner.";
  if (v < "1900-01-01") return "Enter a valid date of birth.";
  return "";
}
