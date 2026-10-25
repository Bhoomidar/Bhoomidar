import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONTENT_TAG } from "@/lib/content";
import { ranks as FALLBACK } from "@/lib/data";
import { buildChart, monthlyMonths } from "@/lib/planChart";

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
    monthly: r.monthly,
    monthlyTotal: r.monthlyTotal,
    reward: r.reward,
    icon: r.icon?.displayName ?? r.icon?.name ?? "Gift",
  }));

// The chart for the website. Cached, and cleared when the admin saves the plan.
export const getRankChart = unstable_cache(
  async () => {
    try {
      const db = createAdminClient();
      const [{ data, error }, { data: set }] = await Promise.all([
        db
          .from("rank_plan")
          .select("rank_no, title, min_area, ps_rate, monthly_bonus, reward, icon, team_example")
          .order("rank_no", { ascending: true }),
        db.from("site_settings").select("value").eq("key", "plan_monthly_months").maybeSingle(),
      ]);
      if (error) throw error;
      if (!data?.length) return fallbackChart();
      return buildChart(data, monthlyMonths({ plan_monthly_months: set?.value }));
    } catch (err) {
      console.error("Could not read the rank plan:", err?.message || err);
      return fallbackChart();
    }
  },
  ["site-rank-chart"],
  { revalidate: 300, tags: [CONTENT_TAG] },
);
