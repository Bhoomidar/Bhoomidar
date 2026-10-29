"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { loginCodeCandidates } from "@/lib/referral";

// Used by the register form to tick a referral code and show who owns it.
// Only a code that belongs to an activated partner counts as valid, the same
// rule the register action applies. Returns just the name, nothing else.
export async function lookupReferral(rawCode) {
  // new codes have no dash, older ones do: both ways of writing are accepted
  const codes = loginCodeCandidates(rawCode);
  if (!codes.length) return { valid: false };

  const { data } = await createAdminClient()
    .from("profiles")
    .select("full_name, is_active, activated_at")
    .in("referral_code", codes)
    .limit(1)
    .maybeSingle();

  if (!data || data.is_active === false || !data.activated_at) return { valid: false };
  return { valid: true, name: data.full_name };
}
