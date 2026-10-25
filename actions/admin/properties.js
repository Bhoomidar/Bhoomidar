"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONTENT_TAG } from "@/lib/content";
import { DEFAULT_CATEGORIES, DETAIL_ICONS } from "@/lib/icons";

function refreshSite() {
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

const clean = (v, max = 200) => String(v ?? "").trim().slice(0, max);

const slugify = (v) =>
  String(v ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

// Only our own pictures (/images/...) or https addresses.
const safeUrl = (v) => {
  const u = clean(v, 500);
  return u.startsWith("/") && !u.startsWith("//") ? u : /^https:\/\//.test(u) ? u : "";
};

const lines = (v, count, max) =>
  (Array.isArray(v) ? v : [])
    .map((t) => clean(t, max))
    .filter(Boolean)
    .slice(0, count);

// `categoryNames`: the types the admin has made (Admin > Properties > Types).
function parse(input, categoryNames) {
  const title = clean(input.title, 120);
  const price = clean(input.price, 60);
  if (!title) return { error: "Title is required." };
  if (!price) return { error: "Price is required." };

  const category = categoryNames.includes(input.category) ? input.category : categoryNames[0];
  if (!category) return { error: "Add a property type first (Properties > Types)." };
  const details = (Array.isArray(input.details) ? input.details : [])
    .map((d) => ({
      icon: d?.icon in DETAIL_ICONS ? d.icon : "MapPin",
      text: clean(d?.text, 80),
    }))
    .filter((d) => d.text)
    .slice(0, 6);

  return {
    row: {
      title,
      category,
      image_url: clean(input.image_url, 500) || null,
      badge: clean(input.badge, 30) || null,
      details,
      price,
      unit: clean(input.unit, 40),
      tagline: clean(input.tagline, 160),
      location: clean(input.location, 120),
      description: clean(input.description, 5000),
      gallery: (Array.isArray(input.gallery) ? input.gallery : []).map(safeUrl).filter(Boolean).slice(0, 12),
      highlights: lines(input.highlights, 8, 160),
      amenities: lines(input.amenities, 20, 40),
      specs: (Array.isArray(input.specs) ? input.specs : [])
        .map((s) => ({ label: clean(s?.label, 40), value: clean(s?.value, 80) }))
        .filter((s) => s.label && s.value)
        .slice(0, 12),
      map_url: /^https:\/\//.test(clean(input.map_url, 500)) ? clean(input.map_url, 500) : null,
      show_on_home: input.show_on_home !== false,
      banner_url: safeUrl(input.banner_url) || null,
    },
    slugWanted: slugify(input.slug) || slugify(title),
  };
}

export async function getAllProperties() {
  await requireAdmin();
  const { data } = await createAdminClient()
    .from("properties")
    .select("*")
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getPropertyById(id) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(String(id))) return null;
  const { data } = await createAdminClient().from("properties").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

// Creates a property when input.id is empty, otherwise updates it.
export async function saveProperty(input) {
  await requireAdmin();
  const db = createAdminClient();
  const { data: cats } = await db.from("property_categories").select("name").order("display_order", { ascending: true });
  // an unreadable table (not set up yet) falls back to the starting types; an empty one means none
  const categoryNames = (cats ?? DEFAULT_CATEGORIES).map((c) => c.name);

  const { row, slugWanted, error: invalid } = parse(input ?? {}, categoryNames);
  if (invalid) return { success: false, error: invalid };

  let error;

  // The page address must be unique: add -2, -3 ... if another property already has it.
  let slug = slugWanted || "property";
  for (let n = 2; n < 50; n++) {
    let q = db.from("properties").select("id").eq("slug", slug).limit(1);
    if (input.id) q = q.neq("id", input.id);
    const { data: taken } = await q;
    if (!taken?.length) break;
    slug = `${slugWanted || "property"}-${n}`;
  }
  row.slug = slug;

  if (input.id) {
    ({ error } = await db.from("properties").update(row).eq("id", input.id));
  } else {
    const { data: last } = await db
      .from("properties")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);
    const next = last?.[0] ? last[0].display_order + 1 : 0;
    ({ error } = await db.from("properties").insert({ ...row, display_order: next }));
  }

  if (error) {
    console.error("saveProperty:", error.message);
    return { success: false, error: "Could not save the property." };
  }
  refreshSite();
  return { success: true };
}

export async function setPropertyActive(id, isActive) {
  await requireAdmin();
  const { error } = await createAdminClient()
    .from("properties")
    .update({ is_active: !!isActive })
    .eq("id", id);
  if (error) return { success: false, error: "Could not update." };
  refreshSite();
  return { success: true };
}

// Shows or hides a property on the home page (the Properties page is not affected).
export async function setPropertyHome(id, show) {
  await requireAdmin();
  const { error } = await createAdminClient()
    .from("properties")
    .update({ show_on_home: !!show })
    .eq("id", id);
  if (error) return { success: false, error: "Could not update." };
  refreshSite();
  return { success: true };
}

// Swaps the order of a property with its neighbour. direction: -1 (up) or 1 (down)
export async function moveProperty(id, direction) {
  await requireAdmin();
  const db = createAdminClient();
  const { data: all } = await db
    .from("properties")
    .select("id, display_order")
    .order("display_order", { ascending: true });
  const list = all ?? [];
  const i = list.findIndex((p) => p.id === id);
  const j = i + (direction < 0 ? -1 : 1);
  if (i < 0 || j < 0 || j >= list.length) return { success: true };

  // Renumber everything so the order stays clean.
  [list[i], list[j]] = [list[j], list[i]];
  const results = await Promise.all(
    list.map((p, idx) => db.from("properties").update({ display_order: idx }).eq("id", p.id)),
  );
  if (results.some((r) => r.error)) return { success: false, error: "Could not reorder." };
  refreshSite();
  return { success: true };
}

export async function deleteProperty(id) {
  await requireAdmin();
  const { error } = await createAdminClient().from("properties").delete().eq("id", id);
  if (error) return { success: false, error: "Could not delete." };
  refreshSite();
  return { success: true };
}
