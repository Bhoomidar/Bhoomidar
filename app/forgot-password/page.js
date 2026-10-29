import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import ForgotForm from "@/components/auth/ForgotForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Forgot Password | Bhoomidar" };

export default async function ForgotPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell bare>
      <ForgotForm />
    </AuthShell>
  );
}
