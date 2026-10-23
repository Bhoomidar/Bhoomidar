import {
  ArrowRight,
  Building2,
  Check,
  Clock,
  Handshake,
  PhoneCall,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import AutoRefresh from "@/components/dashboard/AutoRefresh";
import PendingNotice from "@/components/dashboard/PendingNotice";
import ReferralCard from "@/components/dashboard/ReferralCard";
import { getCurrentPartner, getNetwork, initials } from "@/lib/profile";
import { referralLink } from "@/lib/referral";

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

const tones = {
  copper: { bar: "from-copper-light to-copper-dark", chip: "bg-copper/10 text-copper" },
  amber: { bar: "from-amber-300 to-amber-500", chip: "bg-amber-100 text-amber-700" },
  ink: { bar: "from-[#3a2a1f] to-[#17110c]", chip: "bg-ink/10 text-ink" },
};

export default async function DashboardOverview() {
  const partner = await getCurrentPartner();
  const { referrer, referrals } = await getNetwork(partner.user.id, partner.referredBy);
  const link = partner.referralCode ? await referralLink(partner.referralCode) : "";

  const status = !partner.active
    ? { text: "Inactive", dot: "bg-rose-400", pill: "bg-rose-400/15 text-rose-300" }
    : partner.pending
      ? { text: "Waiting for activation", dot: "bg-amber-400", pill: "bg-amber-400/15 text-amber-300" }
      : { text: "Active partner", dot: "bg-emerald-400", pill: "bg-emerald-400/15 text-emerald-300" };

  const unpaidReferrals = referrals.filter((p) => p.pending).length;
  const stats = [
    {
      icon: Users,
      label: "People you referred",
      value: referrals.length,
      note: referrals.length === 1 ? "partner joined with your code" : "partners joined with your code",
      href: "/dashboard/network",
      tone: tones.copper,
    },
    {
      icon: Clock,
      label: "Waiting for payment",
      value: unpaidReferrals,
      note: "of your referrals have not paid yet",
      href: "/dashboard/network",
      tone: tones.amber,
    },
    {
      icon: Wallet,
      label: "Your commission",
      value: "Soon",
      note: "your sales and earnings will show here",
      href: "/dashboard/commission",
      tone: tones.ink,
    },
  ];

  return (
    <div className="space-y-8">
      <AutoRefresh />

      {/* Hero */}
      <div className="fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a2019] via-[#1d1712] to-night p-6 text-white shadow-xl sm:p-9">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-copper/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-60 w-60 rounded-full bg-copper-light/15 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-5 sm:gap-6">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark font-display text-3xl font-bold text-white shadow-xl ring-4 ring-white/10 sm:h-24 sm:w-24 sm:text-4xl">
              {partner.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partner.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials(partner.name)
              )}
            </span>
            <div className="min-w-0">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${status.pill}`}
              >
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                {status.text}
              </span>
              <h1 className="mt-3 break-words font-display text-3xl font-bold leading-tight sm:text-4xl">
                {greeting()}, <span className="text-copper-light">{partner.firstName}</span>
              </h1>
              <p className="mt-1.5 text-base text-white/65">
                Welcome to your Bhoomidar partner account.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <a
              href="/properties"
              className="group inline-flex items-center gap-3 whitespace-nowrap rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:-translate-y-0.5"
            >
              Browse Properties
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <UserRound className="h-4 w-4" />
              My Profile
            </a>
          </div>
        </div>
      </div>

      {partner.pending ? (
        <PendingNotice name={partner.name} email={partner.email} />
      ) : (
        <>
          {/* Numbers */}
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map(({ icon: Icon, label, value, note, href, tone }) => (
                <a
                  key={label}
                  href={href}
                  className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.4)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-24px_rgba(110,60,20,0.5)]"
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
            <div className="grid gap-6 lg:grid-cols-5">
              <section className="flex flex-col rounded-3xl bg-white p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7 lg:col-span-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-2xl font-bold text-ink">Latest referrals</h2>
                  <a
                    href="/dashboard/network"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-copper transition hover:text-copper-dark"
                  >
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>

                {referrals.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-copper/10 text-copper ring-8 ring-copper/5">
                      <Users className="h-7 w-7" strokeWidth={1.6} />
                    </span>
                    <p className="mt-4 text-base font-bold text-ink">No referrals yet</p>
                    <p className="mt-1 max-w-xs text-sm leading-relaxed text-ink/55">
                      Share your link above. Everyone who joins with your code shows up here.
                    </p>
                  </div>
                ) : (
                  <ul className="mt-3 divide-y divide-black/5">
                    {referrals.slice(0, 4).map((p) => (
                      <li key={p.id} className="flex items-center gap-4 py-3.5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white">
                          {initials(p.name || "?")}
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block truncate text-base font-semibold text-ink">
                            {p.name || "Partner"}
                          </span>
                          <span className="mt-0.5 block text-xs text-ink/50">
                            {p.code} · Joined {p.joined}
                          </span>
                        </span>
                        {p.pending ? (
                          <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                            Unpaid
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                            <Check className="h-3 w-3" strokeWidth={3} />
                            Active
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-auto border-t border-black/5 pt-4 text-xs text-ink/55">
                  {referrer ? (
                    <>
                      You joined through <b className="text-ink">{referrer.name}</b> ({referrer.code})
                    </>
                  ) : (
                    "You joined directly, without a referral code."
                  )}
                </p>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7 lg:col-span-2">
                <h2 className="font-display text-2xl font-bold text-ink">
                  Quick <span className="text-copper">actions</span>
                </h2>
                <ul className="mt-4 space-y-3">
                  {quickActions.map(({ icon: Icon, title, text, href }) => (
                    <li key={title}>
                      <a
                        href={href}
                        className="group flex items-center gap-4 rounded-2xl bg-[#fbf7f0] p-4 ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:ring-copper/30"
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3a2a1f] to-[#17110c] text-copper-light shadow-md transition group-hover:scale-105">
                          <Icon className="h-5 w-5" strokeWidth={1.8} />
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
        </>
      )}
    </div>
  );
}
