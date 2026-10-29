import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { RULE_KEYS, nextLevelHint, readRules } from "@/lib/planRules";

// The rules the admin set (percentages, levels, closing dates...), with the defaults filled in.
export const getPlanRules = cache(async () => {
  const { data } = await createAdminClient().from("site_settings").select("key, value").in("key", Object.values(RULE_KEYS));
  return readRules(Object.fromEntries((data ?? []).map((r) => [r.key, r.value])));
});

// The rank ladder (from the database, so the admin plan and the engine agree).
export const getRankPlan = cache(async () => {
  const { data } = await createAdminClient()
    .from("rank_plan")
    .select("rank_no, title, min_area, ps_rate, reward, reward_value, icon, image_url")
    .order("rank_no", { ascending: true });
  return (data ?? []).map((r) => ({
    no: r.rank_no,
    title: r.title,
    minArea: Number(r.min_area),
    rate: Number(r.ps_rate),
    reward: r.reward,
    rewardValue: Number(r.reward_value) || 0,
    icon: r.icon || "Gift",
    image: r.image_url || "",
  }));
});

const sum = (rows) => rows.reduce((t, r) => t + Number(r.points), 0);

// Everything the partner's Commission page shows. Call it only with the
// logged-in partner's own id: it uses the service role.
export const getPartnerCommission = cache(async (partnerId) => {
  const db = createAdminClient();
  const [plan, rules] = await Promise.all([getRankPlan(), getPlanRules()]);

  const [entriesRes, sumRes, kindRes, comingRes, payoutsRes, rankRes, salesRes, areaRes, levelRes, rewardRes] = await Promise.all([
    // the points that have been added (the date has come); pending ones are in `coming`
    db
      .from("commission_entries")
      .select("id, kind, points, rate, note, available_at, from_partner_id, sale_id, month_no, rank_no, level")
      .eq("partner_id", partnerId)
      .lte("available_at", new Date().toISOString())
      .order("available_at", { ascending: false })
      .limit(600),
    db.rpc("points_summary", { p: partnerId }),
    db.rpc("points_by_kind", { p: partnerId }),
    db.rpc("points_coming", { p: partnerId }),
    db
      .from("payouts")
      .select("id, points, note, paid_at")
      .eq("partner_id", partnerId)
      .order("paid_at", { ascending: false })
      .limit(200),
    db
      .from("rank_history")
      .select("rank_no, achieved_at, reward_given_at")
      .eq("partner_id", partnerId)
      .order("rank_no", { ascending: true }),
    db
      .from("sales")
      .select("id, property_title, customer_name, area_sq_yards, sale_value, sale_date, status")
      .eq("seller_id", partnerId)
      .order("sale_date", { ascending: false })
      .limit(100),
    db.rpc("team_area", { p: partnerId }),
    db.rpc("level_status", { p: partnerId }),
    db.rpc("reward_status", { p: partnerId }),
  ]);

  const entries = entriesRes.data ?? [];
  const payouts = payoutsRes.data ?? [];
  const history = rankRes.data ?? [];
  const totals = sumRes.data?.[0] ?? {};
  const byKind = Object.fromEntries((kindRes.data ?? []).map((r) => [r.o_kind, Number(r.o_total)]));
  const reward50 = Object.fromEntries((rewardRes.data ?? []).map((r) => [r.o_rank, r]));
  const lv = levelRes.data?.[0] ?? {};

  // Names of the partners whose sales earned the team commission (name only).
  const fromIds = [...new Set(entries.map((e) => e.from_partner_id).filter(Boolean))];
  const names = {};
  if (fromIds.length) {
    const { data } = await db.from("profiles").select("id, full_name, referral_code").in("id", fromIds);
    for (const p of data ?? []) names[p.id] = p.full_name || p.referral_code || "Partner";
  }

  const earned = Number(totals.o_earned ?? 0);
  const paid = Number(totals.o_paid ?? sum(payouts));
  const pending = Number(totals.o_pending ?? 0);

  const reachedNo = history.length ? Math.max(...history.map((h) => h.rank_no)) : 1;
  const rank = plan.find((r) => r.no === reachedNo) ?? plan[0] ?? null;
  const next = plan.find((r) => r.no === reachedNo + 1) ?? null;
  const teamArea = Number(areaRes.data ?? 0);

  let progress = 100;
  if (next && rank) {
    const span = next.minArea - rank.minArea;
    progress = span > 0 ? Math.max(0, Math.min(100, ((teamArea - rank.minArea) / span) * 100)) : 0;
  }

  const current = history.find((h) => h.rank_no === reachedNo);

  // The levels of the team that pay this partner a monthly bonus.
  const selfArea = Number(lv.self_area ?? 0);
  const directs = Number(lv.directs ?? 0);
  const hint = nextLevelHint(rules, selfArea, directs);

  // The partnership bonus stops at a multiple of the activation fee.
  const feeRow = await db.from("site_settings").select("value").eq("key", "pay_amount").maybeSingle();
  const fee = Math.round(Number(String(feeRow.data?.value ?? "").replace(/[^0-9.]/g, ""))) || 10000;
  const partnershipGot = byKind.partnership ?? 0;
  const partnershipCap = rules.capX > 0 ? rules.capX * fee : 0;

  return {
    earned,
    paid,
    pending,
    balance: earned - paid,
    nextAt: totals.o_next ?? null,
    byKind,
    coming: (comingRes.data ?? []).map((r) => ({ at: r.o_due, kind: r.o_kind, total: Number(r.o_total), parts: Number(r.o_parts) })),
    rank,
    next,
    teamArea,
    areaToNext: next ? Math.max(0, next.minArea - teamArea) : 0,
    progress,
    rankSince: current?.achieved_at ?? null,
    plan,
    rules,
    levels: { open: hint.open, max: rules.levels, selfArea, directs, hint },
    partnership: { got: partnershipGot, cap: partnershipCap },
    fee,
    rewards: history.map((h) => {
      const r = plan.find((x) => x.no === h.rank_no);
      const status = reward50[h.rank_no];
      return {
        no: h.rank_no,
        title: r?.title ?? `Rank ${h.rank_no}`,
        reward: r?.reward ?? "",
        value: r?.rewardValue ?? 0,
        icon: r?.icon ?? "Gift",
        image: r?.image ?? "",
        achievedAt: h.achieved_at,
        given: !!h.reward_given_at,
        givenAt: h.reward_given_at,
        // the 50:50 condition: what counts toward the reward, and what it needs
        ready: status ? !!status.o_ok : true,
        need: status ? Number(status.o_need) : 0,
        counted: status ? Number(status.o_counted) : 0,
        // the same, leg by leg (null until supabase/026_reward_legs.sql is applied)
        legs:
          status && status.o_power != null
            ? {
                power: Number(status.o_power),
                powerCap: Number(status.o_power_cap),
                other: Number(status.o_other),
                otherNeed: Number(status.o_other_need),
              }
            : null,
      };
    }),
    ledger: entries.map((e) => ({
      id: e.id,
      kind: e.kind,
      points: Number(e.points),
      rate: e.rate === null ? null : Number(e.rate),
      level: e.level ?? null,
      note: e.note || "",
      at: e.available_at,
      from: e.from_partner_id ? (names[e.from_partner_id] ?? "Partner") : "",
    })),
    payouts: payouts.map((p) => ({ id: p.id, points: Number(p.points), note: p.note || "", at: p.paid_at })),
    sales: (salesRes.data ?? []).map((s) => ({
      id: s.id,
      title: s.property_title,
      customer: s.customer_name || "",
      area: Number(s.area_sq_yards),
      value: Number(s.sale_value),
      date: s.sale_date,
      status: s.status,
    })),
  };
});

