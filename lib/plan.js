import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONTENT_TAG } from "@/lib/content";
import { ranks as FALLBACK } from "@/lib/data";
import { buildChart } from "@/lib/planChart";
import { DEFAULT_RULES, RULE_KEYS, pctText, readRules } from "@/lib/planRules";

// What the website shows if the database cannot be reached.
const fallbackChart = () =>
  FALLBACK.map((r, i) => ({
    no: i + 1,
    title: r.title,
    area: r.area,
    minArea: 0,
    rate: parseFloat(r.commission),
    commission: r.commission,
    example: r.example,
    team: r.team,
    teamExample: r.teamExample,
    monthly: `${pctText(DEFAULT_RULES.selfPct)}% self + ${pctText(DEFAULT_RULES.levelPct)}% x ${DEFAULT_RULES.levels} levels`,
    monthlyTotal: `Paid over ${DEFAULT_RULES.months} months`,
    reward: r.reward,
    rewardValue: "",
    icon: r.icon?.displayName ?? r.icon?.name ?? "Gift",
    image: "",
  }));

// The chart for the website. Cached, and cleared when the admin saves the plan.
export const getRankChart = unstable_cache(
  async () => {
    try {
      const db = createAdminClient();
      const [{ data, error }, { data: set }] = await Promise.all([
        db
          .from("rank_plan")
          .select("rank_no, title, min_area, ps_rate, reward, reward_value, icon, image_url, team_example")
          .order("rank_no", { ascending: true }),
        db.from("site_settings").select("key, value").in("key", Object.values(RULE_KEYS)),
      ]);
      if (error) throw error;
      if (!data?.length) return fallbackChart();
      return buildChart(data, readRules(Object.fromEntries((set ?? []).map((s) => [s.key, s.value]))));
    } catch (err) {
      console.error("Could not read the rank plan:", err?.message || err);
      return fallbackChart();
    }
  },
  ["site-rank-chart"],
  { revalidate: 300, tags: [CONTENT_TAG] },
);
