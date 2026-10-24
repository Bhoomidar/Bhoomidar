import { Fragment } from "react";
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
  Star,
  Trophy,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import { BarsArt } from "@/components/dashboard/StatArt";
import Reveal from "@/components/Reveal";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/content";
import { rankTiers, ranks } from "@/lib/data";
import { bannerProps, isOn, lines } from "@/lib/siteContent";

// The browser tab title and the Google description come from the admin (Partner Page > Browser Title).
export async function generateMetadata() {
  const c = await getContent();
  return { title: c.partner_seo_title, description: c.partner_seo_text };
}

const BENEFIT_ICONS = [ClipboardList, Handshake, Users, Gift];

// Icons for the three small points under the banner buttons.
const STAT_ICONS = [Users, ShieldCheck, Star];

// Icons for the four boxes on the dark strip.
const TRUST = [
  { icon: Handshake },
  { icon: ChartNoAxesColumnIncreasing },
  { icon: Sprout },
  { icon: ShieldCheck },
];

const STEP_ICONS = [UserPlus, Share2, Wallet];

export default async function OpportunitiesPage() {
  const c = await getContent();
  const showStrip = isOn(c.partner_show_strip);
  const showTrust = isOn(c.partner_show_trust);

  const steps = [1, 2, 3].map((n) => ({
    icon: STEP_ICONS[n - 1],
    title: c[`partner_step${n}_title`],
    text: c[`partner_step${n}_text`],
    btn: c[`partner_step${n}_btn`],
    href: c[`partner_step${n}_link`] || "#rewards",
  }));

  return (
    <main>
      <PageBanner
        {...bannerProps(c, "partner")}
        label={c.partner_label}
        text={c.partner_text}
        // room under the three points: the dark strip below overlaps the banner by up to 5rem
        footerClassName={showStrip ? "pb-28 sm:pb-36 lg:pb-40" : "pb-10 sm:pb-14 lg:pb-16"}
        footer={
          showTrust ? (
            <ul className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:gap-0">
              {[1, 2, 3].map((n) => {
                const Icon = STAT_ICONS[n - 1];
                const value = c[`partner_stat${n}_value`];
                if (!value) return null;
                return (
                  <li
                    key={n}
                    className="flex items-center gap-3.5 sm:border-l sm:border-white/15 sm:px-8 sm:first:border-l-0 sm:first:pl-0"
                  >
                    <Icon className="h-7 w-7 shrink-0 text-copper-light" strokeWidth={1.6} />
                    <span className="leading-tight">
                      <span className="block text-lg font-bold text-white">{value}</span>
                      <span className="mt-0.5 block text-xs text-white/70">{c[`partner_stat${n}_label`]}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : undefined
        }
        actions={
          (c.partner_btn1 || c.partner_btn2) && (
            <>
              {c.partner_btn1 && (
                <a
                  href={c.partner_btn1_link || "/register"}
                  className="group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-copper/40 transition hover:-translate-y-0.5"
                >
                  {c.partner_btn1}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </a>
              )}
              {c.partner_btn2 && (
                <a
                  href={c.partner_btn2_link || "/contact"}
                  className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/60 bg-black/30 px-8 py-4 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/45"
                >
                  {c.partner_btn2} <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </>
          )
        }
      >
        {c.partner_title_1}
        <br />
        {c.partner_title_2} <span className="text-copper-light">{c.partner_title_accent}</span>
      </PageBanner>

      {/* Dark strip (overlaps the banner) + what partners get */}
      {(showStrip || isOn(c.partner_show_get)) && (
      <section className="relative z-10 bg-cream pb-14 sm:pb-20 lg:pb-24">
        {/* Blobs are clipped in their own box so the strip can overlap the banner above. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-1/2 h-96 w-96 rounded-full bg-copper-light/15 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#f0c58f]/25 blur-3xl" />
        </div>

        <div className="container-x relative">
          {showStrip && (
          <Reveal className="-mt-12 sm:-mt-20">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#241a14] via-[#1a120d] to-[#120c08] shadow-[0_34px_70px_-24px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper-light/70 to-transparent" />
              <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-copper/20 blur-3xl" />
              <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {TRUST.map(({ icon: Icon }, i) => {
                  const n = i + 1;
                  const title = c[`partner_feat${n}_title`];
                  if (!title) return null;
                  return (
                    <div
                      key={n}
                      className={`flex items-center gap-4 px-5 py-6 sm:gap-5 sm:px-7 sm:py-7 ${
                        i > 0 ? "border-t border-white/10 sm:border-t-0" : ""
                      } ${i % 2 === 1 ? "sm:border-l sm:border-white/10" : ""} ${i > 1 ? "sm:border-t sm:border-white/10 lg:border-t-0" : ""} ${
                        i > 0 ? "lg:border-l lg:border-white/10" : ""
                      }`}
                    >
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#e29a62,#a8531f_65%,#7a3a14)] text-white shadow-[0_14px_26px_-8px_rgba(140,72,33,0.8)] ring-2 ring-white/15 sm:h-16 sm:w-16">
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.7} />
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span className="block font-display text-lg font-bold text-white sm:text-xl">{title}</span>
                        <span className="mt-1.5 block text-sm leading-relaxed text-white/65">{c[`partner_feat${n}_text`]}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
          )}

          {isOn(c.partner_show_get) && (
          <>
          <Reveal className={`mx-auto max-w-2xl text-center ${showStrip ? "mt-14 sm:mt-20" : "pt-14 sm:pt-20"}`}>
            <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-copper-dark">
              <span className="h-px w-10 bg-copper" />
              {c.partner_get_label}
              <span className="h-px w-10 bg-copper" />
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
              {c.partner_get_title_1} <span className="text-copper">{c.partner_get_title_accent}</span>
            </h2>
            {c.partner_why_text && <p className="mt-4 text-base leading-relaxed text-ink/60">{c.partner_why_text}</p>}
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFIT_ICONS.map((Icon, i) => {
              const n = i + 1;
              const btn = c[`benefit${n}_btn`];
              return (
                <Reveal key={i} delay={i * 100} className="h-full">
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-white to-[#fff6ec] p-6 shadow-[0_24px_50px_-26px_rgba(110,60,20,0.45)] ring-1 ring-copper/10 transition duration-300 hover:-translate-y-2 hover:ring-copper/30 sm:p-7">
                    {/* the soft corner at the bottom right */}
                    <div className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-56 rounded-tl-[100%] bg-gradient-to-tl from-copper/[0.16] to-transparent transition duration-500 group-hover:scale-110" />

                    <div className="relative flex items-start justify-between">
                      <span className="relative flex h-[76px] w-[76px] items-center justify-center">
                        <span className="absolute -inset-3 rounded-full bg-copper/[0.08]" />
                        <span className="absolute -inset-1.5 rounded-full bg-copper/[0.12]" />
                        <span className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#e29a62,#a8531f_65%,#7a3a14)] text-white shadow-[0_16px_28px_-8px_rgba(140,72,33,0.75)] transition duration-300 group-hover:scale-105">
                          <Icon className="h-7 w-7" strokeWidth={1.7} />
                        </span>
                      </span>
                      <span className="select-none font-display text-5xl font-bold text-copper/[0.16]">0{n}</span>
                    </div>

                    <p className="relative mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/55">
                      {c[`benefit${n}_title`]}
                    </p>
                    <p className="relative mt-1.5 text-3xl font-extrabold leading-tight text-[#a8531f] sm:text-4xl">
                      {c[`benefit${n}_value`]}
                    </p>
                    <p className="relative mt-3 flex-1 text-sm leading-relaxed text-ink/65">{c[`benefit${n}_text`]}</p>

                    {btn && (
                      <a
                        href={c[`benefit${n}_link`] || "#rewards"}
                        className="relative mt-6 inline-flex w-fit items-center gap-3 rounded-full border border-copper/70 bg-white/60 px-5 py-2.5 text-sm font-semibold text-copper-dark transition hover:bg-copper hover:text-white"
                      >
                        {btn}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </a>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
          </>
          )}
        </div>
      </section>
      )}

      {/* Ranks and rewards */}
      {isOn(c.partner_show_ranks) && (
      <section id="rewards" className="relative overflow-hidden bg-gradient-to-b from-[#fdf6ea] to-[#f9efe0] py-14 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute -left-44 top-10 h-[28rem] w-[28rem] rounded-full border-[48px] border-copper/[0.045]" />
        <div className="pointer-events-none absolute -right-44 bottom-10 h-[28rem] w-[28rem] rounded-full border-[48px] border-copper/[0.045]" />

        <div className="container-x relative">
          <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="max-w-2xl">
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
                <span className="h-px w-8 bg-copper" />
                {c.partner_rank_label}
              </p>
              <h2 className="mt-4 font-display text-4xl font-bold leading-[1.15] text-ink sm:text-5xl">
                {c.partner_rank_title_1} <span className="text-copper">{c.partner_rank_title_accent}</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink/65">{c.partner_rank_text}</p>
            </div>

            {/* small card on the right */}
            <div className="relative hidden shrink-0 items-center gap-5 overflow-hidden rounded-3xl bg-white/70 px-6 py-5 shadow-[0_20px_44px_-26px_rgba(110,60,20,0.45)] ring-1 ring-copper/15 backdrop-blur lg:flex lg:w-[420px]">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper ring-1 ring-copper/20">
                <Crown className="h-7 w-7" strokeWidth={1.6} />
              </span>
              <span className="relative z-10 leading-tight">
                <span className="block font-display text-lg font-bold text-ink">{c.partner_rank_card_title_1}</span>
                <span className="block font-display text-lg font-bold text-ink">{c.partner_rank_card_title_2}</span>
                <span className="mt-2 block max-w-[210px] text-xs leading-relaxed text-ink/60">{c.partner_rank_card_text}</span>
              </span>
              <BarsArt className="pointer-events-none absolute -bottom-1 right-2 h-24 w-28 text-copper-light/70" />
            </div>
          </Reveal>

          {/* Full chart. Scrolls sideways on phones. */}
          <Reveal className="mt-10">
            <p className="mb-3 flex items-center gap-2 text-xs text-ink/50 lg:hidden">
              <MoveHorizontal className="h-4 w-4" />
              Swipe sideways to see the full chart
            </p>

            <div className="relative overflow-hidden rounded-3xl bg-white/60 shadow-[0_30px_60px_-30px_rgba(110,60,20,0.45)] ring-1 ring-copper/15 backdrop-blur">
              <div className="relative overflow-x-auto">
                <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
                  <thead>
                    <tr className="text-[11px] font-bold uppercase tracking-[0.16em] text-copper-dark">
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
                      const cell = `border-t border-black/[0.06] transition-colors`;
                      return (
                        <tr
                          key={r.title}
                          className={`group ${top ? "bg-gradient-to-r from-amber-100/80 via-amber-50/70 to-transparent" : "hover:bg-white/80"}`}
                        >
                          <td className={`${cell} px-6 py-4`}>
                            <span className="flex items-center gap-4">
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${rankTiers[i]} text-sm font-bold text-white shadow-md ring-2 ring-white`}
                              >
                                {i + 1}
                              </span>
                              <span className="leading-tight">
                                <span className="block text-[15px] font-bold text-ink">{r.title}</span>
                                {top && (
                                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-copper/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-copper-dark">
                                    <Crown className="h-3 w-3" />
                                    Top rank
                                  </span>
                                )}
                              </span>
                            </span>
                          </td>

                          <td className={`${cell} px-4 py-4 text-sm font-medium text-ink/75`}>{r.area}</td>

                          <td className={`${cell} px-4 py-4`}>
                            <span className="block text-2xl font-bold leading-none text-copper">
                              {r.commission}
                            </span>
                            <span className="mt-2 block h-1.5 w-28 overflow-hidden rounded-full bg-black/10">
                              <span
                                className="block h-full rounded-full bg-gradient-to-r from-copper to-copper-light"
                                style={{ width: `${(parseFloat(r.commission) / 4) * 100}%` }}
                              />
                            </span>
                            <span className="mt-2 block text-[11px] text-ink/50">{r.example}</span>
                          </td>

                          <td className={`${cell} px-4 py-4`}>
                            <span className={`block text-[15px] font-bold ${r.teamExample ? "text-ink" : "text-ink/50"}`}>
                              {r.team}
                            </span>
                            {r.teamExample && (
                              <span className="mt-1 block text-[11px] text-ink/50">{r.teamExample}</span>
                            )}
                          </td>

                          <td className={`${cell} px-4 py-4`}>
                            <span className="block text-[15px] font-bold text-ink">
                              {r.monthly.replace(" x ", " × ")}
                            </span>
                            <span className="mt-1.5 inline-flex rounded-full bg-copper/10 px-2.5 py-0.5 text-xs font-semibold text-copper-dark ring-1 ring-copper/25">
                              {r.monthlyTotal}
                            </span>
                          </td>

                          <td className={`${cell} px-6 py-4`}>
                            <span className="flex items-center gap-3.5">
                              <span
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${rankTiers[i]} text-white shadow-md ring-2 ring-white transition duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                              >
                                <r.icon className="h-5 w-5" strokeWidth={1.7} />
                              </span>
                              <span className="text-sm font-semibold text-ink">{r.reward}</span>
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
          {(c.partner_rank_cto || lines(c.partner_rank_notes).length > 0) && (
          <Reveal className="mt-6">
            <div className="flex flex-col gap-4 rounded-2xl bg-white/70 p-5 shadow-[0_20px_44px_-26px_rgba(110,60,20,0.4)] ring-1 ring-copper/20 backdrop-blur sm:flex-row sm:items-center sm:gap-8 sm:px-8 sm:py-5">
              <span className="flex items-center gap-4 font-display text-2xl font-bold text-copper-dark sm:text-3xl">
                <Trophy className="h-9 w-9 shrink-0 text-copper-dark" strokeWidth={1.5} />
                {c.partner_rank_cto}
              </span>
              <span className="hidden h-12 w-px bg-black/10 sm:block" />
              <ul className="space-y-1 text-sm text-ink/70">
                {lines(c.partner_rank_notes).map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          )}
        </div>
      </section>
      )}

      {/* How to start */}
      {isOn(c.partner_show_start) && (
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fdf8f1] to-[#fbf0e2] py-14 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute -left-40 -top-10 h-[26rem] w-[26rem] rounded-full border-[44px] border-copper/[0.045]" />
        <div className="pointer-events-none absolute -right-44 bottom-0 h-[26rem] w-[26rem] rounded-full border-[44px] border-copper/[0.045]" />

        <div className="container-x relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-10 bg-copper" />
              {c.partner_start_label}
              <span className="h-px w-10 bg-copper" />
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
              {c.partner_start_title_1} <span className="text-copper">{c.partner_start_title_accent}</span>
            </h2>
            {c.partner_start_text && <p className="mt-4 text-base leading-relaxed text-ink/60">{c.partner_start_text}</p>}
          </Reveal>

          <div className="relative mt-12 grid gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:gap-0">
            {steps.map(({ icon: Icon, title, text, btn, href }, i) => (
              <Fragment key={i}>
                <Reveal delay={i * 120} className="h-full">
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-white to-[#fff6ec] p-7 shadow-[0_26px_50px_-28px_rgba(110,60,20,0.5)] ring-1 ring-copper/10 transition duration-300 hover:-translate-y-2 hover:ring-copper/30 sm:p-8">
                    {/* the soft corner at the bottom right */}
                    <div className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-60 rounded-tl-[100%] bg-gradient-to-tl from-copper/[0.18] to-transparent transition duration-500 group-hover:scale-110" />

                    <div className="relative flex items-start justify-between">
                      <span className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-[0_16px_28px_-10px_rgba(140,72,33,0.75)] transition duration-300 group-hover:-rotate-6 group-hover:scale-105">
                        <Icon className="h-8 w-8" strokeWidth={1.6} />
                      </span>
                      <span className="select-none font-display text-6xl font-bold text-copper/[0.14]">0{i + 1}</span>
                    </div>

                    <h3 className="relative mt-6 font-display text-3xl font-bold text-ink">{title}</h3>
                    <p className="relative mt-3 flex-1 text-[15px] leading-relaxed text-ink/65">{text}</p>

                    {btn && (
                      <a
                        href={href}
                        className="relative mt-6 inline-flex w-fit items-center gap-3 rounded-full border border-copper/70 bg-white/60 px-6 py-2.5 text-sm font-semibold text-copper-dark transition hover:bg-copper hover:text-white"
                      >
                        {btn}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </a>
                    )}
                  </div>
                </Reveal>

                {/* dashed link with an arrow, to the next step */}
                {i < steps.length - 1 && (
                  <div aria-hidden className="relative hidden w-20 items-center justify-center lg:flex xl:w-24">
                    <svg viewBox="0 0 80 160" fill="none" className="absolute inset-y-6 left-0 h-[calc(100%-3rem)] w-full">
                      <path d="M0 40C34 52 38 74 40 80S46 108 80 124" stroke="#b5622f" strokeOpacity="0.55" strokeWidth="1.6" strokeDasharray="4 5" strokeLinecap="round" />
                    </svg>
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-copper shadow-[0_10px_24px_-8px_rgba(110,60,20,0.5)] ring-1 ring-copper/20">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {(c.partner_join_btn || c.partner_login_text) && (
          <Reveal className="mt-14 flex flex-col items-center gap-5 text-center">
            {c.partner_join_btn && (
            <div className="relative">
              <svg viewBox="0 0 40 40" fill="none" aria-hidden className="pointer-events-none absolute -left-14 top-1/2 hidden h-10 w-10 -translate-y-1/2 sm:block">
                <path d="M30 6 22 14M36 20H24M30 34l-8-8" stroke="#d98b52" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <svg viewBox="0 0 40 40" fill="none" aria-hidden className="pointer-events-none absolute -right-14 top-1/2 hidden h-10 w-10 -translate-y-1/2 sm:block">
                <path d="M10 6l8 8M4 20h12M10 34l8-8" stroke="#d98b52" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <a
                href={c.partner_join_link || "/register"}
                className="group inline-flex w-full items-center justify-center gap-4 rounded-2xl bg-gradient-to-b from-copper-light to-copper-dark px-12 py-4 text-lg font-semibold text-white shadow-[0_24px_44px_-14px_rgba(140,72,33,0.7)] transition hover:-translate-y-0.5 sm:w-auto"
              >
                {c.partner_join_btn}
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </a>
            </div>
            )}

            {c.partner_login_text && (
            <p className="flex items-center gap-4 text-sm text-ink/60">
              <span className="hidden h-px w-14 bg-black/10 sm:block" />
              <span>
                {c.partner_login_text}{" "}
                {c.partner_login_link_text && (
                  <a href={c.partner_login_link || "/login"} className="font-semibold text-copper-dark underline-offset-4 hover:underline">
                    {c.partner_login_link_text}
                  </a>
                )}
              </span>
              <span className="hidden h-px w-14 bg-black/10 sm:block" />
            </p>
            )}
          </Reveal>
          )}
        </div>
      </section>
      )}

      {isOn(c.partner_show_cta) && <CTA c={c} partner />}
      <Footer />
    </main>
  );
}
