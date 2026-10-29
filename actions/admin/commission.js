"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanRules } from "@/lib/commission";
import { monthlyShare } from "@/lib/planRules";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const sum = (rows, key = "points") => rows.reduce((t, r) => t + Number(r[key]), 0);
const paise = (n) => Math.round(Number(n) * 100) / 100;

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
}

// Partners who can sell: activated and not switched off.
export async function getSellerOptions() {
  await requireAdmin();
  const { data } = await createAdminClient()
    .from("profiles")
    .select("id, full_name, email, referral_code, avatar_url")
    .not("activated_at", "is", null)
    .eq("is_active", true)
    .order("full_name", { ascending: true });
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.full_name || p.email,
    code: p.referral_code || "",
    avatarUrl: p.avatar_url || "",
  }));
}

// Checks the sale form. Returns { error } or { value } with clean numbers.
function readSale(input) {
  const sellerId = String(input?.sellerId ?? "");
  const title = String(input?.title ?? "").trim().slice(0, 200);
  const customer = String(input?.customer ?? "").trim().slice(0, 150);
  const note = String(input?.note ?? "").trim().slice(0, 300);
  const area = Number(input?.area);
  const value = Math.round(Number(input?.value));
  const date = String(input?.date ?? "");

  if (!UUID.test(sellerId)) return { error: "Choose who made the sale." };
  if (!title) return { error: "Enter the property." };
  if (!Number.isFinite(area) || area <= 0 || area > 1_000_000) return { error: "Enter the area in sq. yards." };
  if (!Number.isFinite(value) || value <= 0 || value > 1_000_000_000_000) return { error: "Enter the sale value in rupees." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Choose the sale date." };

  return { value: { sellerId, title, customer, note, area: Math.round(area * 100) / 100, value, date } };
}

// Who would earn what for this sale, without saving anything: the sales bonus (added on the
// closing date) and the monthly bonus (instalments).
export async function previewSale(input) {
  await requireAdmin();
  const read = readSale(input);
  if (read.error) return { success: false, error: read.error };
  const s = read.value;
  const db = createAdminClient();
  const rules = await getPlanRules();

  const [bonus, monthly, closing, first, last] = await Promise.all([
    db.rpc("sale_breakdown", { p_seller: s.sellerId, p_value: s.value }),
    db.rpc("monthly_breakdown", { p_seller: s.sellerId, p_value: s.value }),
    db.rpc("closing_at", { p_date: s.date }),
    db.rpc("monthly_at", { p_date: s.date, k: 1 }),
    db.rpc("monthly_at", { p_date: s.date, k: rules.months }),
  ]);
  if (bonus.error || monthly.error) return { success: false, error: "Could not work out the commission." };

  const ids = [...new Set([...bonus.data.map((r) => r.o_partner), ...monthly.data.map((r) => r.o_partner)])];
  const { data: people } = await db.from("profiles").select("id, full_name, email").in("id", ids);
  const nameOf = Object.fromEntries((people ?? []).map((p) => [p.id, p.full_name || p.email]));

  const rows = bonus.data
    .filter((r) => Number(r.o_points) !== 0)
    .map((r) => ({
      partnerId: r.o_partner,
      name: nameOf[r.o_partner] ?? "Partner",
      kind: r.o_kind,
      rate: Number(r.o_rate),
      level: r.o_level,
      points: Number(r.o_points),
    }));

  const monthlyRows = monthly.data.map((r) => {
    const share = monthlyShare(s.value, Number(r.o_pct), rules.months);
    return {
      partnerId: r.o_partner,
      name: nameOf[r.o_partner] ?? "Partner",
      kind: r.o_kind,
      level: r.o_level,
      rate: Number(r.o_pct),
      total: Number(r.o_total),
      each: share.each,
    };
  });

  return {
    success: true,
    rows,
    total: paise(sum(rows)),
    monthly: monthlyRows,
    monthlyTotal: paise(sum(monthlyRows, "total")),
    months: rules.months,
    levels: rules.levels,
    closesAt: closing.data ?? null,
    firstMonthly: first.data ?? null,
    lastMonthly: last.data ?? null,
  };
}

export async function recordSale(input) {
  await requireAdmin();
  const read = readSale(input);
  if (read.error) return { success: false, error: read.error };
  const s = read.value;

  const { error } = await createAdminClient().rpc("record_sale", {
    p_seller: s.sellerId,
    p_title: s.title,
    p_customer: s.customer,
    p_area: s.area,
    p_value: s.value,
    p_date: s.date,
    p_note: s.note,
  });
  if (error) {
    console.error("recordSale:", error.message);
    return { success: false, error: error.message.includes("not an active partner") ? "That partner is not active." : "Could not save the sale." };
  }
  refresh();
  return { success: true };
}

export async function cancelSale(id) {
  await requireAdmin();
  if (!UUID.test(String(id))) return { success: false, error: "Sale not found." };
  const { error } = await createAdminClient().rpc("cancel_sale", { p_sale: id });
  if (error) return { success: false, error: "Could not cancel this sale." };
  refresh();
  return { success: true };
}

// Latest sales with the points they paid out: straight away (sales bonus) and as monthly instalments.
export async function getSales() {
  await requireAdmin();
  const db = createAdminClient();
  const { data: sales } = await db
    .from("sales")
    .select("id, seller_id, property_title, customer_name, area_sq_yards, sale_value, sale_date, status, seller_rank, seller_rate, note, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (!sales?.length) return [];

  const { data: pts } = await db.rpc("sales_points");
  const given = Object.fromEntries((pts ?? []).map((r) => [r.o_sale, r]));

  const { data: people } = await db
    .from("profiles")
    .select("id, full_name, email, referral_code, avatar_url")
    .in("id", [...new Set(sales.map((s) => s.seller_id))]);
  const who = Object.fromEntries((people ?? []).map((p) => [p.id, p]));

  return sales.map((s) => ({
    id: s.id,
    sellerId: s.seller_id,
    sellerAvatar: who[s.seller_id]?.avatar_url || "",
    sellerName: who[s.seller_id]?.full_name || who[s.seller_id]?.email || "Partner",
    sellerCode: who[s.seller_id]?.referral_code || "",
    title: s.property_title,
    customer: s.customer_name || "",
    area: Number(s.area_sq_yards),
    value: Number(s.sale_value),
    date: s.sale_date,
    status: s.status,
    rate: Number(s.seller_rate),
    commission: Number(given[s.id]?.o_now ?? 0),
    monthly: Number(given[s.id]?.o_monthly ?? 0),
    note: s.note || "",
  }));
}

/* ───────────────────────────── points and payouts ───────────────────────────── */

// Every activated partner with their points, plus rewards still to hand over, the latest
// payouts and the pool bonuses already shared.
export async function getPayoutsOverview() {
  await requireAdmin();
  const db = createAdminClient();

  const [{ data: partners }, { data: pts }, { data: payouts }, { data: history }, { data: plan }, { data: runs }] = await Promise.all([
    db.from("profiles").select("id, full_name, email, referral_code, is_active, activated_at, avatar_url, bank_holder, bank_name, bank_branch, bank_ifsc, bank_account_last4, upi_id").not("activated_at", "is", null),
    db.rpc("points_overview"),
    db.from("payouts").select("id, partner_id, points, note, paid_at").order("paid_at", { ascending: false }).limit(500),
    db.from("rank_history").select("partner_id, rank_no, achieved_at, reward_given_at"),
    db.from("rank_plan").select("rank_no, title, reward, reward_value"),
    db.from("bonus_runs").select("id, kind, period_from, period_to, turnover, pct, pool, partners, per_partner, paid_total, created_at").order("created_at", { ascending: false }).limit(30),
  ]);
  const rules = await getPlanRules();

  const point = Object.fromEntries((pts ?? []).map((r) => [r.o_partner, r]));
  const topRank = {};
  for (const h of history ?? []) topRank[h.partner_id] = Math.max(topRank[h.partner_id] ?? 1, h.rank_no);
  const rankTitle = Object.fromEntries((plan ?? []).map((r) => [r.rank_no, r]));
  const person = Object.fromEntries((partners ?? []).map((p) => [p.id, p]));

  const rows = (partners ?? [])
    .map((p) => {
      const earned = Number(point[p.id]?.o_earned ?? 0);
      const paid = Number(point[p.id]?.o_paid ?? 0);
      return {
        id: p.id,
        name: p.full_name || p.email,
        code: p.referral_code || "",
        avatarUrl: p.avatar_url || "",
        active: p.is_active !== false,
        rank: rankTitle[topRank[p.id] ?? 1]?.title ?? "",
        earned,
        pending: Number(point[p.id]?.o_pending ?? 0),
        // where to pay (the full account number is only shown when the admin asks)
        bank: {
          added: !!p.bank_account_last4,
          holder: p.bank_holder || "",
          name: p.bank_name || "",
          branch: p.bank_branch || "",
          ifsc: p.bank_ifsc || "",
          last4: p.bank_account_last4 || "",
          upi: p.upi_id || "",
        },
        paid,
        balance: paise(earned - paid),
      };
    })
    .sort((a, b) => b.balance - a.balance || a.name.localeCompare(b.name));

  // Rewards still to hand over, with the 50:50 condition worked out for each.
  const waiting = (history ?? []).filter((h) => !h.reward_given_at && person[h.partner_id]);
  const status = {};
  await Promise.all(
    [...new Set(waiting.map((h) => h.partner_id))].map(async (id) => {
      const { data } = await db.rpc("reward_status", { p: id });
      status[id] = Object.fromEntries((data ?? []).map((r) => [r.o_rank, r]));
    }),
  );
  const rewards = waiting
    .map((h) => {
      const st = status[h.partner_id]?.[h.rank_no];
      return {
        partnerId: h.partner_id,
        rankNo: h.rank_no,
        name: person[h.partner_id].full_name || person[h.partner_id].email,
        avatarUrl: person[h.partner_id].avatar_url || "",
        code: person[h.partner_id].referral_code || "",
        rank: rankTitle[h.rank_no]?.title ?? "",
        reward: rankTitle[h.rank_no]?.reward ?? "",
        value: Number(rankTitle[h.rank_no]?.reward_value ?? 0),
        at: h.achieved_at,
        // 50:50: is the strongest leg only half of it? (need = the sq. yards of the rank, counted = what counts)
        ready: st ? !!st.o_ok : true,
        need: st ? Number(st.o_need) : 0,
        counted: st ? Number(st.o_counted) : 0,
      };
    })
    .sort((a, b) => Number(b.ready) - Number(a.ready) || new Date(b.at) - new Date(a.at));

  const recent = (payouts ?? []).slice(0, 30).map((p) => ({
    id: p.id,
    partnerId: p.partner_id,
    avatarUrl: person[p.partner_id]?.avatar_url || "",
    name: person[p.partner_id]?.full_name || person[p.partner_id]?.email || "Partner",
    points: Number(p.points),
    note: p.note || "",
    at: p.paid_at,
  }));

  return {
    rows,
    rewards,
    recent,
    runs: (runs ?? []).map((r) => ({
      id: r.id,
      kind: r.kind,
      from: r.period_from,
      to: r.period_to,
      turnover: Number(r.turnover),
      pct: Number(r.pct),
      pool: Number(r.pool),
      partners: r.partners,
      per: Number(r.per_partner),
      total: Number(r.paid_total),
      at: r.created_at,
    })),
    auto: { on: rules.poolAuto === 1, day: rules.poolDay },
    totals: {
      owed: paise(rows.reduce((t, r) => t + Math.max(0, r.balance), 0)),
      paid: paise(sum(rows, "paid")),
      earned: paise(sum(rows, "earned")),
      pending: paise(sum(rows, "pending")),
    },
  };
}

async function balanceOf(db, partnerId) {
  const { data } = await db.rpc("points_summary", { p: partnerId });
  const t = data?.[0] ?? {};
  return paise(Number(t.o_earned ?? 0) - Number(t.o_paid ?? 0));
}

// The admin has paid this partner (UPI, bank, cash...). The points leave their balance.
export async function recordPayout({ partnerId, points, note }) {
  await requireAdmin();
  if (!UUID.test(String(partnerId))) return { success: false, error: "Partner not found." };
  const amount = paise(points);
  if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: "Enter the points paid." };

  const db = createAdminClient();
  const balance = await balanceOf(db, partnerId);
  if (amount > balance) return { success: false, error: `This partner only has ${balance.toLocaleString("en-IN")} points.` };

  const { error } = await db.from("payouts").insert({
    partner_id: partnerId,
    points: amount,
    note: String(note ?? "").trim().slice(0, 200) || null,
  });
  if (error) return { success: false, error: "Could not save the payout." };
  refresh();
  return { success: true };
}

// A bonus or correction the admin adds by hand (a one-off C.T.O. bonus, or a fix).
export async function addPoints({ partnerId, kind, points, note }) {
  await requireAdmin();
  if (!UUID.test(String(partnerId))) return { success: false, error: "Partner not found." };
  if (!["cto", "adjustment"].includes(kind)) return { success: false, error: "Choose the type." };
  const amount = paise(points);
  if (!Number.isFinite(amount) || amount === 0) return { success: false, error: "Enter the points." };
  if (kind === "cto" && amount < 0) return { success: false, error: "A bonus cannot be negative. Use Adjustment." };
  const text = String(note ?? "").trim().slice(0, 200);
  if (!text) return { success: false, error: "Add a short note so it is clear later." };

  const { error } = await createAdminClient().from("commission_entries").insert({
    partner_id: partnerId,
    kind,
    points: amount,
    note: text,
  });
  if (error) return { success: false, error: "Could not save." };
  refresh();
  return { success: true };
}

export async function markRewardGiven(partnerId, rankNo) {
  await requireAdmin();
  if (!UUID.test(String(partnerId)) || !Number.isInteger(rankNo)) return { success: false, error: "Not found." };
  const { error } = await createAdminClient()
    .from("rank_history")
    .update({ reward_given_at: new Date().toISOString() })
    .eq("partner_id", partnerId)
    .eq("rank_no", rankNo);
  if (error) return { success: false, error: "Could not update." };
  refresh();
  return { success: true };
}

/* ───────────────── partnership bonus and C.T.O. bonus (shared once a month) ───────────────── */

// "2026-10" -> { from: "2026-10-01", to: "2026-10-31" }
function monthRange(month) {
  const m = /^(\d{4})-(\d{2})$/.exec(String(month ?? ""));
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  if (mo < 1 || mo > 12 || y < 2020 || y > 2100) return null;
  const last = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  return { from: `${m[1]}-${m[2]}-01`, to: `${m[1]}-${m[2]}-${String(last).padStart(2, "0")}` };
}

// What would be shared for this month, without saving anything.
export async function previewBonusRun({ kind, month }) {
  await requireAdmin();
  if (!["partnership", "cto"].includes(kind)) return { success: false, error: "Choose the bonus." };
  const range = monthRange(month);
  if (!range) return { success: false, error: "Choose the month." };
  const db = createAdminClient();

  const [pool, shares, taken] = await Promise.all([
    db.rpc("bonus_pool", { p_kind: kind, p_from: range.from, p_to: range.to }),
    db.rpc("bonus_shares", { p_kind: kind, p_from: range.from, p_to: range.to }),
    db.from("bonus_runs").select("id").eq("kind", kind).lte("period_from", range.to).gte("period_to", range.from).limit(1),
  ]);
  if (pool.error || shares.error) return { success: false, error: "Could not work it out." };

  const p = pool.data?.[0] ?? {};
  const list = shares.data ?? [];
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return {
    success: true,
    from: range.from,
    to: range.to,
    turnover: Number(p.o_turnover ?? 0),
    pct: Number(p.o_pct ?? 0),
    pool: Number(p.o_pool ?? 0),
    partners: Number(p.o_partners ?? 0),
    per: Number(p.o_per ?? 0),
    total: paise(list.reduce((t, r) => t + Number(r.o_share), 0)),
    capped: list.filter((r) => r.o_capped).length,
    already: (taken.data?.length ?? 0) > 0,
    finished: range.to < today,
  };
}

// Shares it. A finished month can be shared once.
export async function runBonusRun({ kind, month }) {
  await requireAdmin();
  if (!["partnership", "cto"].includes(kind)) return { success: false, error: "Choose the bonus." };
  const range = monthRange(month);
  if (!range) return { success: false, error: "Choose the month." };

  const { error } = await createAdminClient().rpc("run_bonus", { p_kind: kind, p_from: range.from, p_to: range.to });
  if (error) {
    const known = ["This period was already shared.", "That period is not over yet.", "There is nothing to share for this period."];
    const text = known.find((k) => error.message.includes(k));
    if (!text) console.error("runBonus:", error.message);
    return { success: false, error: text ?? "Could not share the bonus." };
  }
  refresh();
  return { success: true };
}
