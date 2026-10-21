import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Log In | Bhoomidar" };

export default async function LoginPage({ searchParams }) {
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
      <LoginForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
