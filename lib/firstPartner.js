import { createAdminClient } from "@/lib/supabase/admin";

// True while nobody has registered yet. The very first partner joins without a referral code;
// everyone after that needs one. If the count cannot be read, a code stays required.
export async function noPartnersYet() {
  const { count, error } = await createAdminClient()
    .from("profiles")
    .select("id", { count: "exact", head: true });
  return !error && count === 0;
}
