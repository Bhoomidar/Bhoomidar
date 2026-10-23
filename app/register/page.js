import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { latestDobISO, normalizeReferralCode } from "@/lib/referral";

export const metadata = { title: "Become a Partner | Bhoomidar" };

export default async function RegisterPage({ searchParams }) {
  const { redirect: next, ref } = await searchParams;
  const redirectTo =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/dashboard";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(redirectTo);

  // Link like /register?ref=UP-8101: fill in the code and say who invited them.
  const refCode = typeof ref === "string" ? normalizeReferralCode(ref) : "";
  let referrerName = "";
  if (refCode) {
    const { data } = await createAdminClient()
      .from("profiles")
      .select("full_name, is_active, activated_at")
      .eq("referral_code", refCode)
      .maybeSingle();
    if (data?.is_active && data.activated_at) referrerName = data.full_name;
  }

  return (
    <AuthShell wide>
      <RegisterForm
        redirectTo={redirectTo}
        refCode={referrerName ? refCode : ""}
        referrerName={referrerName}
        maxDob={latestDobISO()}
      />
    </AuthShell>
  );
}
