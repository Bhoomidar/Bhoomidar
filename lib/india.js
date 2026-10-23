// States and union territories. The code is the two letters used in referral codes (UP-8101).
export const STATES = [
  { code: "AN", name: "Andaman and Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CG", name: "Chhattisgarh" },
  { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu and Kashmir" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PY", name: "Puducherry" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TS", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
];

const STATE_ALIASES = {
  orissa: "OD",
  uttaranchal: "UK",
  pondicherry: "PY",
  "nct of delhi": "DL",
};

// "Jammu & Kashmir", "Orissa", ... -> the matching entry of STATES (or null).
export function matchState(name) {
  const n = String(name ?? "").toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ").trim();
  if (!n) return null;
  if (STATE_ALIASES[n]) return STATES.find((s) => s.code === STATE_ALIASES[n]) ?? null;
  return (
    STATES.find((s) => s.name.toLowerCase() === n) ??
    STATES.find((s) => s.name.toLowerCase().includes(n)) ??
    null
  );
}

export const findState = (code) => STATES.find((s) => s.code === code) ?? null;

export const PINCODE_PATTERN = "[1-9][0-9]{5}";

// Returns an error message, or "" when the pincode is valid.
export function pincodeError(value) {
  return /^[1-9]\d{5}$/.test(String(value ?? "").trim()) ? "" : "Enter a valid 6-digit pincode.";
}
