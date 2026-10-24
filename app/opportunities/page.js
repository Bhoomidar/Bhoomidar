import {
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  Gift,
  Crown,
  Handshake,
  MoveHorizontal,
  Share2,
  ShieldCheck,
  Sprout,
  Trophy,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import Reveal from "@/components/Reveal";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/content";
import { rankNotes, rankTiers, ranks } from "@/lib/data";

export const metadata = {
  title: "Partner Opportunities | Bhoomidar",
  description:
    "Join the Bhoomidar partner program. Earn commission and rewards on every sale.",
};

const BENEFIT_ICONS = [ClipboardList, Handshake, Users, Gift];

// Trust points from the printed plan.
const TRUST = [
  { icon: Handshake, label: "Trusted Partnership" },
  { icon: ChartNoAxesColumnIncreasing, label: "Transparent Earnings" },
  { icon: Sprout, label: "Long Term Growth" },
  { icon: ShieldCheck, label: "Secure Future" },
];

const steps = [
  {
    icon: UserPlus,
    title: "Register",
    text: "Create your partner account. It takes only a few minutes.",
  },
  {
    icon: Share2,
    title: "Share",
    text: "Show our properties to people you know.",
  },
  {
    icon: Wallet,
    title: "Earn",
    text: "Get commission when a sale is done through you.",
  },
];

export default async function OpportunitiesPage() {
  const c = await getContent();

  return (
    <main>
      <PageBanner
        image={c.partner_image}
        label="Partner Opportunities"
        text="Join our partner program, help people find good land, and earn commission and rewards on every sale."
        actions={
          <>
            <a
              href="/register"
              className="group inline-flex items-center justify-center gap-3 rounded-lg bg-gradient-to-b from-copper-light to-copper-dark px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:-translate-y-0.5"
            >
              Join as Partner
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-3 rounded-lg border border-white/70 bg-black/20 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Talk to Us <ArrowRight className="h-4 w-4" />
            </a>
          </>
        }
      >
        Grow Your Income
        <br />
        With <span className="text-copper-light">Bhoomidar</span>
      </PageBanner>

      {/* Trust strip (overlaps the banner) + what partners get */}
      <section className="relative z-10 bg-cream pb-14 sm:pb-20 lg:pb-24">
        {/* Blobs are clipped in their own box so the strip can overlap the banner above. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-1/2 h-96 w-96 rounded-full bg-copper-light/15 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#f0c58f]/25 blur-3xl" />
        </div>

        <div className="container-x relative">
          <Reveal className="-mt-10 sm:-mt-14">
            <div className="relative overflow-hidden rounded-2xl bg-night shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper-light to-transparent" />
              <div className="grid grid-cols-2 lg:grid-cols-4">
                {TRUST.map(({ icon: Icon, label }, i) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 px-4 py-5 sm:gap-4 sm:px-6 sm:py-6 ${
                      i % 2 === 1 ? "border-l border-white/10" : ""
                    } ${i > 1 ? "border-t border-white/10 lg:border-t-0" : ""} ${
                      i > 0 ? "lg:border-l lg:border-white/10" : ""
                    }`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30 sm:h-12 sm:w-12">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <span className="text-sm font-semibold leading-snug text-white sm:text-base">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal className="mt-14 max-w-xl sm:mt-20">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-8 bg-copper" />
              Why Join
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
              What You <span className="text-copper">Get</span>
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {BENEFIT_ICONS.map((Icon, i) => (
              <Reveal key={i} delay={i * 100} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-3xl bg-white p-5 shadow-[0_18px_40px_-20px_rgba(110,60,20,0.4)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-2 hover:shadow-[0_30px_55px_-22px_rgba(110,60,20,0.55)] sm:p-7">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-copper-light/20 blur-2xl transition duration-500 group-hover:scale-150 group-hover:bg-copper/30" />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30 transition duration-300 group-hover:-rotate-6 group-hover:scale-110 sm:h-14 sm:w-14">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <p className="relative mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55">
                    {c[`benefit${i + 1}_title`]}
                  </p>
                  <p className="relative mt-1 text-3xl font-bold leading-tight text-copper sm:text-4xl">
                    {c[`benefit${i + 1}_value`]}
                  </p>
                  <p className="relative mt-3 text-xs leading-relaxed text-ink/65 sm:text-sm">
                    {c[`benefit${i + 1}_text`]}
                  </p>
                  <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-copper-light via-copper to-copper-dark transition duration-500 group-hover:scale-x-100" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ranks and rewards */}
      <section id="rewards" className="relative overflow-hidden bg-night py-14 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-copper/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-copper-light/15 blur-3xl" />

        <div className="container-x relative">
          <Reveal className="max-w-xl">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
              <span className="h-px w-8 bg-copper-light" />
              Partner Rank &amp; Rewards
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-copper-light sm:text-5xl">
              Grow Higher. Earn Bigger.
            </h2>
            <p className="mt-4 text-base text-white/65">
              The more land you sell, the higher your rank. A higher rank means
              more commission, a monthly bonus and a bigger reward.
            </p>
          </Reveal>

          {/* Full chart. Scrolls sideways on phones. */}
          <Reveal className="mt-10">
            <p className="mb-3 flex items-center gap-2 text-xs text-white/50 lg:hidden">
              <MoveHorizontal className="h-4 w-4" />
              Swipe sideways to see the full chart
            </p>

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-2xl shadow-black/40">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper-light/70 to-transparent" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-copper/15 blur-3xl" />

              <div className="relative overflow-x-auto">
                <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
                  <thead>
                    <tr className="bg-black/30 text-[11px] font-semibold uppercase tracking-[0.16em] text-copper-light">
                      <th className="px-6 py-5">Rank</th>
                      <th className="px-4 py-5">Eligibility</th>
                      <th className="px-4 py-5">Personal Sales Commission</th>
                      <th className="px-4 py-5">Team Sales Defence (TSD)</th>
                      <th className="px-4 py-5">Monthly Bonus (12 months)</th>
                      <th className="px-6 py-5">Reward</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranks.map((r, i) => {
                      const top = i === ranks.length - 1;
                      const cell = `${i < ranks.length - 1 ? "border-b border-white/[0.06]" : ""} transition-colors`;
                      return (
                        <tr
                          key={r.title}
                          className={`group ${top ? "bg-gradient-to-r from-copper/20 via-copper/10 to-transparent" : "hover:bg-white/[0.04]"}`}
                        >
                          <td className={`${cell} px-6 py-5`}>
                            <span className="flex items-center gap-4">
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${rankTiers[i]} text-sm font-bold text-white shadow-lg ring-2 ring-white/15`}
                              >
                                {i + 1}
                              </span>
                              <span className="leading-tight">
                                <span className="block text-[15px] font-bold text-white">{r.title}</span>
                                {top && (
                                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-copper-light/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-copper-light">
                                    <Crown className="h-3 w-3" />
                                    Top rank
                                  </span>
                                )}
                              </span>
                            </span>
                          </td>

                          <td className={`${cell} px-4 py-5 text-sm font-medium text-white/75`}>{r.area}</td>

                          <td className={`${cell} px-4 py-5`}>
                            <span className="block text-2xl font-bold leading-none text-copper-light">
                              {r.commission}
                            </span>
                            <span className="mt-2 block h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
                              <span
                                className="block h-full rounded-full bg-gradient-to-r from-copper to-copper-light"
                                style={{ width: `${(parseFloat(r.commission) / 4) * 100}%` }}
                              />
                            </span>
                            <span className="mt-2 block text-[11px] text-white/45">{r.example}</span>
                          </td>

                          <td className={`${cell} px-4 py-5`}>
                            <span className={`block text-[15px] font-bold ${r.teamExample ? "text-white" : "text-white/50"}`}>
                              {r.team}
                            </span>
                            {r.teamExample && (
                              <span className="mt-1 block text-[11px] text-white/45">{r.teamExample}</span>
                            )}
                          </td>

                          <td className={`${cell} px-4 py-5`}>
                            <span className="block text-[15px] font-bold text-white">
                              {r.monthly.replace(" x ", " × ")}
                            </span>
                            <span className="mt-1.5 inline-flex rounded-full bg-copper/15 px-2.5 py-0.5 text-xs font-semibold text-copper-light ring-1 ring-copper/25">
                              {r.monthlyTotal}
                            </span>
                          </td>

                          <td className={`${cell} px-6 py-5`}>
                            <span className="flex items-center gap-3.5">
                              <span
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${rankTiers[i]} text-white shadow-lg ring-1 ring-white/20 transition duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                              >
                                <r.icon className="h-5 w-5" strokeWidth={1.7} />
                              </span>
                              <span className="text-sm font-semibold text-white">{r.reward}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          {/* C.T.O. bonus and notes */}
          <Reveal className="mt-8">
            <div className="flex flex-col gap-4 rounded-2xl border border-copper-light/30 bg-gradient-to-r from-[#2a2019] to-[#17110d] p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
              <span className="flex items-center gap-3 text-2xl font-bold text-copper-light sm:text-3xl">
                <Trophy className="h-7 w-7 shrink-0" />
                C.T.O. Bonus 1%
              </span>
              <ul className="space-y-1.5 text-sm text-white/75">
                {rankNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How to start */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf6ee] to-[#f6ecdc] py-14 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-copper-light/15 blur-3xl" />

        <div className="container-x relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-8 bg-copper" />
              How To Start
              <span className="h-px w-8 bg-copper" />
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
              Three Easy <span className="text-copper">Steps</span>
            </h2>
          </Reveal>

          <div className="relative mt-12 grid gap-5 sm:grid-cols-3 sm:gap-6">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 120} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-3xl bg-white p-7 pt-8 shadow-[0_18px_40px_-20px_rgba(110,60,20,0.4)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-2 hover:shadow-[0_30px_55px_-22px_rgba(110,60,20,0.55)]">
                  <span className="pointer-events-none absolute right-6 top-3 select-none text-[88px] font-bold leading-none text-copper/10 transition duration-500 group-hover:text-copper/20">
                    {i + 1}
                  </span>
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30 transition duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon className="h-7 w-7" strokeWidth={1.7} />
                  </span>
                  <h3 className="relative mt-6 font-display text-2xl font-bold text-ink">{title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-ink/65">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 flex flex-col items-center gap-4 text-center">
            <a
              href="/register"
              className="group inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-9 py-4 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-copper/40 sm:w-auto"
            >
              Join as Partner
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <p className="text-sm text-ink/60">
              Already a partner?{" "}
              <a href="/login" className="font-semibold text-copper underline-offset-4 hover:underline">
                Login here
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      <CTA c={c} partner />
      <Footer />
    </main>
  );
}
