export const PHONE_PATTERN = "[6-9][0-9]{9}";

export function keepDigits(value) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 10);
}

// Returns an error message, or "" when the number is valid.
export function phoneError(value) {
  const val = String(value ?? "").trim();
  if (!val) return "Phone number is required.";
  if (!/^\d{10}$/.test(val)) return "Phone number must be exactly 10 digits.";
  if (!/^[6-9]/.test(val)) return "Enter a valid mobile number starting with 6, 7, 8 or 9.";
  return "";
}
