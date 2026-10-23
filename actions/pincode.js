"use server";

import { matchState } from "@/lib/india";

// Looks a pincode up in the India Post directory (api.postalpincode.in), so the
// register form can show the place and fill in the city and state. Only the
// 6-digit pincode leaves our server. If the directory is down the form simply
// carries on without the hint.
export async function lookupPincode(pin) {
  const code = String(pin ?? "").trim();
  if (!/^[1-9]\d{5}$/.test(code)) return { found: false };

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) return { found: false, error: true };

    const [first] = await res.json();
    const offices = first?.Status === "Success" ? (first.PostOffice ?? []) : [];
    if (offices.length === 0) return { found: false };

    const { District: district, State: state } = offices[0];
    const names = [...new Set(offices.map((o) => o.Name).filter(Boolean))];
    return {
      found: true,
      district,
      state,
      stateCode: matchState(state)?.code ?? "",
      areas: names.slice(0, 3),
      more: Math.max(names.length - 3, 0),
    };
  } catch {
    return { found: false, error: true };
  }
}
