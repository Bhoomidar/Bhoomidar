import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// The logged-in partner and their profile. Cached per request, so the
// dashboard layout and pages can all call it without extra queries.
export const getCurrentPartner = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, is_active, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.full_name || user.user_metadata?.full_name || "Partner";

  return {
    user,
    name,
    firstName: name.split(" ")[0],
    email: profile?.email ?? user.email,
    phone: profile?.phone || "",
    active: profile?.is_active !== false,
    joined: new Date(profile?.created_at ?? user.created_at).toLocaleDateString(
      "en-IN",
      { day: "numeric", month: "long", year: "numeric" },
    ),
  };
});

export const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
