import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPayment } from "@/lib/payment";

const COLS =
  "id, full_name, email, phone, role, is_active, created_at, activated_at, activation_amount, credit_amount, credit_paid_at, referral_code";

const monthOf = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).slice(0, 7);
const chunk = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));

// Everyone, a thousand at a time (the database returns at most 1000 rows in one go).
async function allProfiles(db) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("profiles")
      .select(COLS)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + 999);
    if (error) {
      console.error("collections: profiles:", error.message);
      return null;
    }
    out.push(...data);
    if (data.length < 1000) return out;
  }
}

// The joining-fee money, partner by partner: what came in, what was cut from income, what is still to come.
//   paid     the joining amount is fully cleared (paid, or cut from their income, or both)
//   credit   activated on credit and some of it is still owed
//   unpaid   signed up, not activated yet: the whole joining amount is still to come
//   off      signed up, never paid, and switched off by the admin: not counted as money to come
// For each partner: `paid` is money they handed over (cash, UPI, bank), `fromIncome` is the part of a
// credit that their own earnings have covered, `pending` is what is still owed.
export async function getCollections() {
  await requireAdmin();
  const db = createAdminClient();
  const [pay, profiles] = await Promise.all([getPayment(), allProfiles(db)]);
  if (!profiles) return null;

  const fee = pay.amount;
  const people = profiles.filter((p) => p.role !== "admin");
  const credit = people.filter((p) => !!p.activated_at && p.credit_amount != null);

  // For partners on credit: what is still owed (earnings already counted), and what they paid back in cash.
  // These are money figures, so if either cannot be read the page says so instead of showing wrong totals.
  const owed = {};
  const parts = {};
  let failed = false;
  await Promise.all(
    credit
      .filter((p) => !p.credit_paid_at)
      .map(async (p) => {
        const { data, error } = await db.rpc("credit_owed", { p: p.id });
        if (error) {
          console.error("collections: credit_owed:", error.message);
          failed = true;
        }
        owed[p.id] = Number(data ?? 0);
      }),
  );
  await Promise.all(
    chunk(
      credit.map((p) => p.id),
      80,
    ).map(async (ids) => {
      const { data, error } = await db.from("commission_entries").select("partner_id, points").eq("kind", "credit_paid").in("partner_id", ids);
      if (error) {
        console.error("collections: part payments:", error.message);
        failed = true;
      }
      for (const r of data ?? []) parts[r.partner_id] = (parts[r.partner_id] ?? 0) + Number(r.points);
    }),
  );
  if (failed) return null;

  let assumed = 0; // activated before amounts were recorded: counted at the joining amount
  const rows = people.map((p) => {
    let status;
    let paid = 0;
    let fromIncome = 0;
    let pending = 0;
    if (!p.activated_at) {
      status = p.is_active === false ? "off" : "unpaid";
      pending = status === "unpaid" ? fee : 0;
    } else if (p.credit_amount != null) {
      const amount = Number(p.credit_amount);
      const closed = !!p.credit_paid_at;
      const cashLater = Math.min(parts[p.id] ?? 0, amount);
      // Once a credit is closed, activation_amount holds the deposit plus the whole credit.
      const deposit = closed ? Math.max(0, Number(p.activation_amount ?? 0) - amount) : Number(p.activation_amount ?? 0);
      pending = closed ? 0 : (owed[p.id] ?? 0);
      fromIncome = Math.max(0, amount - cashLater - pending);
      paid = deposit + cashLater;
      status = pending > 0 ? "credit" : "paid";
    } else {
      status = "paid";
      if (p.activation_amount == null) assumed += 1;
      paid = Number(p.activation_amount ?? fee);
    }
    return {
      id: p.id,
      name: p.full_name || p.email || "Partner",
      code: p.referral_code || "",
      phone: p.phone || "",
      joinedAt: p.created_at,
      activatedAt: p.activated_at,
      status,
      paid,
      fromIncome,
      pending,
    };
  });

  const sum = (list, key) => list.reduce((t, r) => t + r[key], 0);
  const by = (status) => rows.filter((r) => r.status === status);
  const totals = {
    ids: rows.length,
    paidIds: by("paid").length,
    creditIds: by("credit").length,
    unpaidIds: by("unpaid").length,
    offIds: by("off").length,
    received: sum(rows, "paid"),
    fromIncome: sum(rows, "fromIncome"),
    incomeIds: rows.filter((r) => r.fromIncome > 0).length,
    pending: sum(rows, "pending"),
    creditOwed: sum(by("credit"), "pending"),
    unpaidDue: sum(by("unpaid"), "pending"),
  };

  // Month by month: how many IDs joined, how many were activated, and the money of those activations.
  const months = new Map();
  const month = (key) => {
    if (!months.has(key)) months.set(key, { key, joined: 0, activated: 0, received: 0 });
    return months.get(key);
  };
  for (const r of rows) {
    month(monthOf(r.joinedAt)).joined += 1;
    if (r.activatedAt) {
      const m = month(monthOf(r.activatedAt));
      m.activated += 1;
      m.received += r.paid;
    }
  }

  // How many IDs cleared each amount, cash and income together (the joining amount can change over time).
  const amounts = new Map();
  for (const r of rows) {
    if (r.status === "unpaid" || r.status === "off") continue;
    const total = r.paid + r.fromIncome;
    amounts.set(total, (amounts.get(total) ?? 0) + 1);
  }

  return {
    fee,
    assumed,
    totals,
    rows: rows.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt)),
    months: [...months.values()].sort((a, b) => (a.key < b.key ? 1 : -1)),
    amounts: [...amounts.entries()].map(([amount, count]) => ({ amount, count })).sort((a, b) => b.amount - a.amount),
  };
}
