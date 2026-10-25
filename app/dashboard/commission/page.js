import Image from "next/image";
import {
  ArrowRight,
  Banknote,
  BadgeCheck,
  CalendarClock,
  Check,
  ChevronRight,
  CircleHelp,
  Clock,
  Coins,
  Crown,
  FileCheck2,
  FileText,
  Gift,
  Handshake,
  Info,
  Lock,
  Network,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Target,
  Trophy,
  UserRound,
  Wallet,
  Users,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import PointsHistory from "@/components/dashboard/PointsHistory";
import {
  BarsArt,
  ClipboardArt,
  CoinPileArt,
  GiftArt,
  HouseArt,
  OrgChartArt,
  VioletGiftArt,
} from "@/components/dashboard/StatArt";
import { getCurrentPartner } from "@/lib/profile";
import { getPartnerCommission } from "@/lib/commission";
import { fmtArea, fmtDate, fmtPoints } from "@/lib/points";
import { rankTiers } from "@/lib/data";
import { rewardIcon } from "@/lib/rankIcons";
import RewardPic from "@/components/RewardPic";

export const metadata = { title: "Commission | Bhoomidar" };

const SAMPLE_SALE = 1000000; // the example sale used in the explanations: Rs 10 lakh

const card =
  "rounded-3xl bg-white p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7";

export default async function CommissionPage() {
  const partner = await getCurrentPartner();

  if (partner.pending) {
    return (
      <div>
        <Heading />
        <Reveal className="mt-8">
          <div className="relative overflow-hidden rounded-3xl bg-white px-7 py-16 text-center shadow-[0_24px_50px_-24px_rgba(110,60,20,0.4)] ring-1 ring-black/5 sm:px-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-copper-light/20 blur-3xl" />
            <span className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30 ring-8 ring-copper/10">
              <Lock className="h-9 w-9" />
            </span>
            <h2 className="relative mt-6 font-display text-3xl font-bold text-ink">Opens after activation</h2>
            <p className="relative mx-auto mt-3 max-w-md text-base leading-relaxed text-ink/65">
              Your commission points, rank and rewards show here once your joining payment is received and your account is activated.
            </p>
          </div>
        </Reveal>
      </div>
    );
  }

  const c = await getPartnerCommission(partner.user.id);
  const rankIndex = Math.max(0, (c.rank?.no ?? 1) - 1);
  const RankIcon = c.rank?.icon ? rewardIcon(c.rank.icon) : Trophy;
  const tier = rankTiers[rankIndex % rankTiers.length];
  const nextTier = c.next ? rankTiers[(c.next.no - 1) % rankTiers.length] : tier;

  // Where the points came from.
  const sum = (kinds) => c.ledger.filter((e) => kinds.includes(e.kind)).reduce((t, e) => t + e.points, 0);
  const parts = [
    { label: "Your own sales", value: sum(["sale"]), bar: "bg-emerald-500", dot: "bg-emerald-500" },
    { label: "Your team's sales", value: sum(["team"]), bar: "bg-sky-500", dot: "bg-sky-500" },
    { label: "Monthly bonus", value: sum(["monthly"]), bar: "bg-violet-500", dot: "bg-violet-500" },
    { label: "Other", value: sum(["cto", "adjustment", "reversal"]), bar: "bg-amber-400", dot: "bg-amber-400" },
  ];
  const positive = parts.map((p) => ({ ...p, share: Math.max(0, p.value) }));
  const shareTotal = positive.reduce((t, p) => t + p.share, 0);

  // One timeline: points in and points paid out, with the balance after each line.
  const timeline = [
    ...c.ledger.map((e) => ({ id: e.id, kind: e.kind, points: e.points, note: e.note, from: e.from, rate: e.rate, at: e.at })),
    ...c.payouts.map((p) => ({
      id: `p-${p.id}`,
      kind: "payout",
      points: -p.points,
      note: p.note ? `Paid by our team · ${p.note}` : "Paid by our team",
      from: "",
      rate: null,
      at: p.at,
    })),
  ].sort((a, b) => new Date(a.at) - new Date(b.at));
  let running = 0;
  for (const row of timeline) {
    running += row.points;
    row.balance = running;
  }
  timeline.reverse();

  // The examples, worked out with the partner's own rate.
  const baseRate = c.plan[0]?.rate ?? 2;
  const myRate = c.rank?.rate ?? baseRate;
  const own = Math.round((SAMPLE_SALE * myRate) / 100);
  const teamDiff = Math.max(0, myRate - baseRate);
  const team = Math.round((SAMPLE_SALE * teamDiff) / 100);
  const monthsDone = Math.min(c.monthsPaid, 12);
  const monthOf = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).slice(0, 7);
  const thisMonth = monthOf(new Date());
  const monthPoints = c.ledger.filter((e) => monthOf(e.at) === thisMonth).reduce((t, e) => t + e.points, 0);

  const steps = [
    { icon: FileText, art: Handshake, title: "A sale happens", text: "You or someone in your team sells land." },
    { icon: ShieldCheck, art: FileCheck2, title: "We confirm it", text: "Our team checks the sale and records it." },
    { icon: Coins, art: Coins, title: "Points are added", text: "Commission points land here. 1 point = ₹1." },
    { icon: Wallet, art: Wallet, title: "We pay you", text: "Our team pays your points and marks them as paid." },
  ];

  return (
    <div className="space-y-8">
      <Heading />

      {/* Balance, and where the points came from */}
      <div className="fade-up relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7 lg:min-h-[250px]">
          <CoinPileArt className="pointer-events-none absolute right-2 top-5 hidden h-48 w-64 sm:block" />

          <div className="relative flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
              <Wallet className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="pt-1 text-xs font-semibold uppercase tracking-[0.16em] text-copper">Points you can get paid</p>
              <p className="mt-2 bg-gradient-to-b from-[#9a5126] to-[#4f230c] bg-clip-text text-6xl font-extrabold tabular-nums leading-none tracking-tight text-transparent sm:text-7xl">
                {fmtPoints(c.balance)}
              </p>
              <p className="mt-3 text-sm font-semibold text-ink/75">
                = ₹{fmtPoints(c.balance)} <span className="font-normal text-ink/50">(1 point = ₹1)</span>
              </p>
            </div>
          </div>

        </section>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7">
          <ClipboardArt className="pointer-events-none absolute -bottom-3 -right-2 hidden h-56 w-60 opacity-90 sm:block" />

          <div className="relative flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-copper shadow-md ring-1 ring-black/5">
              <Clock className="h-5 w-5" />
            </span>
            <h2 className="min-w-0 font-display text-xl font-bold text-ink sm:text-2xl">Where your points came from</h2>
          </div>

          {shareTotal > 0 ? (
            <div className="relative mt-6 sm:max-w-[60%]">
              <div className="flex h-3.5 overflow-hidden rounded-full bg-black/10">
                {positive
                  .filter((p) => p.share > 0)
                  .map((p) => (
                    <span key={p.label} className={`h-full ${p.bar}`} style={{ width: `${(p.share / shareTotal) * 100}%` }} />
                  ))}
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
                {parts.map((p) => (
                  <li key={p.label} className="flex items-center gap-2.5">
                    <span className={`h-3 w-3 shrink-0 rounded-full ${p.dot}`} />
                    <span className="min-w-0 leading-tight">
                      <span className="block text-sm font-extrabold tabular-nums text-ink">{fmtPoints(p.value)}</span>
                      <span className="block [overflow-wrap:anywhere] text-[11px] text-ink/55">{p.label}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="relative mt-5 max-w-[24rem] text-sm sm:mt-8 leading-relaxed text-ink/60 sm:max-w-[58%]">
              No points yet. When a sale made by you or your team is confirmed, you will see here exactly where your
              points came from.
            </p>
          )}
        </section>
      </div>

      {/* How it works */}
      <Reveal>
        <section className={card}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="min-w-0 whitespace-nowrap font-display text-2xl font-bold text-ink sm:text-3xl">
              How you <span className="text-copper">earn</span>
            </h2>
            <a
              href="/opportunities#rewards"
              className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-copper-dark shadow-sm ring-1 ring-copper/25 transition hover:bg-copper hover:text-white hover:ring-copper sm:px-4"
            >
              Learn more
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
          </div>

          <ol className="mt-6 grid grid-cols-1 gap-x-3 gap-y-7 sm:mt-7 sm:grid-cols-2 sm:gap-y-8 xl:grid-cols-4">
            {steps.map(({ icon: Icon, art: Art, title, text }, i) => (
              <li key={title} className="relative">
                {/* the number, and a dotted arrow to the next one */}
                <span className="absolute left-1/2 top-0 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-sm font-bold text-white shadow-md shadow-copper/30 ring-4 ring-white">
                  {i + 1}
                </span>
                {i < steps.length - 1 && (
                  <span className="pointer-events-none absolute left-[calc(50%+34px)] top-0 z-10 hidden h-0 w-[calc(100%+12px-68px)] -translate-y-1/2 items-center xl:flex">
                    <span className="h-0 flex-1 border-t-2 border-dotted border-copper/45" />
                    <ArrowRight className="-ml-1 h-3.5 w-3.5 text-copper/60" />
                  </span>
                )}

                <div className="relative flex h-full items-start gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#fff0e0] to-white px-4 pb-4 pt-8 ring-1 ring-copper/15 sm:block sm:px-5 sm:pb-5 sm:pt-9">
                  <Art className="pointer-events-none absolute -right-2 top-4 h-20 w-20 text-copper/[0.14] sm:right-3 sm:top-5 sm:h-28 sm:w-28 sm:text-copper/[0.17]" strokeWidth={1.1} />
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30 sm:h-14 sm:w-14">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <div className="relative min-w-0 flex-1 sm:static">
                    <p className="relative text-base font-bold text-ink sm:mt-4">{title}</p>
                    <p className="relative mt-1 text-sm leading-relaxed text-ink/60 sm:mt-1.5 sm:max-w-[15rem]">{text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      {/* Rank and monthly bonus */}
      <Reveal>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr]">
          {/* your rank */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-5 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7">
            <div
              className="pointer-events-none absolute right-0 top-0 hidden h-[190px] w-[48%] sm:block"
              style={{
                maskImage: "linear-gradient(to right, transparent, #000 50%), linear-gradient(to bottom, #000 65%, transparent)",
                WebkitMaskImage: "linear-gradient(to right, transparent, #000 50%), linear-gradient(to bottom, #000 65%, transparent)",
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
              aria-hidden
            >
              <Image
                src="/images/villa.png"
                alt=""
                fill
                sizes="30vw"
                className="object-cover"
                style={{ objectPosition: "60% 40%", filter: "saturate(0.8) sepia(0.15) brightness(1.08) contrast(0.95)" }}
              />
              <div className="absolute inset-0 bg-[#fff3e3]/20" />
            </div>

            <div className="relative flex items-center gap-4 sm:gap-5">
              <span className={`flex h-16 w-16 shrink-0 sm:h-[88px] sm:w-[88px] items-center justify-center rounded-2xl bg-gradient-to-br ${tier} text-white shadow-xl ring-4 ring-white sm:rounded-3xl`}>
                <Crown className="h-8 w-8 sm:h-11 sm:w-11" strokeWidth={1.6} />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/55">Your rank</p>
                <h2 className="mt-1 [overflow-wrap:anywhere] font-display text-2xl font-bold text-ink sm:text-4xl">{c.rank?.title}</h2>
                <p className="mt-1.5 text-sm text-ink/60">
                  You earn <b className="text-copper">{c.rank?.rate}%</b> on your own sales
                  {c.rankSince && <> · since {fmtDate(c.rankSince)}</>}
                </p>
              </div>
            </div>

            {/* the rate, as a badge */}
            <span className="absolute right-6 top-[5.4rem] z-10 hidden h-24 w-24 flex-col items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-center text-white shadow-xl shadow-copper/40 ring-[5px] ring-[#f3d4b0] sm:flex">
              <span className="absolute inset-1 rounded-full border border-dashed border-white/50" />
              <span className="relative text-2xl font-extrabold leading-none">{c.rank?.rate}%</span>
              <span className="relative mt-1 text-[10px] font-medium">Your rate</span>
            </span>

            <div className="relative mt-5 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 sm:mt-6 sm:p-5">
              {c.next ? (
                <>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:pr-24">
                    <span className="flex items-center gap-3.5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
                        <Target className="h-6 w-6" />
                      </span>
                      <span className="leading-tight">
                        <span className="block text-xs text-ink/55">Next rank</span>
                        <span className="mt-0.5 block text-lg font-bold text-ink">{c.next.title}</span>
                      </span>
                    </span>
                    <span className="rounded-full bg-[#fdeab8] px-3.5 py-1.5 text-xs font-bold text-amber-800">
                      {c.next.rate}% commission
                    </span>
                    <span className="inline-flex items-center gap-2 text-xs text-ink/70">
                      <Gift className="h-4 w-4 text-copper" />
                      Reward: <b className="text-ink">{c.next.reward}</b>
                    </span>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/10">
                    <div className={`h-full rounded-full bg-gradient-to-r from-copper to-copper-light`} style={{ width: `${Math.max(c.progress, 8)}%` }} />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-3 text-xs">
                    <b className="text-ink">{fmtArea(c.areaToNext)} sq. yards to go</b>
                    <span className="text-ink/50">
                      {fmtArea(c.teamArea)} of {fmtArea(c.next.minArea)} sq. yd sold
                    </span>
                  </div>
                  <p className="mt-3.5 flex items-center gap-2.5 rounded-xl bg-[#fde8da] px-3.5 py-2.5 text-xs text-ink/65">
                    <UserRound className="h-4 w-4 shrink-0 text-copper" />
                    Your rank grows with the land sold by you and everyone in your team together.
                  </p>
                </>
              ) : (
                <p className="flex items-center gap-2 text-sm font-semibold text-copper">
                  <Trophy className="h-4 w-4" />
                  You are at the top rank. Congratulations!
                </p>
              )}
            </div>
          </section>

          {/* monthly bonus */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-5 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7">
            <GiftArt className="pointer-events-none absolute -bottom-2 -right-2 hidden h-40 w-52 sm:block" />

            <div className="relative flex flex-col items-start gap-3.5 sm:flex-row sm:justify-between sm:gap-3">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fde0d0] text-copper shadow-sm">
                  <Gift className="h-6 w-6" />
                </span>
                <div className="min-w-0 leading-tight">
                  <h2 className="font-display text-2xl font-bold text-ink">Monthly bonus</h2>
                  <p className="mt-1 text-xs text-ink/55">For 12 months after you reach a rank</p>
                </div>
              </div>
              <a
                href="/opportunities#rewards"
                className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-copper-dark shadow-sm ring-1 ring-copper/25 transition hover:bg-copper hover:text-white hover:ring-copper"
              >
                View details
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </a>
            </div>

            <p className="relative mt-5 flex items-baseline gap-2 text-4xl font-extrabold tabular-nums text-ink">
              {fmtPoints(c.rank?.monthlyBonus)}
              <span className="text-sm font-semibold text-ink/50">points a month</span>
            </p>

            <ul className="relative mt-5 grid max-w-[22rem] grid-cols-6 justify-items-center gap-2 sm:gap-2.5">
              {Array.from({ length: 12 }, (_, i) => {
                const done = i < monthsDone;
                const now = i === monthsDone && monthsDone < 12;
                return (
                  <li key={i}>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold sm:h-10 sm:w-10 ${
                        done || now
                          ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                          : "bg-[#ece5dc] text-ink/45"
                      } ${now ? "ring-4 ring-copper/20" : ""}`}
                    >
                      {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="relative mt-5 flex items-center gap-3.5 rounded-2xl bg-white/80 p-3.5 ring-1 ring-black/5 sm:max-w-[20rem]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-copper shadow-sm ring-1 ring-black/5">
                <CalendarClock className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold text-ink">{monthsDone} of 12 months credited.</span>
                <span className="mt-0.5 block text-xs text-ink/55">Our team adds each month&apos;s bonus to your points.</span>
              </span>
            </div>
          </section>
        </div>
      </Reveal>

      {/* The four numbers */}
      <Reveal>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { icon: Coins, art: BarsArt, value: fmtPoints(c.earned), label: "Total earned", hint: "All the points you have earned so far.", bg: "from-[#e1f7ec] to-white", chip: "bg-emerald-100 text-emerald-600", artTone: "text-emerald-500" },
            { icon: Wallet, art: Wallet, value: fmtPoints(c.paid), label: "Points redeemed", hint: "Points our team has already paid you.", bg: "from-[#ffeadf] to-white", chip: "bg-[#fdd9c6] text-copper", artTone: "text-copper" },
            { icon: Users, art: BarsArt, value: `${fmtArea(c.teamArea)} sq. yd`, label: "Land sold by team", hint: "Land sold by you and your whole team.", bg: "from-[#e4f0ff] to-white", chip: "bg-sky-100 text-sky-600", artTone: "text-sky-500" },
            { icon: Star, art: Crown, value: fmtPoints(monthPoints), label: "Current month points", hint: "Points you earned this month.", bg: "from-[#efe8ff] to-white", chip: "bg-violet-100 text-violet-600", artTone: "text-violet-500" },
          ].map(({ icon: Icon, art: Art, value, label, hint, bg, chip, artTone }) => (
            <div key={label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bg} p-4 shadow-[0_14px_30px_-22px_rgba(110,60,20,0.5)] ring-1 ring-black/5`}>
              <Art className={`pointer-events-none absolute right-3 top-3 h-12 w-12 opacity-20 sm:bottom-2 sm:top-auto sm:h-14 sm:w-14 ${artTone}`} strokeWidth={1.3} />
              <div className="relative flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-3.5">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${chip}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block [overflow-wrap:anywhere] text-2xl font-extrabold tabular-nums text-ink">{value}</span>
                  <span className="mt-1 flex items-start gap-1.5 text-xs text-ink/60 sm:mt-0.5 sm:items-center">
                    {label}
                    <Info className="h-3.5 w-3.5 shrink-0 cursor-help text-ink/35">
                      <title>{hint}</title>
                    </Info>
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* The rules in plain words */}
      <Reveal>
        <section className={card}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-start gap-3 font-display text-2xl font-bold text-ink sm:items-center sm:text-3xl">
                <CircleHelp className="mt-1 h-6 w-6 shrink-0 text-copper sm:mt-0 sm:h-7 sm:w-7" />
                <span>
                  How your commission is <span className="text-copper">worked out</span>
                </span>
              </h2>
              <p className="mt-1.5 text-sm text-ink/55">Examples use a sale of ₹10,00,000 and your current rank.</p>
            </div>
            <a
              href="/opportunities#rewards"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-copper-dark shadow-sm ring-1 ring-copper/25 transition hover:bg-copper hover:text-white hover:ring-copper"
            >
              Learn more
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* 1: your own sale */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e3f7ec] to-white p-5 ring-1 ring-emerald-200/60">
              <CoinPileArt className="pointer-events-none absolute -bottom-2 -right-2 hidden h-28 w-36 sm:block" />
              <div className="relative flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 text-sm font-bold text-white shadow-md shadow-emerald-500/30">1</span>
                <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-800">Your own sale</span>
              </div>
              <p className="relative mt-4 text-sm leading-relaxed text-ink/70">
                You get your rank&apos;s percentage of the sale value. As <b className="text-ink">{c.rank?.title}</b> that is{" "}
                <b className="text-emerald-700">{myRate}%</b>.
              </p>
              <p className="relative mt-4 w-fit max-w-full rounded-xl sm:max-w-[75%] bg-white px-4 py-3 text-sm text-ink/75 shadow-sm ring-1 ring-black/5">
                ₹10,00,000 × {myRate}% = <b className="text-emerald-700">{fmtPoints(own)} points</b>
              </p>
            </div>

            {/* 2: your team's sale */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e6f1ff] to-white p-5 ring-1 ring-sky-200/60">
              <OrgChartArt className="pointer-events-none absolute right-3 top-3 hidden h-20 w-24 text-sky-400/30 sm:block" />
              <div className="relative flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-sky-400 to-sky-600 text-sm font-bold text-white shadow-md shadow-sky-500/30">2</span>
                <span className="rounded-full bg-sky-100 px-4 py-1.5 text-sm font-bold text-sky-800">Your team&apos;s sale</span>
              </div>
              <p className="relative mt-4 text-sm leading-relaxed text-ink/70 sm:pr-16">
                When someone in your team sells, you get the <b className="text-ink">difference</b> between your rate and theirs, if your rank is higher.
              </p>
              <p className="relative mt-4 flex items-center gap-3 rounded-xl bg-white px-3.5 py-3 text-sm text-ink/75 shadow-sm ring-1 ring-black/5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                  <Users className="h-[18px] w-[18px]" />
                </span>
                <span>
                  {teamDiff > 0 ? (
                    <>
                      A new partner ({baseRate}%) sells: ₹10,00,000 × {Number(teamDiff.toFixed(3))}% ={" "}
                      <b className="text-sky-700">{fmtPoints(team)} points</b>
                    </>
                  ) : (
                    <>
                      Reach <b className="text-ink">Sales Associate</b> to start earning on your team&apos;s sales.
                    </>
                  )}
                </span>
              </p>
            </div>

            {/* 3: monthly bonus */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#efe7ff] to-white p-5 ring-1 ring-violet-200/60">
              <VioletGiftArt className="pointer-events-none absolute -bottom-1 -right-1 hidden h-28 w-28 sm:block" />
              <div className="relative flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-violet-400 to-violet-600 text-sm font-bold text-white shadow-md shadow-violet-500/30">3</span>
                <span className="rounded-full bg-violet-100 px-4 py-1.5 text-sm font-bold text-violet-800">Monthly bonus</span>
              </div>
              <p className="relative mt-4 text-sm leading-relaxed text-ink/70">
                Every rank gives a fixed bonus each month for 12 months, plus a reward when you reach it.
              </p>
              <p className="relative mt-4 w-fit max-w-full rounded-xl sm:max-w-[75%] bg-white px-4 py-3 text-sm text-ink/75 shadow-sm ring-1 ring-black/5">
                {c.rank?.title}: <b className="text-violet-700">{fmtPoints(c.rank?.monthlyBonus)} × 12</b> ={" "}
                {fmtPoints((c.rank?.monthlyBonus ?? 0) * 12)} points
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* History */}
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-5 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7">
          <ClipboardArt className="pointer-events-none absolute right-36 top-0 hidden h-36 w-40 opacity-50 lg:block" />
          <CoinPileArt className="pointer-events-none absolute right-4 top-1 hidden h-40 w-52 sm:block" />

          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
              Points <span className="text-copper">history</span>
            </h2>
            <p className="mt-1.5 text-sm text-ink/55 sm:text-base">Every point that came in or was redeemed, newest first.</p>
          </div>
          <div className="relative mt-6">
            <PointsHistory rows={timeline} />
          </div>
        </section>
      </Reveal>

      {/* Rewards and sales */}
      <Reveal>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className={card}>
            <div className="flex flex-col items-start gap-3.5 sm:flex-row sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-3xl font-bold text-ink">
                  Your <span className="text-copper">rewards</span>
                </h2>
                <p className="mt-1.5 text-sm text-ink/55">Unlock exciting rewards as you grow in rank.</p>
              </div>
              <a
                href="/opportunities#rewards"
                className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-copper-dark shadow-sm ring-1 ring-copper/25 transition hover:bg-copper hover:text-white hover:ring-copper"
              >
                View all rewards
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </a>
            </div>

            <ul className="mt-5 space-y-3">
              {c.rewards.map((r) => (
                <li
                  key={r.no}
                  className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-gradient-to-r from-white to-[#fff8ef] p-3.5 shadow-sm ring-1 ring-black/5"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#f7c85a] to-[#d79a1c] text-white shadow-md">
                    <RewardPic image={r.image} icon={r.icon} alt={r.reward} iconClassName="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1 basis-40 leading-tight">
                    <span className="block [overflow-wrap:anywhere] text-base font-bold text-ink">{r.reward}</span>
                    <span className="mt-1 block [overflow-wrap:anywhere] text-sm text-ink/55">{r.title}</span>
                  </span>
                  {r.given ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      Received
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#fdeab8] px-3.5 py-1.5 text-xs font-bold text-amber-800">
                      <Clock className="h-3.5 w-3.5" />
                      On the way
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {c.next && (
              <a
                href="/opportunities#rewards"
                className="group mt-3 flex items-center gap-3 rounded-2xl border-2 border-dashed border-copper/30 px-4 py-3.5 text-sm text-ink/60 transition hover:border-copper/60 hover:bg-copper/5"
              >
                <Lock className="h-5 w-5 shrink-0 text-copper/70" />
                <span className="min-w-0 flex-1">
                  Next reward: <b className="text-ink">{c.next.reward}</b> at {c.next.title}
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-ink/40 transition group-hover:translate-x-0.5 group-hover:text-copper" />
              </a>
            )}
          </section>

          <section id="your-sales" className={`${card} scroll-mt-24`}>
            <div className="flex flex-col items-start gap-3.5 sm:flex-row sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-3xl font-bold text-ink">
                  Your <span className="text-copper">sales</span>
                </h2>
                <p className="mt-1.5 text-sm text-ink/55">All the land sales made through you.</p>
              </div>
              <a
                href="#your-sales"
                className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-copper-dark shadow-sm ring-1 ring-copper/25 transition hover:bg-copper hover:text-white hover:ring-copper"
              >
                View all sales
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </a>
            </div>

            {c.sales.length === 0 ? (
              <div className="flex flex-col items-center justify-center pb-2 pt-6 text-center">
                <HouseArt className="h-28 w-40" />
                <p className="mt-2 text-lg font-bold text-ink">No sales yet</p>
                <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-ink/55">
                  When our team confirms a sale made through you, it shows up here.
                </p>
                <a
                  href="/dashboard/network"
                  className="group mt-5 inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5"
                >
                  <Share2 className="h-4 w-4" />
                  Start sharing your code
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </a>
              </div>
            ) : (
              <>
              <ul className="mt-4 space-y-3 sm:hidden">
                {c.sales.map((s) => (
                  <li key={s.id} className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10 ${s.status === "cancelled" ? "opacity-50" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0 [overflow-wrap:anywhere] text-[15px] font-bold leading-snug text-ink">{s.title}</span>
                      {s.status === "cancelled" && (
                        <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">Cancelled</span>
                      )}
                    </div>
                    <dl className="mt-3 grid grid-cols-3 gap-3 rounded-xl bg-[#fbf7f0] px-3.5 py-2.5">
                      <div className="min-w-0">
                        <dt className="text-[11px] text-ink/50">Date</dt>
                        <dd className="mt-0.5 text-[13px] text-ink/80">{fmtDate(s.date)}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-[11px] text-ink/50">Sq. yards</dt>
                        <dd className="mt-0.5 text-[13px] tabular-nums text-ink/80">{fmtArea(s.area)}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-[11px] text-ink/50">Value</dt>
                        <dd className="mt-0.5 text-[13px] tabular-nums text-ink/80">₹{fmtPoints(s.value)}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
              <div className="mt-4 hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[460px] text-left text-sm">
                  <thead className="text-[11px] font-semibold uppercase tracking-wider text-ink/50">
                    <tr>
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 pr-4">Property</th>
                      <th className="py-3 pr-4 text-right">Sq. yards</th>
                      <th className="py-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {c.sales.map((s) => (
                      <tr key={s.id} className={s.status === "cancelled" ? "opacity-50" : ""}>
                        <td className="whitespace-nowrap py-3.5 pr-4 text-ink/65">{fmtDate(s.date)}</td>
                        <td className="py-3.5 pr-4 font-medium text-ink">
                          {s.title}
                          {s.status === "cancelled" && (
                            <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">Cancelled</span>
                          )}
                        </td>
                        <td className="py-3.5 pr-4 text-right tabular-nums">{fmtArea(s.area)}</td>
                        <td className="py-3.5 text-right tabular-nums">₹{fmtPoints(s.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </section>
        </div>
      </Reveal>
    </div>
  );
}

function Heading() {
  return (
    <div className="fade-up relative">
      <div
        className="pointer-events-none absolute -top-6 right-0 hidden h-[280px] w-[54%] lg:block"
        style={{
          maskImage: "linear-gradient(to right, transparent, #000 55%), linear-gradient(to bottom, #000 62%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 55%), linear-gradient(to bottom, #000 62%, transparent)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
        aria-hidden
      >
        <Image
          src="/images/villa.png"
          alt=""
          fill
          priority
          sizes="54vw"
          className="object-cover"
          style={{ objectPosition: "60% 38%", filter: "saturate(0.85) sepia(0.14) brightness(1.08) contrast(0.95)" }}
        />
        <div className="absolute inset-0 bg-[#fff3e3]/15" />
      </div>

      <div className="relative">
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
          <span className="h-px w-8 bg-copper" />
          Earnings
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
          My <span className="text-copper">Commission</span>
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink/60 sm:text-base">
          Track your sales, see how you earn, and grow your earnings with Bhoomidar.
        </p>
      </div>
    </div>
  );
}
