// Aadhaar number checks. Safe to use in both the browser and on the server.
// This only checks that the number is well formed (12 digits + Verhoeff check
// digit). It cannot tell whether the number belongs to a real person.

const D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

function verhoeffValid(digits) {
  let c = 0;
  const rev = digits.split("").reverse();
  for (let i = 0; i < rev.length; i++) c = D[c][P[i % 8][Number(rev[i])]];
  return c === 0;
}

// "1234 5678 9012" or "123456789012" -> "123456789012"
export const aadhaarDigits = (value) => String(value ?? "").replace(/\D/g, "").slice(0, 12);

// "123456789012" -> "1234 5678 9012" (for typing in a form)
export const formatAadhaar = (value) => aadhaarDigits(value).replace(/(\d{4})(?=\d)/g, "$1 ");

// "9012" -> "XXXX XXXX 9012"
export const maskAadhaar = (last4) => (last4 ? `XXXX XXXX ${last4}` : "Not added");

export const AADHAAR_PATTERN = "[0-9 ]{14}";

// Returns an error message, or "" when the number is valid.
export function aadhaarError(value) {
  const digits = aadhaarDigits(value);
  if (!digits) return "Aadhaar number is required.";
  if (digits.length !== 12) return "Aadhaar number must be exactly 12 digits.";
  if (!/^[2-9]/.test(digits)) return "Enter a valid Aadhaar number.";
  if (!verhoeffValid(digits)) return "This Aadhaar number does not look right. Please check it.";
  return "";
}
