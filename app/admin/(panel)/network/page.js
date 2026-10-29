import PageHeader from "@/components/admin/PageHeader";
import TeamTree from "@/components/dashboard/TeamTree";
import { getReferralTree } from "@/actions/admin/partners";
import { getTeamStats } from "@/lib/commission";

export const metadata = { title: "Referral Tree" };

const ROOT = "company";
const NO_PARTNER = "00000000-0000-0000-0000-000000000000"; // the team stats are worked out for "nobody", so no points are counted

const day = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default async function NetworkPage() {
  const people = await getReferralTree();

  // Everyone under one top node (the company), with the level of each partner: those with no referrer are Level 1.
  const byId = new Map(people.map((p) => [p.id, p]));
  const kids = new Map();
  for (const p of people) {
    const parent = p.referred_by && byId.has(p.referred_by) ? p.referred_by : ROOT;
    if (!kids.has(parent)) kids.set(parent, []);
    kids.get(parent).push(p);
  }
  const nodes = [];
  const seen = new Set();
  const walk = (parentId, level) => {
    for (const p of kids.get(parentId) ?? []) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      nodes.push({
        id: p.id,
        parentId,
        level,
        name: p.full_name || p.email,
        code: p.referral_code || "",
        avatar: p.avatar_url || "",
        place: [p.city, p.state].filter(Boolean).join(", "),
        contact: [p.email, p.phone].filter(Boolean).join(" · "),
        joined: day(p.created_at),
        activatedOn: p.activated_at ? day(p.activated_at) : "",
        status: p.is_active === false ? "off" : p.activated_at ? "active" : "unpaid",
        earned: 0,
      });
      walk(p.id, level + 1);
    }
  };
  walk(ROOT, 1);

  // Rank and land sold for each partner.
  const stats = await getTeamStats(NO_PARTNER, nodes.map((n) => n.id));
  const team = nodes.map((n) => ({ ...n, ...stats[n.id], earned: 0 }));
  const sold = team.reduce((t, n) => t + (n.soldArea ?? 0), 0);

  return (
    <>
      <PageHeader
        label="People"
        title="Referral"
        accent="Tree"
        text="Who joined under whom. Open a partner to see everyone they brought in."
      />
      <div className="mt-6">
        <TeamTree
          admin
          noPoints
          rootLabel="Bhoomidar (top)"
          title={
            <>
              All <span className="text-copper-dark">partners</span>
            </>
          }
          subtitle="Everyone on the platform, by who referred whom. Partners with no referrer sit directly under Bhoomidar."
          nodes={team}
          rootId={ROOT}
          me={{ name: "Bhoomidar", avatar: "", code: "All partners", rankTitle: "", sold }}
        />
      </div>
    </>
  );
}
