// The rules of the partner plan that the admin can change (Admin > Commission Plan).
// Pure helpers, safe to use in the browser and on the server. The database reads the same
// settings (site_settings), see supabase/021_paper_plan.sql.

export const RULE_KEYS = {
  months: "plan_monthly_months",
  selfPct: "plan_self_monthly_pct",
  levelPct: "plan_level_pct",
  levels: "plan_levels",
  openArea: "plan_open_area",
  openStep: "plan_open_step",
  closeDays: "plan_close_days",
  closeHour: "plan_close_hour",
  monthDay: "plan_month_close_day",
  partnershipPct: "plan_partnership_pct",
  capX: "plan_partnership_cap_x",
  ctoPct: "plan_cto_pct",
  ctoRank: "plan_cto_min_rank",
  powerPct: "plan_reward_power_pct",
  poolAuto: "plan_pool_auto",
  poolDay: "plan_pool_day",
};

// What is used until the admin saves something else.
export const DEFAULT_RULES = {
  months: 12, // the monthly bonus is paid over this many months
  selfPct: 2, // % of the sale, for the seller (monthly bonus)
  levelPct: 0.25, // % of the sale, for each open level above the seller (monthly bonus)
  levels: 8, // how many levels of the team are paid
  openArea: 100, // sq. yards of own sales that open...
  openStep: 2, // ...this many levels
  closeDays: "11,21,1", // the sales bonus is added on these days of the month
  closeHour: 1, // at this hour (India time)
  monthDay: 1, // the monthly bonus instalments are added on this day
  partnershipPct: 1, // % of the company's sales shared by the active partners
  capX: 2, // a partner gets at most this many times the activation fee (0 = no limit)
  ctoPct: 1, // % of the company's sales shared by the top rank
  ctoRank: 9, // the rank that shares it
  powerPct: 50, // the strongest leg counts for at most this % of a reward's sq. yards
  poolAuto: 1, // 1 = the nightly job (1 AM) shares last month's partnership and C.T.O. bonus by itself
  poolDay: 1, // from this day of the month on
};

const num = (v, d) => {
  const n = Number(String(v ?? "").trim());
  return String(v ?? "").trim() !== "" && Number.isFinite(n) && n >= 0 ? n : d;
};

// The days of the month as a clean sorted list: "21, 1,11" -> [1, 11, 21]
export function closeDaysList(text) {
  const days = String(text ?? "")
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => n >= 1 && n <= 28);
  return [...new Set(days)].sort((a, b) => a - b);
}

// settings: { plan_monthly_months: "12", ... } (what is saved). Returns numbers, with the defaults filled in.
export function readRules(settings = {}) {
  const get = (key) => settings?.[RULE_KEYS[key]];
  const days = closeDaysList(get("closeDays"));
  return {
    months: Math.min(60, Math.max(1, Math.round(num(get("months"), DEFAULT_RULES.months)))),
    selfPct: num(get("selfPct"), DEFAULT_RULES.selfPct),
    levelPct: num(get("levelPct"), DEFAULT_RULES.levelPct),
    levels: Math.min(20, Math.max(1, Math.round(num(get("levels"), DEFAULT_RULES.levels)))),
    openArea: Math.max(1, num(get("openArea"), DEFAULT_RULES.openArea)),
    openStep: Math.max(1, Math.round(num(get("openStep"), DEFAULT_RULES.openStep))),
    closeDays: (days.length ? days : closeDaysList(DEFAULT_RULES.closeDays)).join(","),
    closeHour: Math.min(23, Math.round(num(get("closeHour"), DEFAULT_RULES.closeHour))),
    monthDay: Math.min(28, Math.max(1, Math.round(num(get("monthDay"), DEFAULT_RULES.monthDay)))),
    partnershipPct: num(get("partnershipPct"), DEFAULT_RULES.partnershipPct),
    capX: num(get("capX"), DEFAULT_RULES.capX),
    ctoPct: num(get("ctoPct"), DEFAULT_RULES.ctoPct),
    ctoRank: Math.max(1, Math.round(num(get("ctoRank"), DEFAULT_RULES.ctoRank))),
    powerPct: Math.min(100, num(get("powerPct"), DEFAULT_RULES.powerPct)),
    poolAuto: num(get("poolAuto"), DEFAULT_RULES.poolAuto) === 0 ? 0 : 1,
    poolDay: Math.min(28, Math.max(1, Math.round(num(get("poolDay"), DEFAULT_RULES.poolDay)))),
  };
}

// 1 -> "1st", 11 -> "11th", 21 -> "21st"
export function ordinal(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

// "11th, 21st and 1st"
export function closeDaysText(rules) {
  const list = closeDaysList(rules.closeDays);
  // the day that starts the month closes the month before, so it is listed last
  const sorted = [...list.filter((d) => d !== 1), ...(list.includes(1) ? [1] : [])].map(ordinal);
  if (sorted.length <= 1) return sorted.join("");
  return `${sorted.slice(0, -1).join(", ")} and ${sorted[sorted.length - 1]}`;
}

// 1 -> "1 AM", 13 -> "1 PM", 0 -> "12 AM"
export function hourText(h) {
  const hour = ((Number(h) % 24) + 24) % 24;
  return `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? "AM" : "PM"}`;
}

// 0.25 -> "0.25", 2 -> "2"
export const pctText = (n) => String(Number(Number(n).toFixed(3)));

// What a sale of `value` pays in monthly bonus, month by month (the same arithmetic as the database).
//   total: the whole amount   each: one instalment (the last one takes what the rounding left)
export function monthlyShare(value, pct, months) {
  const total = Math.round(value * pct) / 100;
  const each = Math.trunc((total / months) * 100) / 100;
  return { total, each, last: Math.round((total - each * (months - 1)) * 100) / 100 };
}

// How the next level can be opened, for a partner with `selfArea` sq. yards of own sales and `directs` direct partners.
//   { open, target, moreArea, moreDirects }  (target is null when every level is open)
export function nextLevelHint(rules, selfArea, directs) {
  const open = Math.min(rules.levels, Math.max(rules.openStep * Math.floor(selfArea / rules.openArea), directs));
  if (open >= rules.levels) return { open, target: null, moreArea: 0, moreDirects: 0 };
  const target = open + 1;
  const needArea = Math.ceil(target / rules.openStep) * rules.openArea;
  return {
    open,
    target,
    moreArea: Math.max(0, Math.round((needArea - selfArea) * 100) / 100),
    moreDirects: Math.max(0, target - directs),
  };
}