// For every member of a partner's team: their rank, how much they sold themselves
// and how many points the partner earned from their sales. Used by My Network.
// Only these numbers leave the server, never phone, email or Aadhaar.
// Call it only with the logged-in partner's own id and their own downline ids.
export async function getTeamStats(partnerId, memberIds) {
  const ids = [...new Set(memberIds)];
  if (!ids.length) return {};
  const db = createAdminClient();
  const plan = await getRankPlan();
  const titleOf = Object.fromEntries(plan.map((r) => [r.no, r.title]));

  // Long id lists go in small batches so the request stays short.
  const chunks = [];
  for (let i = 0; i < ids.length; i += 80) chunks.push(ids.slice(i, i + 80));

  const [hist, sales, earned] = await Promise.all([
    Promise.all(chunks.map((c) => db.from("rank_history").select("partner_id, rank_no").in("partner_id", c))),
    Promise.all(
      chunks.map((c) =>
        db.from("sales").select("seller_id, area_sq_yards").eq("status", "confirmed").in("seller_id", c),
      ),
    ),
    db.rpc("team_earnings", { p: partnerId }),
  ]);

  const out = Object.fromEntries(ids.map((id) => [id, { rankNo: 1, rankTitle: titleOf[1] ?? "", soldArea: 0, earned: 0 }]));
  for (const { data } of hist) {
    for (const r of data ?? []) {
      if (out[r.partner_id] && r.rank_no > out[r.partner_id].rankNo) {
        out[r.partner_id].rankNo = r.rank_no;
        out[r.partner_id].rankTitle = titleOf[r.rank_no] ?? "";
      }
    }
  }
  for (const { data } of sales) {
    for (const s of data ?? []) if (out[s.seller_id]) out[s.seller_id].soldArea += Number(s.area_sq_yards);
  }
  for (const e of earned.data ?? []) {
    if (out[e.o_from]) out[e.o_from].earned += Number(e.o_total);
  }
  return out;
}
