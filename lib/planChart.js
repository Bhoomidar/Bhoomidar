// Pure helpers for the rank chart. No server code in here, so the admin page can use them for its live preview.

// "2.250" -> "2.25", "2.000" -> "2"
export const pct = (n) => String(Number(Number(n).toFixed(3)));
export const inr = (n) => Math.round(Number(n)).toLocaleString("en-IN");

// How many months the monthly bonus is paid, as the admin set it (default 12).
export function monthlyMonths(c) {
  const n = Math.round(Number(c?.plan_monthly_months));
  return Number.isFinite(n) && n >= 1 && n <= 60 ? n : 12;
}

// The rank chart as the website prints it, worked out from the rank table:
// plain text for every column, so it can be handed to the browser.
//   area         "0 - 499 Sq. Yards", "500 Sq. Yards", ...
//   commission   "2.25%"            example   "10L BV x 2.25% = 22,500 Rs"
//   team         "0.25% to 0.5%"    teamExample (written by the admin)
//   monthly      "3,600 x 12"       monthlyTotal "₹43,200"
export function buildChart(rows, months = 12) {
  if (!rows.length) return [];
  const base = Number(rows[0].ps_rate);
  const step = rows[1] ? Number(rows[1].ps_rate) - base : 0.25;

  return rows.map((r, i) => {
    const rate = Number(r.ps_rate);
    const next = rows[i + 1];
    const max = rate - base;
    const bonus = Number(r.monthly_bonus);
    return {
      no: r.rank_no,
      title: r.title,
      area:
        i === 0
          ? `${inr(r.min_area)} - ${inr((next ? Number(next.min_area) : 500) - 1)} Sq. Yards`
          : `${inr(r.min_area)} Sq. Yards`,
      minArea: Number(r.min_area),
      rate,
      commission: `${pct(rate)}%`,
      example: `10L BV x ${pct(rate)}% = ${inr((rate * 1000000) / 100)} Rs`,
      team: i === 0 || max <= 0 ? "0%" : max <= step + 0.0005 ? `${pct(max)}%` : `${pct(step)}% to ${pct(max)}%`,
      teamExample: r.team_example || "",
      monthly: `${inr(bonus)} x ${months}`,
      monthlyTotal: `₹${inr(bonus * months)}`,
      reward: r.reward,
      icon: r.icon || "Gift",
      image: r.image_url || "",
    };
  });
}
