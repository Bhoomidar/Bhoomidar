"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONTENT_TAG } from "@/lib/content";
import { REWARD_ICON_NAMES } from "@/lib/rankIcons";

function refreshSite() {
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

const clean = (v, max) => String(v ?? "").trim().slice(0, max);

// Everything the Commission Plan page shows: the ranks, the rules and how many partners are on each rank.
export async function getPlanAdmin() {
  await requireAdmin();
  const db = createAdminClient();
  const [ranksRes, setRes, histRes, codeRes] = await Promise.all([
    db
      .from("rank_plan")
      .select("rank_no, title, min_area, ps_rate, monthly_bonus, reward, icon, team_example")
      .order("rank_no", { ascending: true }),
    db
      .from("site_settings")
      .select("key, value")
      .in("key", ["plan_monthly_months", "ref_prefix_mode", "ref_prefix", "ref_digits"]),
    db.from("rank_history").select("partner_id, rank_no"),
    db.from("profiles").select("referral_code").not("referral_code", "is", null).limit(2000),
  ]);

  // Each partner counts once, on the highest rank they have reached.
  const top = new Map();
  for (const h of histRes.data ?? []) top.set(h.partner_id, Math.max(top.get(h.partner_id) ?? 0, h.rank_no));
  const onRank = {};
  for (const n of top.values()) onRank[n] = (onRank[n] ?? 0) + 1;

  const s = Object.fromEntries((setRes.data ?? []).map((r) => [r.key, r.value]));
  const prefixes = {};
  for (const p of codeRes.data ?? []) {
    const k = String(p.referral_code).split("-")[0];
    prefixes[k] = (prefixes[k] ?? 0) + 1;
  }

  return {
    ranks: (ranksRes.data ?? []).map((r) => ({
      rank_no: r.rank_no,
      title: r.title,
      min_area: String(Number(r.min_area)),
      ps_rate: String(Number(r.ps_rate)),
      monthly_bonus: String(r.monthly_bonus),
      reward: r.reward,
      icon: r.icon || "Gift",
      team_example: r.team_example || "",
      partners: onRank[r.rank_no] ?? 0,
    })),
    rules: {
      months: s.plan_monthly_months || "12",
      mode: s.ref_prefix_mode === "fixed" ? "fixed" : "state",
      prefix: (s.ref_prefix || "BH").toUpperCase(),
      digits: s.ref_digits || "4",
    },
    prefixes,
    partnerCount: top.size,
  };
}

// rows: the whole rank table, in order. Rank 1 is the first row, and so on.
export async function saveRankPlan(rows) {
  await requireAdmin();
  const list = Array.isArray(rows) ? rows : [];
  if (list.length < 1) return { success: false, error: "There must be at least one rank." };
  if (list.length > 20) return { success: false, error: "Twenty ranks is the most." };

  const out = [];
  for (let i = 0; i < list.length; i++) {
    const r = list[i] ?? {};
    const no = i + 1;
    const title = clean(r.title, 60);
    const reward = clean(r.reward, 60);
    const min = Number(String(r.min_area ?? "").replace(/,/g, ""));
    const rate = Number(String(r.ps_rate ?? "").replace(/[%\s]/g, ""));
    const bonus = Math.round(Number(String(r.monthly_bonus ?? "").replace(/[,\s]/g, "")));
    if (!title) return { success: false, error: `Rank ${no}: write the name.` };
    if (!Number.isFinite(min) || min < 0 || min > 100000000) return { success: false, error: `Rank ${no}: the sq. yards must be a number.` };
    if (!Number.isFinite(rate) || rate <= 0 || rate > 50) return { success: false, error: `Rank ${no}: the commission % must be between 0 and 50.` };
    if (!Number.isFinite(bonus) || bonus < 0 || bonus > 100000000) return { success: false, error: `Rank ${no}: the monthly bonus must be a number.` };
    if (i === 0 && min !== 0) return { success: false, error: "Rank 1 must start at 0 sq. yards." };
    if (i > 0 && min <= out[i - 1].min_area) return { success: false, error: `Rank ${no}: the sq. yards must be more than rank ${no - 1} (${out[i - 1].min_area}).` };
    if (i > 0 && rate < out[i - 1].ps_rate) return { success: false, error: `Rank ${no}: the commission cannot be lower than rank ${no - 1}.` };
    out.push({
      rank_no: no,
      title,
      min_area: min,
      ps_rate: Math.round(rate * 1000) / 1000,
      monthly_bonus: bonus,
      reward,
      icon: REWARD_ICON_NAMES.includes(r.icon) ? r.icon : "Gift",
      team_example: clean(r.team_example, 80),
    });
  }

  const db = createAdminClient();

  // A rank that partners have already reached cannot be taken away.
  const { data: used } = await db.from("rank_history").select("rank_no").gt("rank_no", out.length).limit(1);
  if (used?.length) {
    return { success: false, error: "Partners have already reached the rank you removed. Keep it, or change its details instead." };
  }

  const { error } = await db.from("rank_plan").upsert(out, { onConflict: "rank_no" });
  if (error) {
    console.error("saveRankPlan:", error.message);
    return { success: false, error: "Could not save the plan." };
  }
  const { error: delError } = await db.from("rank_plan").delete().gt("rank_no", out.length);
  if (delError) {
    console.error("saveRankPlan delete:", delError.message);
    return { success: false, error: "Saved, but a removed rank could not be deleted." };
  }

  refreshSite();
  revalidatePath("/admin", "layout");
  return { success: true };
}

// The monthly bonus length and the referral code pattern.
export async function saveRules(input) {
  await requireAdmin();
  const months = Math.round(Number(input?.months));
  const mode = input?.mode === "fixed" ? "fixed" : "state";
  const prefix = clean(input?.prefix, 10).toUpperCase();
  const digits = Math.round(Number(input?.digits));

  if (!Number.isFinite(months) || months < 1 || months > 60) {
    return { success: false, error: "The monthly bonus can run for 1 to 60 months." };
  }
  if (!/^[A-Z]{2,5}$/.test(prefix)) {
    return { success: false, error: "The referral code letters must be 2 to 5 capital letters, for example BH." };
  }
  if (!Number.isFinite(digits) || digits < 4 || digits > 8) {
    return { success: false, error: "The referral code needs 4 to 8 digits." };
  }

  const now = new Date().toISOString();
  const rows = [
    { key: "plan_monthly_months", value: String(months) },
    { key: "ref_prefix_mode", value: mode },
    { key: "ref_prefix", value: prefix },
    { key: "ref_digits", value: String(digits) },
  ].map((r) => ({ ...r, updated_at: now }));

  const { error } = await createAdminClient().from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) {
    console.error("saveRules:", error.message);
    return { success: false, error: "Could not save. Please try again." };
  }
  refreshSite();
  return { success: true };
}

// After the sq. yards of a rank were changed: give every active partner the ranks they now qualify for.
// Ranks are only ever added, never taken away.
export async function recheckRanks() {
  await requireAdmin();
  const db = createAdminClient();
  const { data, error } = await db.from("profiles").select("id").not("activated_at", "is", null);
  if (error) return { success: false, error: "Could not read the partners." };

  const before = await db.from("rank_history").select("partner_id", { count: "exact", head: true });
  const ids = (data ?? []).map((p) => p.id);
  for (let i = 0; i < ids.length; i += 10) {
    await Promise.all(ids.slice(i, i + 10).map((id) => db.rpc("sync_ranks", { p: id })));
  }
  const after = await db.from("rank_history").select("partner_id", { count: "exact", head: true });

  revalidatePath("/admin", "layout");
  return { success: true, checked: ids.length, added: Math.max(0, (after.count ?? 0) - (before.count ?? 0)) };
}
