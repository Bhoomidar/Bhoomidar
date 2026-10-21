"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getPartners() {
  await requireAdmin();
  const { data } = await createAdminClient()
    .from("profiles")
    .select("id, full_name, email, phone, role, is_active, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

// A switched-off partner can no longer log in or open the dashboard.
export async function setPartnerActive(id, isActive) {
  await requireAdmin();
  const { error } = await createAdminClient()
    .from("profiles")
    .update({ is_active: !!isActive })
    .eq("id", id);
  if (error) return { success: false, error: "Could not update the partner." };
  revalidatePath("/admin/partners");
  return { success: true };
}
