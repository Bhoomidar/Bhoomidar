"use server";

import { cleanIfsc } from "@/lib/bank";

// Looks an IFSC code up in the public Razorpay IFSC directory, so the bank details form can fill in
// the bank and branch. Only the IFSC code leaves our server. If the directory is down the form
// simply carries on without the hint.
export async function lookupIfsc(code) {
  const ifsc = cleanIfsc(code);
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return { found: false };

  try {
    const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (res.status === 404) return { found: false };
    if (!res.ok) return { found: false, error: true };
    const d = await res.json();
    return { found: true, bank: String(d.BANK ?? ""), branch: String(d.BRANCH ?? ""), city: String(d.CITY ?? "") };
  } catch {
    return { found: false, error: true };
  }
}
