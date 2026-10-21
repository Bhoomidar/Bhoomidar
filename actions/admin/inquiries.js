"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getInquiries() {
  await requireAdmin();
  const { data } = await createAdminClient()
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function setInquiryStatus(id, status) {
  await requireAdmin();
  if (!["new", "read", "closed"].includes(status)) {
    return { success: false, error: "Invalid status." };
  }
  const { error } = await createAdminClient()
    .from("inquiries")
    .update({ status })
    .eq("id", id);
  if (error) return { success: false, error: "Could not update." };
  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function deleteInquiry(id) {
  await requireAdmin();
  const { error } = await createAdminClient().from("inquiries").delete().eq("id", id);
  if (error) return { success: false, error: "Could not delete." };
  revalidatePath("/admin", "layout");
  return { success: true };
}
