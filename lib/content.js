import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULTS } from "@/lib/siteContent";
import { DEFAULT_CATEGORIES } from "@/lib/icons";
import { FALLBACK_FAQS, FALLBACK_PROPERTIES, FALLBACK_TESTIMONIALS } from "@/lib/fallbackContent";

export const CONTENT_TAG = "site-content";

// Reads go through the service role: these tables are not exposed publicly.
// Cached, and the cache is cleared whenever the admin saves (see actions/admin).
const loadSettings = unstable_cache(
  async () => {
    try {
      const { data, error } = await createAdminClient()
        .from("site_settings")
        .select("key, value");
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
    } catch (err) {
      console.error("Could not read site_settings:", err?.message || err);
      return {};
    }
  },
  ["site-settings"],
  { revalidate: 300, tags: [CONTENT_TAG] },
);

// All site text: saved values on top of the built-in defaults.
export async function getContent() {
  return { ...DEFAULTS, ...(await loadSettings()) };
}

// The property types the admin manages (Admin > Properties > Types), in their order.
async function loadCategories() {
  try {
    const { data, error } = await createAdminClient()
      .from("property_categories")
      .select("name, label, icon")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data ?? DEFAULT_CATEGORIES;
  } catch (err) {
    console.error("Could not read property_categories:", err?.message || err);
    return DEFAULT_CATEGORIES;
  }
}

export const getCategories = unstable_cache(loadCategories, ["site-categories"], {
  revalidate: 300,
  tags: [CONTENT_TAG],
});

// Each property also gets `category_icon`: the icon name of its type.
const withIcons = (list, categories) => {
  const icons = Object.fromEntries(categories.map((c) => [c.name, c.icon]));
  return list.map((p) => ({ ...p, category_icon: icons[p.category] ?? null }));
};

export const getProperties = unstable_cache(
  async () => {
    const categories = await loadCategories();
    try {
      const { data, error } = await createAdminClient()
        .from("properties")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return withIcons(data?.length ? data : FALLBACK_PROPERTIES, categories);
    } catch (err) {
      console.error("Could not read properties:", err?.message || err);
      return withIcons(FALLBACK_PROPERTIES, categories);
    }
  },
  ["site-properties"],
  { revalidate: 300, tags: [CONTENT_TAG] },
);

export const getTestimonials = unstable_cache(
  async () => {
    try {
      const { data, error } = await createAdminClient()
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data?.length ? data : FALLBACK_TESTIMONIALS;
    } catch (err) {
      console.error("Could not read testimonials:", err?.message || err);
      return FALLBACK_TESTIMONIALS;
    }
  },
  ["site-testimonials"],
  { revalidate: 300, tags: [CONTENT_TAG] },
);

export const getFaqs = unstable_cache(
  async () => {
    try {
      const { data, error } = await createAdminClient()
        .from("faqs")
        .select("id, question, answer")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data?.length ? data : FALLBACK_FAQS;
    } catch (err) {
      console.error("Could not read faqs:", err?.message || err);
      return FALLBACK_FAQS;
    }
  },
  ["site-faqs"],
  { revalidate: 300, tags: [CONTENT_TAG] },
);
