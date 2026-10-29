import { headers } from "next/headers";

// "up810011 " -> "UP810011". Returns "" when it cannot be a referral code.
// Shapes: UP810011 (state, district 81, number 0011), UP81A0011 (after 9999 a letter
// is added), BH0011 (fixed prefix). Codes made before have a dash: BH-9718, UP-8101.
export function normalizeReferralCode(value) {
  const code = String(value ?? "").trim().toUpperCase();
  return /^[A-Z]{2,5}-?(\d{2})?[A-Z]{0,3}\d{4,}$/.test(code) ? code : "";
}

// What a partner may type instead of their email to log in: "up810011", "UP-810011", "bh9718"...
// Returns the codes it could be stored as (new codes have no dash, older ones do), or [] when
// it cannot be a code.
export function loginCodeCandidates(value) {
  const typed = String(value ?? "").replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2,5}-?[A-Z0-9]{4,}$/.test(typed)) return [];
  const bare = typed.replace("-", "");
  const withDash = bare.replace(/^([A-Z]{2,5}?)(\d.*)$/, "$1-$2");
  return [...new Set([typed, bare, withDash])];
}

// Full link a partner can share, e.g. https://bhoomidar.com/register?ref=UP810011
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
