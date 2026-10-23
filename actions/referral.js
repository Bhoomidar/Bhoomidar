"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeReferralCode } from "@/lib/referral";

// Used by the register form to tick a referral code and show who owns it.
// Only a code that belongs to an activated partner counts as valid, the same
// rule the register action applies. Returns just the name, nothing else.
export async function lookupReferral(rawCode) {
  const code = normalizeReferralCode(rawCode);
  if (!code) return { valid: false };

  const { data } = await createAdminClient()
    .from("profiles")
    .select("full_name, is_active, activated_at")
    .eq("referral_code", code)
    .maybeSingle();

  if (!data || data.is_active === false || !data.activated_at) return { valid: false };
  return { valid: true, name: data.full_name };
}
