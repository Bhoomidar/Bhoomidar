import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Building2,
  Check,
  Clock,
  Handshake,
  PhoneCall,
  Ticket,
  Trophy,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import AutoRefresh from "@/components/dashboard/AutoRefresh";
import GrowthPath from "@/components/dashboard/GrowthPath";
import HeroSlides from "@/components/dashboard/HeroSlides";
import PendingNotice from "@/components/dashboard/PendingNotice";
import { BarsArt, HourglassArt, PeopleArt, TeamArt } from "@/components/dashboard/StatArt";
import ReferralCard from "@/components/dashboard/ReferralCard";
import { getCurrentPartner, getNetwork, initials } from "@/lib/profile";
import { referralLink } from "@/lib/referral";
import { getPartnerCommission } from "@/lib/commission";
import { getRankChart } from "@/lib/plan";
import { fmtPoints } from "@/lib/points";

const quickActions = [
  {
    icon: Building2,
    title: "Browse Properties",
    text: "Land and property to share with buyers",
    href: "/properties",
  },
  {
    icon: Handshake,
    title: "Partner Program",
    text: "How commission and rewards work",
    href: "/opportunities",
  },
  {
    icon: PhoneCall,
    title: "Talk to Us",
    text: "Questions? Our team will help",
    href: "/contact",
  },
];

