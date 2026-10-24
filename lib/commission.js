import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

// The rank ladder (from the database, so the admin plan and the engine agree).
export const getRankPlan = cache(async () => {
  const { data } = await createAdminClient()
    .from("rank_plan")
    .select("rank_no, title, min_area, ps_rate, monthly_bonus, reward")
    .order("rank_no", { ascending: true });
  return (data ?? []).map((r) => ({
    no: r.rank_no,
    title: r.title,
    minArea: Number(r.min_area),
    rate: Number(r.ps_rate),
    monthlyBonus: r.monthly_bonus,
    reward: r.reward,
  }));
});

const sum = (rows) => rows.reduce((t, r) => t + Number(r.points), 0);

// Everything the partner's Commission page shows. Call it only with the
// logged-in partner's own id: it uses the service role.
export const getPartnerCommission = cache(async (partnerId) => {
  const db = createAdminClient();
  const plan = await getRankPlan();

  const [entriesRes, payoutsRes, rankRes, salesRes, areaRes] = await Promise.all([
    db
      .from("commission_entries")
      .select("id, kind, points, rate, note, created_at, from_partner_id, sale_id, month_no, rank_no")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false })
      .limit(1000),
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
  ]);

  const entries = entriesRes.data ?? [];
  const payouts = payoutsRes.data ?? [];
  const history = rankRes.data ?? [];

  // Names of the partners whose sales earned the team commission (name only).
  const fromIds = [...new Set(entries.map((e) => e.from_partner_id).filter(Boolean))];
  const names = {};
  if (fromIds.length) {
    const { data } = await db.from("profiles").select("id, full_name, referral_code").in("id", fromIds);
    for (const p of data ?? []) names[p.id] = p.full_name || p.referral_code || "Partner";
  }

  const earned = sum(entries);
  const paid = sum(payouts);

  const reachedNo = history.length ? Math.max(...history.map((h) => h.rank_no)) : 1;
  const rank = plan.find((r) => r.no === reachedNo) ?? plan[0] ?? null;
  const next = plan.find((r) => r.no === reachedNo + 1) ?? null;
  const teamArea = Number(areaRes.data ?? 0);

  let progress = 100;
  if (next && rank) {
    const span = next.minArea - rank.minArea;
    progress = span > 0 ? Math.max(0, Math.min(100, ((teamArea - rank.minArea) / span) * 100)) : 0;
  }

  // Monthly bonus clock for the current rank.
  const current = history.find((h) => h.rank_no === reachedNo);
  const monthsPaid = entries.filter((e) => e.kind === "monthly" && e.rank_no === reachedNo).length;

  return {
    earned,
    paid,
    balance: earned - paid,
    rank,
    next,
    teamArea,
    areaToNext: next ? Math.max(0, next.minArea - teamArea) : 0,
    progress,
    rankSince: current?.achieved_at ?? null,
    monthsPaid,
    plan,
    rewards: history.map((h) => {
      const r = plan.find((x) => x.no === h.rank_no);
      return {
        no: h.rank_no,
        title: r?.title ?? `Rank ${h.rank_no}`,
        reward: r?.reward ?? "",
        achievedAt: h.achieved_at,
        given: !!h.reward_given_at,
        givenAt: h.reward_given_at,
      };
    }),
    ledger: entries.map((e) => ({
      id: e.id,
      kind: e.kind,
      points: Number(e.points),
      rate: e.rate === null ? null : Number(e.rate),
      note: e.note || "",
      at: e.created_at,
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
    db
      .from("commission_entries")
      .select("from_partner_id, points")
      .eq("partner_id", partnerId)
      .in("kind", ["team", "reversal"])
      .not("from_partner_id", "is", null),
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
    if (out[e.from_partner_id]) out[e.from_partner_id].earned += Number(e.points);
  }
  return out;
}
