import { ArrowUp, CalendarDays, Check, Clock, MapPin, Network, UserCheck, Users } from "lucide-react";
import Reveal from "@/components/Reveal";
import AutoRefresh from "@/components/dashboard/AutoRefresh";
import PendingNotice from "@/components/dashboard/PendingNotice";
import ReferralCard from "@/components/dashboard/ReferralCard";
import { AwardArt, BarsArt, HourglassArt, PeopleArt } from "@/components/dashboard/StatArt";
import TeamTree, { ReferralsTable } from "@/components/dashboard/TeamTree";
import { getCurrentPartner, getDownline, getNetwork } from "@/lib/profile";
import { referralLink } from "@/lib/referral";
import { getPartnerCommission, getTeamStats } from "@/lib/commission";

export const metadata = { title: "My Network | Bhoomidar" };

export default async function NetworkPage() {
  const partner = await getCurrentPartner();
  const { referrer, referrals } = await getNetwork(partner.user.id, partner.referredBy);
  const link = partner.referralCode ? await referralLink(partner.referralCode) : "";
  const downline = partner.pending ? [] : await getDownline(partner.user.id);
  // Rank, sold area and points earned for each member of the team.
  const teamStats = partner.pending ? {} : await getTeamStats(partner.user.id, downline.map((n) => n.id));
  const team = downline.map((n) => ({ ...n, ...teamStats[n.id] }));
  const mine = partner.pending ? null : await getPartnerCommission(partner.user.id);

  const direct = team.filter((n) => n.level === 1).length;
  const active = team.filter((n) => n.status === "active").length;
  const unpaid = team.filter((n) => n.status === "unpaid").length;

  const monthOf = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).slice(0, 7);
  const thisMonth = monthOf(new Date());
  const joinedThisMonth = referrals.filter((p) => p.joinedAt && monthOf(p.joinedAt) === thisMonth).length;

  const stats = [
    {
      icon: Users,
      art: PeopleArt,
      label: "Direct referrals",
      value: direct,
      badge: joinedThisMonth > 0 ? `+${joinedThisMonth} this month` : "",
      note: "joined with your code",
      theme: { bg: "from-[#fdebdc] to-[#fff6ec]", ring: "ring-copper/10", chip: "bg-[#f9d6b8] text-copper", art: "text-copper" },
    },
    {
      icon: Network,
      art: AwardArt,
      label: "Your whole team",
      value: team.length,
      badge: "",
      note: "across all levels",
      theme: { bg: "from-[#f3efea] to-[#fdfbf8]", ring: "ring-black/5", chip: "bg-stone-200 text-stone-700", art: "text-copper" },
    },
    {
      icon: Check,
      art: BarsArt,
      label: "Active partners",
      value: active,
      badge: "",
      note: "payment received",
      theme: { bg: "from-[#dff5e8] to-[#f5fcf8]", ring: "ring-emerald-300/30", chip: "bg-emerald-200/80 text-emerald-700", art: "text-emerald-500" },
    },
    {
      icon: Clock,
      art: HourglassArt,
      label: "Waiting for payment",
      value: unpaid,
      badge: "",
      note: "not active yet",
      theme: { bg: "from-[#fff1cf] to-[#fffaf0]", ring: "ring-amber-300/30", chip: "bg-amber-200/80 text-amber-700", art: "text-amber-500" },
    },
  ];

  return (
    <div className="space-y-8">
      <AutoRefresh />
      <div className="fade-up">
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
          <span className="h-px w-8 bg-copper" />
          Referrals
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
          My <span className="text-copper">Network</span>
        </h1>
      </div>

      {partner.pending ? (
        <PendingNotice name={partner.name} email={partner.email} />
      ) : (
        <>
          <Reveal>
            <ReferralCard code={partner.referralCode} link={link} />
          </Reveal>

          {/* Numbers */}
          <Reveal>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map(({ icon: Icon, art: Art, label, value, badge, note, theme }) => (
                <div
                  key={label}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} p-5 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.4)] ring-1 ${theme.ring} transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-24px_rgba(110,60,20,0.5)]`}
                >
                  <Art
                    className={`pointer-events-none absolute bottom-3 right-3 h-20 w-24 origin-bottom-right transition duration-500 group-hover:scale-110 ${theme.art}`}
                  />
                  <div className="relative flex items-center gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${theme.chip}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-semibold text-ink/70">{label}</p>
                  </div>
                  <p className="relative mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-4xl font-extrabold tabular-nums text-ink">{value}</span>
                    {badge && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        <ArrowUp className="h-3 w-3" strokeWidth={3} />
                        {badge}
                      </span>
                    )}
                  </p>
                  <p className="relative mt-1.5 text-sm text-ink/55">{note}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* The people you referred */}
          <Reveal>
            <ReferralsTable nodes={team} rootId={partner.user.id}>
              <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-black/5 pt-4 text-xs text-ink/50">
                <UserCheck className="h-4 w-4 text-copper/70" />
                {referrer ? (
                  <>
                    <span>
                      You joined through <b className="text-ink/70">{referrer.name}</b> ({referrer.code})
                    </span>
                    {referrer.place && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {referrer.place}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      Member since {referrer.joined}
                    </span>
                  </>
                ) : (
                  "You joined directly, without a referral code."
                )}
              </p>
            </ReferralsTable>
          </Reveal>

          {/* The whole team */}
          <Reveal>
            <TeamTree
              nodes={team}
              rootId={partner.user.id}
              me={{
                name: partner.firstName,
                avatar: partner.avatarUrl,
                code: partner.referralCode,
                rankTitle: mine?.rank?.title ?? "",
                sold: mine?.teamArea ?? 0,
              }}
            />
          </Reveal>
        </>
      )}
    </div>
  );
}
