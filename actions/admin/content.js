"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONTENT_TAG } from "@/lib/content";
import { DEFAULTS } from "@/lib/siteContent";

const MAX_LEN = 3000;

function refreshSite() {
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

// entries: { settingKey: "new value", ... }
export async function saveSettings(entries) {
  await requireAdmin();

  const rows = [];
  for (const [key, value] of Object.entries(entries ?? {})) {
    if (!(key in DEFAULTS)) continue; // ignore unknown keys
    const text = String(value ?? "").replace(/\r\n/g, "\n");
    if (text.length > MAX_LEN) {
      return { success: false, error: "One of the texts is too long." };
    }
    rows.push({ key, value: text, updated_at: new Date().toISOString() });
  }
  if (!rows.length) return { success: true };

  const { error } = await createAdminClient()
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) {
    console.error("saveSettings:", error.message);
    return { success: false, error: "Could not save. Please try again." };
  }

  refreshSite();
  return { success: true };
}

// Puts the given keys back to the built-in text.
export async function resetSettings(keys) {
  await requireAdmin();
  const valid = (keys ?? []).filter((k) => k in DEFAULTS);
  if (!valid.length) return { success: true };

  const { error } = await createAdminClient()
    .from("site_settings")
    .delete()
    .in("key", valid);
  if (error) {
    console.error("resetSettings:", error.message);
    return { success: false, error: "Could not reset. Please try again." };
  }

  refreshSite();
  return { success: true };
}
