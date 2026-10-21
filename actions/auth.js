"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { phoneError } from "@/lib/phone";

// Only allow redirects to a path on this site.
function safeRedirect(target) {
  return typeof target === "string" && target.startsWith("/") && !target.startsWith("//")
    ? target
    : "/dashboard";
}

export async function login(_prevState, formData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Wrong email or password." };

  // The admin can switch a partner off (admin panel > Partners).
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profile?.is_active === false) {
    await supabase.auth.signOut();
    return { error: "This account is switched off. Please contact us." };
  }

  revalidatePath("/", "layout");
  redirect(safeRedirect(formData.get("redirect_to")));
}

// Creates the account directly (no email confirmation) and logs the user in.
export async function register(_prevState, formData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { error: "Please fill in all the fields." };
  }
  const phoneErr = phoneError(phone);
  if (phoneErr) return { error: phoneErr };
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const admin = createAdminClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone },
  });

  if (createError) {
    const message = createError.message.toLowerCase();
    if (message.includes("already") && (message.includes("registered") || message.includes("exists"))) {
      return { error: "An account with this email already exists. Please log in." };
    }
    console.error("Register error:", createError.message);
    return { error: "We could not create your account. Please try again." };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    redirect("/login");
  }

  revalidatePath("/", "layout");
  redirect(safeRedirect(formData.get("redirect_to")));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