// "Good morning" and so on, by the hour in India.
function greeting() {
  const hour = Number(
    new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardOverview() {
  const partner = await getCurrentPartner();
  const { referrer, referrals } = await getNetwork(partner.user.id, partner.referredBy);
  const link = partner.referralCode ? await referralLink(partner.referralCode) : "";
  const comm = partner.pending ? null : await getPartnerCommission(partner.user.id);
  const currentRank = (comm?.rank?.no ?? 1) - 1;

  const status = !partner.active
    ? { text: "Inactive", dot: "bg-rose-500", pill: "bg-rose-50 text-rose-700 ring-rose-200" }
    : partner.pending
      ? { text: "Waiting for activation", dot: "bg-amber-500", pill: "bg-amber-50 text-amber-800 ring-amber-200" }
      : { text: "Active partner", dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-800 ring-emerald-200" };

  const unpaidReferrals = referrals.filter((p) => p.pending).length;
  const monthOf = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).slice(0, 7);
  const thisMonth = monthOf(new Date());
  const joinedThisMonth = referrals.filter((p) => p.joinedAt && monthOf(p.joinedAt) === thisMonth).length;

  const stats = [
    {
      icon: Users,
      art: PeopleArt,
      label: "People you referred",
      value: referrals.length,
      badge: joinedThisMonth > 0 ? `+${joinedThisMonth} this month` : "",
      note: referrals.length === 1 ? "partner joined with your code" : "partners joined with your code",
      href: "/dashboard/network",
      theme: { bg: "from-[#fdebdc] to-[#fff6ec]", ring: "ring-copper/10", chip: "bg-[#f9d6b8] text-copper", art: "text-copper" },
    },
    {
      icon: Clock,
      art: HourglassArt,
      label: "Waiting for payment",
      value: unpaidReferrals,
      badge: "",
      note: "of your referrals have not paid yet",
      href: "/dashboard/network",
      theme: { bg: "from-[#fff1cf] to-[#fffaf0]", ring: "ring-amber-300/30", chip: "bg-amber-200/80 text-amber-700", art: "text-amber-500" },
    },
    {
      icon: Wallet,
      art: BarsArt,
      label: "Your commission",
      value: fmtPoints(comm?.balance ?? 0),
      badge: "",
      note: comm ? `points to be paid · ${comm.rank?.title ?? ""}` : "your sales and earnings will show here",
      href: "/dashboard/commission",
      theme: { bg: "from-[#dff5e8] to-[#f5fcf8]", ring: "ring-emerald-300/30", chip: "bg-emerald-200/80 text-emerald-700", art: "text-emerald-500" },
    },
  ];

  return (
    <div className="space-y-8">
      <AutoRefresh />

      {/* Hero */}
      <div className="fade-up relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-[#fff7ec] to-[#fbeedd] shadow-[0_28px_60px_-30px_rgba(110,60,20,0.5)] ring-1 ring-black/5">
        <div className="relative grid grid-cols-1 lg:min-h-[230px] lg:grid-cols-[1.05fr_1fr]">
          <div className="relative z-10 flex min-w-0 flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:gap-7 sm:p-7 lg:py-6">
            <span className="relative shrink-0">
              <span className="absolute -inset-2.5 rounded-full bg-gradient-to-br from-copper-light/55 to-transparent blur-md" />
              <span className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark font-display text-3xl font-bold text-white shadow-xl ring-[5px] ring-white sm:h-28 sm:w-28 sm:text-4xl">
                {partner.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={partner.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(partner.name)
                )}
              </span>
            </span>

            <div className="min-w-0">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] ring-1 ${status.pill}`}
              >
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                {status.text}
              </span>
              <h1 className="mt-3 break-words font-display text-2xl font-bold leading-tight text-ink [overflow-wrap:anywhere] sm:text-3xl xl:text-[2.1rem]">
                {greeting()}, <span className="text-copper">{partner.firstName}</span> <span aria-hidden>👋</span>
              </h1>
              <p className="mt-1.5 text-sm text-ink/60 sm:text-base">Welcome to your Bhoomidar partner account.</p>

              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                {partner.referralCode && (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs text-ink/60 shadow-sm ring-1 ring-black/10">
                    <Ticket className="h-3.5 w-3.5 text-copper" />
                    Your code
                    <b className="font-mono text-sm tracking-wider text-copper-dark">{partner.referralCode}</b>
                  </span>
                )}
                {comm?.rank && (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-copper/10 px-3 py-1.5 text-xs font-semibold text-copper-dark ring-1 ring-copper/20">
                    <Trophy className="h-3.5 w-3.5" />
                    {comm.rank.title}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Soft photos, the handwritten line and the two buttons */}
          <div className="relative min-h-[200px] sm:min-h-[230px] lg:min-h-full">
            <HeroSlides />

            <div className="absolute inset-x-4 bottom-4 z-10 flex flex-wrap justify-end gap-2.5 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:gap-3">
              <a
                href="/properties"
                className="group inline-flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-3 sm:flex-none sm:px-5 text-sm font-semibold text-white shadow-lg shadow-copper/40 transition hover:-translate-y-0.5"
              >
                Browse Properties
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>
              <a
                href="/dashboard/profile"
                className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-4 py-3 text-sm font-semibold text-ink shadow-lg shadow-black/10 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:text-copper sm:flex-none sm:px-5"
              >
                <UserRound className="h-4 w-4" />
                My Profile
              </a>
            </div>
          </div>
        </div>
      </div>

      {partner.pending ? (
        <PendingNotice name={partner.name} email={partner.email} />
      ) : (
        <>
          {/* Numbers */}
          <Reveal>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {stats.map(({ icon: Icon, art: Art, label, value, badge, note, href, theme }) => (
                <a
                  key={label}
                  href={href}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} p-5 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.4)] ring-1 ${theme.ring} transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-24px_rgba(110,60,20,0.5)]`}
                >
                  <Art
                    className={`pointer-events-none absolute bottom-3 right-4 h-24 w-28 origin-bottom-right transition duration-500 group-hover:scale-110 ${theme.art}`}
                  />
                  <div className="relative flex items-center gap-4">
                    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-sm ${theme.chip}`}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 leading-tight">
                      <p className="text-sm font-medium text-ink/70">{label}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-4xl font-extrabold tabular-nums text-ink">{value}</span>
                        {badge && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                            <ArrowUp className="h-3 w-3" strokeWidth={3} />
                            {badge}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="relative mt-3 text-sm text-ink/55">{note}</p>
                  <span className="relative mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-copper shadow-sm ring-1 ring-copper/25 transition group-hover:bg-copper group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </a>
              ))}
            </div>
          </Reveal>

          {/* Referral code and link */}
          <Reveal>
            <ReferralCard code={partner.referralCode} link={link} />
          </Reveal>

          {/* Latest referrals and quick actions */}
          <Reveal>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_1fr]">
              <section className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-2xl font-bold text-ink sm:text-[1.7rem]">
                    Latest <span className="text-copper">referrals</span>
                  </h2>
                  <a
                    href="/dashboard/network"
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-copper transition hover:text-copper-dark"
                  >
                    View all
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </a>
                </div>

                {referrals.length > 0 && (
                  <ul className="mt-5 space-y-2.5">
                    {referrals.slice(0, 3).map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3.5 shadow-[0_10px_24px_-18px_rgba(110,60,20,0.5)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:ring-copper/30"
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white shadow-md">
                          {initials(p.name || "?")}
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block [overflow-wrap:anywhere] text-base font-bold text-ink">{p.name || "Partner"}</span>
                          <span className="mt-1 block [overflow-wrap:anywhere] text-xs text-ink/55">
                            {p.code} · Joined {p.joined}
                          </span>
                        </span>
                        {p.pending ? (
                          <span className="shrink-0 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
                            Unpaid
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                            <Check className="h-3 w-3" strokeWidth={3} />
                            Active
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-5 flex items-center gap-4 border-t border-black/10 pt-5">
                  <TeamArt className="h-24 w-36 shrink-0" />
                  <div className="min-w-0 leading-snug">
                    {referrals.length > 0 ? (
                      <p className="text-sm font-bold text-copper-dark">
                        You&apos;ve invited {referrals.length} {referrals.length === 1 ? "partner" : "partners"} so far!
                      </p>
                    ) : (
                      <p className="text-sm font-bold text-copper-dark">Invite your first partner!</p>
                    )}
                    <p className="mt-1.5 text-sm text-ink/60">
                      {referrals.length > 0
                        ? "Keep sharing your code to grow your network and earn higher commissions."
                        : "Share your code above. Everyone who joins with it shows up here."}
                    </p>
                  </div>
                </div>

                <p className="mt-auto pt-4 text-xs text-ink/50">
                  {referrer ? (
                    <>
                      You joined through <b className="text-ink/70">{referrer.name}</b> ({referrer.code})
                    </>
                  ) : (
                    "You joined directly, without a referral code."
                  )}
                </p>
              </section>

              <section className="rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7">
                <h2 className="font-display text-2xl font-bold text-ink sm:text-[1.7rem]">
                  Quick <span className="text-copper">actions</span>
                </h2>
                <ul className="mt-5 space-y-3">
                  {quickActions.map(({ icon: Icon, title, text, href }) => (
                    <li key={title}>
                      <a
                        href={href}
                        className="group flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#fdf0e1] to-[#fffaf4] p-3.5 ring-1 ring-copper/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-copper/30"
                      >
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3a2a1f] to-[#17110c] text-copper-light shadow-md ring-1 ring-black/10 transition group-hover:scale-105">
                          <Icon className="h-6 w-6" strokeWidth={1.7} />
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block text-base font-bold text-ink">{title}</span>
                          <span className="mt-1 block text-xs text-ink/55">{text}</span>
                        </span>
                        <ArrowRight className="h-5 w-5 shrink-0 text-copper transition group-hover:translate-x-1" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </Reveal>

          {/* Growth path: the rank ladder from the partner plan */}
          <Reveal>
            <GrowthPath
              chart={await getRankChart()}
              currentRank={currentRank}
              mins={comm?.plan.map((r) => r.minArea) ?? []}
              teamArea={comm?.teamArea ?? 0}
              next={
                comm?.next
                  ? {
                      title: comm.next.title,
                      minArea: comm.next.minArea,
                      areaToNext: comm.areaToNext,
                      progress: comm.progress,
                    }
                  : null
              }
            />
          </Reveal>
        </>
      )}
    </div>
  );
}
