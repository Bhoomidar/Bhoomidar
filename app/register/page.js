import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Become a Partner | Bhoomidar" };

export default async function RegisterPage({ searchParams }) {
  const { redirect: next } = await searchParams;
  const redirectTo =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/dashboard";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(redirectTo);

  return (
    <AuthShell>
      <RegisterForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
