// Helpers for commission points. Safe to import anywhere (no server code).
// 1 point = Rs 1. Rank rules live in the database (supabase/008_commission.sql and 021_paper_plan.sql).

// 20000 -> "20,000", 1666.66 -> "1,666.66" (paise only when there are some)
export const fmtPoints = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

// "12.5" -> "12.5", "600.00" -> "600"
export const fmtArea = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

// What each ledger kind is called, and a colour for its chip.
export const KINDS = {
  sale: { label: "Sales bonus", tone: "bg-emerald-100 text-emerald-800" },
  team: { label: "Team difference", tone: "bg-sky-100 text-sky-800" },
  self_monthly: { label: "Monthly bonus", tone: "bg-violet-100 text-violet-800" },
  team_monthly: { label: "Team monthly bonus", tone: "bg-indigo-100 text-indigo-800" },
  partnership: { label: "Partnership bonus", tone: "bg-orange-100 text-orange-800" },
  monthly: { label: "Monthly bonus", tone: "bg-violet-100 text-violet-800" },
  cto: { label: "C.T.O. bonus", tone: "bg-amber-100 text-amber-800" },
  adjustment: { label: "Adjustment", tone: "bg-stone-200 text-stone-700" },
  reversal: { label: "Cancelled sale", tone: "bg-rose-100 text-rose-800" },
  payout: { label: "Redeemed", tone: "bg-teal-100 text-teal-800" },
};
