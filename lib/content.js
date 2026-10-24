import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULTS } from "@/lib/siteContent";
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

export const getProperties = unstable_cache(
  async () => {
    try {
      const { data, error } = await createAdminClient()
        .from("properties")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data?.length ? data : FALLBACK_PROPERTIES;
    } catch (err) {
      console.error("Could not read properties:", err?.message || err);
      return FALLBACK_PROPERTIES;
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
