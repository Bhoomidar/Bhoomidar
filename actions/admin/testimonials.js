"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONTENT_TAG } from "@/lib/content";

function refreshSite() {
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

const clean = (v, max) => String(v ?? "").trim().slice(0, max);

export async function getAllTestimonials() {
  await requireAdmin();
  const { data } = await createAdminClient()
    .from("testimonials")
    .select("*")
    .order("display_order", { ascending: true });
  return data ?? [];
}

// Creates a testimonial when input.id is empty, otherwise updates it.
export async function saveTestimonial(input) {
  await requireAdmin();
  const name = clean(input?.name, 80);
  const text = clean(input?.text, 600);
  if (!name) return { success: false, error: "Name is required." };
  if (!text) return { success: false, error: "The testimonial text is required." };

  const rating = Math.min(5, Math.max(1, Number(input?.rating) || 5));
  const row = { name, role: clean(input?.role, 80), text, rating };

  const db = createAdminClient();
  let error;

  if (input.id) {
    ({ error } = await db.from("testimonials").update(row).eq("id", input.id));
  } else {
    const { data: last } = await db
      .from("testimonials")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);
    const next = last?.[0] ? last[0].display_order + 1 : 0;
    ({ error } = await db.from("testimonials").insert({ ...row, display_order: next }));
  }

  if (error) {
    console.error("saveTestimonial:", error.message);
    return { success: false, error: "Could not save the testimonial." };
  }
  refreshSite();
  return { success: true };
}

export async function setTestimonialActive(id, isActive) {
  await requireAdmin();
  const { error } = await createAdminClient()
    .from("testimonials")
    .update({ is_active: !!isActive })
    .eq("id", id);
  if (error) return { success: false, error: "Could not update." };
  refreshSite();
  return { success: true };
}

export async function deleteTestimonial(id) {
  await requireAdmin();
  const { error } = await createAdminClient().from("testimonials").delete().eq("id", id);
  if (error) return { success: false, error: "Could not delete." };
  refreshSite();
  return { success: true };
}
