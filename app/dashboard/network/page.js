import {
  Check,
  Clock,
  Layers,
  MapPin,
  Network,
  UserCheck,
  Users,
  CalendarDays,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import AutoRefresh from "@/components/dashboard/AutoRefresh";
import PendingNotice from "@/components/dashboard/PendingNotice";
import ReferralCard from "@/components/dashboard/ReferralCard";
import TeamTree from "@/components/dashboard/TeamTree";
import { getCurrentPartner, getDownline, getNetwork, initials } from "@/lib/profile";
import { referralLink } from "@/lib/referral";

export const metadata = { title: "My Network | Bhoomidar" };

export default async function NetworkPage() {
  const partner = await getCurrentPartner();
  const { referrer } = await getNetwork(partner.user.id, partner.referredBy);
  const link = partner.referralCode ? await referralLink(partner.referralCode) : "";
  const team = partner.pending ? [] : await getDownline(partner.user.id);

  const direct = team.filter((n) => n.level === 1).length;
  const active = team.filter((n) => n.status === "active").length;
  const unpaid = team.filter((n) => n.status === "unpaid").length;
  const levels = team.reduce((max, n) => Math.max(max, n.level), 0);
  const perLevel = Array.from({ length: levels }, (_, i) => ({
    level: i + 1,
    count: team.filter((n) => n.level === i + 1).length,
  }));

  const tones = {
    copper: { bar: "from-copper-light to-copper-dark", chip: "bg-copper/10 text-copper" },
    ink: { bar: "from-[#3a2a1f] to-[#17110c]", chip: "bg-ink/10 text-ink" },
    green: { bar: "from-emerald-400 to-emerald-600", chip: "bg-emerald-100 text-emerald-700" },
    amber: { bar: "from-amber-300 to-amber-500", chip: "bg-amber-100 text-amber-700" },
  };
  const stats = [
    { icon: Users, label: "Direct referrals", value: direct, note: "joined with your code", tone: tones.copper },
    { icon: Network, label: "Your whole team", value: team.length, note: "across all levels", tone: tones.ink },
    { icon: Check, label: "Active partners", value: active, note: "payment received", tone: tones.green },
    { icon: Clock, label: "Waiting for payment", value: unpaid, note: "not active yet", tone: tones.amber },
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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map(({ icon: Icon, label, value, note, tone }) => (
                <div
                  key={label}
                  className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.4)] ring-1 ring-black/5"
                >
                  <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.bar}`} />
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-ink/60">{label}</p>
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.chip}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-3 font-sans text-4xl font-extrabold tabular-nums text-ink">{value}</p>
                  <p className="mt-1 text-xs text-ink/50">{note}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Who brought you in */}
          <Reveal>
            <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:flex-row sm:items-center sm:p-7">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper">
                <UserCheck className="h-5 w-5" />
              </span>
              <p className="text-sm text-ink/55 sm:w-40">You were referred by</p>
              {referrer ? (
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-base font-bold text-white shadow-md">
                    {referrer.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={referrer.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials(referrer.name || "?")
                    )}
                  </span>
                  <div className="min-w-0 leading-tight">
                    <p className="flex flex-wrap items-center gap-2 text-lg font-bold text-ink">
                      {referrer.name}
                      <span className="rounded-full bg-copper/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-copper-dark">
                        {referrer.code}
                      </span>
                    </p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/55">
                      {referrer.place && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {referrer.place}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Member since {referrer.joined}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="flex-1 text-base font-semibold text-ink/70">
                  No one. You joined directly, without a referral code.
                </p>
              )}
            </div>
          </Reveal>

          {/* The team */}
          <Reveal>
            <section className="rounded-3xl bg-white p-5 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-ink">
                    <Layers className="h-6 w-6 text-copper" />
                    Your team
                  </h2>
                  <p className="mt-1 text-sm text-ink/55">
                    Everyone under you. Open a partner to see the people they brought in.
                  </p>
                </div>
                {perLevel.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {perLevel.map(({ level, count }) => (
                      <li
                        key={level}
                        className="rounded-full bg-copper/10 px-3.5 py-1.5 text-xs font-semibold text-copper-dark"
                      >
                        Level {level}: {count}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-6">
                <TeamTree nodes={team} rootId={partner.user.id} />
              </div>
            </section>
          </Reveal>
        </>
      )}
    </div>
  );
}
