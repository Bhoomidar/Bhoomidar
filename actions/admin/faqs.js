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

export async function getAllFaqs() {
  await requireAdmin();
  const { data } = await createAdminClient()
    .from("faqs")
    .select("*")
    .order("display_order", { ascending: true });
  return data ?? [];
}

// Creates a question when input.id is empty, otherwise updates it.
export async function saveFaq(input) {
  await requireAdmin();
  const question = clean(input?.question, 200);
  const answer = clean(input?.answer, 1500);
  if (!question) return { success: false, error: "The question is required." };
  if (!answer) return { success: false, error: "The answer is required." };

  const db = createAdminClient();
  let error;

  if (input.id) {
    ({ error } = await db.from("faqs").update({ question, answer }).eq("id", input.id));
  } else {
    const { data: last } = await db
      .from("faqs")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);
    const next = last?.[0] ? last[0].display_order + 1 : 0;
    ({ error } = await db.from("faqs").insert({ question, answer, display_order: next }));
  }

  if (error) {
    console.error("saveFaq:", error.message);
    return { success: false, error: "Could not save the question." };
  }
  refreshSite();
  return { success: true };
}

export async function setFaqActive(id, isActive) {
  await requireAdmin();
  const { error } = await createAdminClient()
    .from("faqs")
    .update({ is_active: !!isActive })
    .eq("id", id);
  if (error) return { success: false, error: "Could not update." };
  refreshSite();
  return { success: true };
}

// Moves a question one place up (dir = -1) or down (dir = 1) by swapping its order
// with its neighbour.
export async function moveFaq(id, dir) {
  await requireAdmin();
  const db = createAdminClient();
  const { data: rows, error } = await db
    .from("faqs")
    .select("id, display_order")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error || !rows) return { success: false, error: "Could not move it." };

  const i = rows.findIndex((r) => r.id === id);
  const j = i + (dir < 0 ? -1 : 1);
  if (i < 0 || j < 0 || j >= rows.length) return { success: true };

  // Write the whole order again, so equal numbers can never leave two in a tie.
  const order = rows.map((r) => r.id);
  [order[i], order[j]] = [order[j], order[i]];
  const results = await Promise.all(
    order.map((rowId, n) => db.from("faqs").update({ display_order: n }).eq("id", rowId)),
  );
  if (results.some((r) => r.error)) return { success: false, error: "Could not move it." };

  refreshSite();
  return { success: true };
}

export async function deleteFaq(id) {
  await requireAdmin();
  const { error } = await createAdminClient().from("faqs").delete().eq("id", id);
  if (error) return { success: false, error: "Could not delete." };
  refreshSite();
  return { success: true };
}
