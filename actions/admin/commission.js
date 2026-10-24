"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const sum = (rows, key = "points") => rows.reduce((t, r) => t + Number(r[key]), 0);

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
}

// Partners who can sell: activated and not switched off.
export async function getSellerOptions() {
  await requireAdmin();
  const { data } = await createAdminClient()
    .from("profiles")
    .select("id, full_name, email, referral_code")
    .not("activated_at", "is", null)
    .eq("is_active", true)
    .order("full_name", { ascending: true });
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.full_name || p.email,
    code: p.referral_code || "",
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

// Who would earn what for this sale, without saving anything.
export async function previewSale(input) {
  await requireAdmin();
  const read = readSale(input);
  if (read.error) return { success: false, error: read.error };
  const s = read.value;
  const db = createAdminClient();

  const { data, error } = await db.rpc("sale_breakdown", { p_seller: s.sellerId, p_value: s.value });
  if (error) return { success: false, error: "Could not work out the commission." };

  const ids = data.map((r) => r.o_partner);
  const { data: people } = await db.from("profiles").select("id, full_name, email").in("id", ids);
  const nameOf = Object.fromEntries((people ?? []).map((p) => [p.id, p.full_name || p.email]));

  const rows = data
    .filter((r) => Number(r.o_points) !== 0)
    .map((r) => ({
      partnerId: r.o_partner,
      name: nameOf[r.o_partner] ?? "Partner",
      kind: r.o_kind,
      rate: Number(r.o_rate),
      level: r.o_level,
      points: Number(r.o_points),
    }));

  return { success: true, rows, total: sum(rows) };
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

// Latest sales with the points they paid out in total.
export async function getSales() {
  await requireAdmin();
  const db = createAdminClient();
  const { data: sales } = await db
    .from("sales")
    .select("id, seller_id, property_title, customer_name, area_sq_yards, sale_value, sale_date, status, seller_rank, seller_rate, note, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (!sales?.length) return [];

  const { data: entries } = await db
    .from("commission_entries")
    .select("sale_id, points")
    .in("sale_id", sales.map((s) => s.id))
    .in("kind", ["sale", "team"]);
  const paidOut = {};
  for (const e of entries ?? []) paidOut[e.sale_id] = (paidOut[e.sale_id] ?? 0) + Number(e.points);

  const { data: people } = await db
    .from("profiles")
    .select("id, full_name, email, referral_code")
    .in("id", [...new Set(sales.map((s) => s.seller_id))]);
  const who = Object.fromEntries((people ?? []).map((p) => [p.id, p]));

  return sales.map((s) => ({
    id: s.id,
    sellerName: who[s.seller_id]?.full_name || who[s.seller_id]?.email || "Partner",
    sellerCode: who[s.seller_id]?.referral_code || "",
    title: s.property_title,
    customer: s.customer_name || "",
    area: Number(s.area_sq_yards),
    value: Number(s.sale_value),
    date: s.sale_date,
    status: s.status,
    rate: Number(s.seller_rate),
    commission: paidOut[s.id] ?? 0,
    note: s.note || "",
  }));
}

/* ───────────────────────────── points and payouts ───────────────────────────── */

// Every activated partner with their points, plus rewards still to hand over and
// the latest payouts.
export async function getPayoutsOverview() {
  await requireAdmin();
  const db = createAdminClient();

  const [{ data: partners }, { data: entries }, { data: payouts }, { data: history }, { data: plan }] = await Promise.all([
    db.from("profiles").select("id, full_name, email, referral_code, is_active, activated_at").not("activated_at", "is", null),
    db.from("commission_entries").select("partner_id, points"),
    db.from("payouts").select("id, partner_id, points, note, paid_at").order("paid_at", { ascending: false }),
    db.from("rank_history").select("partner_id, rank_no, achieved_at, reward_given_at"),
    db.from("rank_plan").select("rank_no, title, reward"),
  ]);

  const earned = {};
  for (const e of entries ?? []) earned[e.partner_id] = (earned[e.partner_id] ?? 0) + Number(e.points);
  const paid = {};
  for (const p of payouts ?? []) paid[p.partner_id] = (paid[p.partner_id] ?? 0) + Number(p.points);
  const topRank = {};
  for (const h of history ?? []) topRank[h.partner_id] = Math.max(topRank[h.partner_id] ?? 1, h.rank_no);
  const rankTitle = Object.fromEntries((plan ?? []).map((r) => [r.rank_no, r]));
  const person = Object.fromEntries((partners ?? []).map((p) => [p.id, p]));

  const rows = (partners ?? [])
    .map((p) => ({
      id: p.id,
      name: p.full_name || p.email,
      code: p.referral_code || "",
      active: p.is_active !== false,
      rank: rankTitle[topRank[p.id] ?? 1]?.title ?? "",
      earned: earned[p.id] ?? 0,
      paid: paid[p.id] ?? 0,
      balance: (earned[p.id] ?? 0) - (paid[p.id] ?? 0),
    }))
    .sort((a, b) => b.balance - a.balance || a.name.localeCompare(b.name));

  const rewards = (history ?? [])
    .filter((h) => !h.reward_given_at && person[h.partner_id])
    .map((h) => ({
      partnerId: h.partner_id,
      rankNo: h.rank_no,
      name: person[h.partner_id].full_name || person[h.partner_id].email,
      code: person[h.partner_id].referral_code || "",
      rank: rankTitle[h.rank_no]?.title ?? "",
      reward: rankTitle[h.rank_no]?.reward ?? "",
      at: h.achieved_at,
    }))
    .sort((a, b) => new Date(b.at) - new Date(a.at));

  const recent = (payouts ?? []).slice(0, 30).map((p) => ({
    id: p.id,
    name: person[p.partner_id]?.full_name || person[p.partner_id]?.email || "Partner",
    points: Number(p.points),
    note: p.note || "",
    at: p.paid_at,
  }));

  return {
    rows,
    rewards,
    recent,
    totals: {
      owed: rows.reduce((t, r) => t + Math.max(0, r.balance), 0),
      paid: sum(payouts ?? []),
      earned: sum(entries ?? []),
    },
  };
}

async function balanceOf(db, partnerId) {
  const [{ data: e }, { data: p }] = await Promise.all([
    db.from("commission_entries").select("points").eq("partner_id", partnerId),
    db.from("payouts").select("points").eq("partner_id", partnerId),
  ]);
  return sum(e ?? []) - sum(p ?? []);
}

// The admin has paid this partner (UPI, bank, cash...). The points leave their balance.
export async function recordPayout({ partnerId, points, note }) {
  await requireAdmin();
  if (!UUID.test(String(partnerId))) return { success: false, error: "Partner not found." };
  const amount = Math.round(Number(points));
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

// A bonus or correction the admin adds by hand (for example the C.T.O. bonus).
export async function addPoints({ partnerId, kind, points, note }) {
  await requireAdmin();
  if (!UUID.test(String(partnerId))) return { success: false, error: "Partner not found." };
  if (!["cto", "adjustment"].includes(kind)) return { success: false, error: "Choose the type." };
  const amount = Math.round(Number(points));
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

// Credits every monthly bonus that has come due. Safe to press again.
export async function creditMonthlyBonuses() {
  await requireAdmin();
  const { data, error } = await createAdminClient().rpc("credit_monthly_bonuses");
  if (error) return { success: false, error: "Could not credit the bonuses." };
  refresh();
  return { success: true, added: Number(data ?? 0) };
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
