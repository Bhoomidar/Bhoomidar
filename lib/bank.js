// Bank detail checks. Safe to use in the browser and on the server.
// Only checks that things are well formed; it cannot tell whether an account really exists.

// "hdfc0000123 " -> "HDFC0000123"
export const cleanIfsc = (v) => String(v ?? "").replace(/\s/g, "").toUpperCase().slice(0, 11);

// "1234 5678 9012" -> "123456789012" (up to 18 digits)
export const accountDigits = (v) => String(v ?? "").replace(/\D/g, "").slice(0, 18);

// "9012" -> "XXXXXX9012"
export const maskAccount = (last4) => (last4 ? `XXXXXX${last4}` : "Not added");

export const IFSC_PATTERN = "[A-Za-z]{4}0[A-Za-z0-9]{6}";

// Each returns an error message, or "" when it is fine.
export function holderError(v) {
  const t = String(v ?? "").trim();
  if (t.length < 2) return "Enter the name on the bank account.";
  if (!/^[A-Za-z][A-Za-z .,'-]*$/.test(t)) return "The name on the account can have only letters and spaces.";
  return "";
}

export function ifscError(v) {
  const t = cleanIfsc(v);
  if (!t) return "Enter the IFSC code.";
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(t)) return "The IFSC code is 11 characters, like HDFC0000123.";
  return "";
}

export function accountError(v) {
  const t = accountDigits(v);
  if (!t) return "Enter the account number.";
  if (t.length < 9 || t.length > 18) return "An account number has 9 to 18 digits.";
  if (/^(\d)\1+$/.test(t)) return "This account number does not look right.";
  return "";
}

// UPI id is optional: "" is fine.
export function upiError(v) {
  const t = String(v ?? "").trim();
  if (!t) return "";
  if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9]{2,}$/.test(t)) return "The UPI id looks like name@bank.";
  return "";
}
