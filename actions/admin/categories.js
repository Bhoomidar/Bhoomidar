"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONTENT_TAG } from "@/lib/content";
import { CATEGORY_ICON_CHOICES } from "@/lib/icons";

function refreshSite() {
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

const clean = (v, max = 40) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);

// The types for the admin: { id, name, label, icon, count } in their order,
// `count` = how many properties use the type.
export async function getCategoryRows() {
  await requireAdmin();
  const db = createAdminClient();
  const [{ data: cats }, { data: props }] = await Promise.all([
    db.from("property_categories").select("id, name, label, icon, display_order").order("display_order", { ascending: true }),
    db.from("properties").select("category"),
  ]);
  const used = {};
  for (const p of props ?? []) used[p.category] = (used[p.category] ?? 0) + 1;
  return (cats ?? []).map((c) => ({ ...c, count: used[c.name] ?? 0 }));
}

// Creates a type when input.id is empty, otherwise changes it. Renaming a type
// renames it on every property that uses it.
export async function saveCategory(input) {
  await requireAdmin();
  const name = clean(input?.name);
  if (!name) return { success: false, error: "Give the type a name." };
  const label = clean(input?.label);
  const icon = input?.icon in CATEGORY_ICON_CHOICES ? input.icon : "Home";

  const db = createAdminClient();
  const { data: all } = await db.from("property_categories").select("id, name, display_order");
  const list = all ?? [];
  if (list.some((c) => c.id !== input.id && c.name.toLowerCase() === name.toLowerCase())) {
    return { success: false, error: "There is already a type with this name." };
  }

  if (input.id) {
    const old = list.find((c) => c.id === input.id);
    if (!old) return { success: false, error: "This type no longer exists." };
    const { error } = await db.from("property_categories").update({ name, label, icon }).eq("id", input.id);
    if (error) {
      console.error("saveCategory:", error.message);
      return { success: false, error: "Could not save the type." };
    }
    if (old.name !== name) {
      const { error: renameError } = await db.from("properties").update({ category: name }).eq("category", old.name);
      if (renameError) {
        console.error("saveCategory rename:", renameError.message);
        return { success: false, error: "The type was saved but its properties could not be renamed." };
      }
    }
  } else {
    const next = list.length ? Math.max(...list.map((c) => c.display_order)) + 1 : 0;
    const { error } = await db.from("property_categories").insert({ name, label, icon, display_order: next });
    if (error) {
      console.error("saveCategory:", error.message);
      return { success: false, error: "Could not save the type." };
    }
  }
  refreshSite();
  return { success: true };
}

// Swaps a type with its neighbour. direction: -1 (up) or 1 (down)
export async function moveCategory(id, direction) {
  await requireAdmin();
  const db = createAdminClient();
  const { data } = await db.from("property_categories").select("id, display_order").order("display_order", { ascending: true });
  const list = data ?? [];
  const i = list.findIndex((c) => c.id === id);
  const j = i + (direction < 0 ? -1 : 1);
  if (i < 0 || j < 0 || j >= list.length) return { success: true };

  [list[i], list[j]] = [list[j], list[i]];
  const results = await Promise.all(
    list.map((c, idx) => db.from("property_categories").update({ display_order: idx }).eq("id", c.id)),
  );
  if (results.some((r) => r.error)) return { success: false, error: "Could not reorder." };
  refreshSite();
  return { success: true };
}

// A type that still has properties cannot be deleted: move them to another type first.
export async function deleteCategory(id) {
  await requireAdmin();
  const db = createAdminClient();
  const { data: cat } = await db.from("property_categories").select("id, name").eq("id", id).maybeSingle();
  if (!cat) return { success: true };

  const { count } = await db.from("properties").select("id", { count: "exact", head: true }).eq("category", cat.name);
  if (count > 0) {
    return {
      success: false,
      error: `${count} propert${count === 1 ? "y uses" : "ies use"} "${cat.name}". Change ${count === 1 ? "its" : "their"} type first, then delete it.`,
    };
  }
  const { error } = await db.from("property_categories").delete().eq("id", id);
  if (error) return { success: false, error: "Could not delete the type." };
  refreshSite();
  return { success: true };
}
