import Image from "next/image";
import {
  ArrowRight,
  Check,
  ChevronRight,
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
  HouseArt,
} from "@/components/dashboard/StatArt";
import { getCurrentPartner } from "@/lib/profile";
import { getPartnerCommission } from "@/lib/commission";
import { KINDS, fmtArea, fmtDate, fmtPoints } from "@/lib/points";
import { closeDaysText, hourText } from "@/lib/planRules";
import { rankTiers } from "@/lib/data";
import { rewardIcon } from "@/lib/rankIcons";
import RewardPic from "@/components/RewardPic";
import CommissionTabs from "@/components/dashboard/CommissionTabs";
import PlanGuide from "@/components/dashboard/PlanGuide";

export const metadata = { title: "Commission | Bhoomidar" };

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

  // Where the points came from (only what has been added already).
  const kinds = (...list) => list.reduce((t, k) => t + (c.byKind[k] ?? 0), 0);
  const parts = [
    { label: "Sales bonus", value: kinds("sale"), bar: "bg-emerald-500", dot: "bg-emerald-500" },
    { label: "Team difference", value: kinds("team"), bar: "bg-sky-500", dot: "bg-sky-500" },
    { label: "Monthly bonus", value: kinds("self_monthly", "team_monthly", "monthly"), bar: "bg-violet-500", dot: "bg-violet-500" },
    { label: "Partnership & C.T.O.", value: kinds("partnership", "cto"), bar: "bg-orange-400", dot: "bg-orange-400" },
    { label: "Other", value: kinds("adjustment", "reversal"), bar: "bg-amber-400", dot: "bg-amber-400" },
  ];
  const positive = parts.map((p) => ({ ...p, share: Math.max(0, p.value) }));
  const shareTotal = positive.reduce((t, p) => t + p.share, 0);

  // One timeline: points in and points paid out, with the balance after each line.
  const timeline = [
    ...c.ledger.map((e) => ({ id: e.id, kind: e.kind, points: e.points, note: e.note, from: e.from, rate: e.rate, level: e.level, at: e.at })),
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

  // The rules the admin set (the plan itself is explained by PlanGuide).
  const rules = c.rules;
  const monthlyDone = kinds("self_monthly", "team_monthly", "monthly");
  // The partner sees the monthly bonus one instalment at a time, never the whole sum still to come.
  const isMonthly = (x) => x.kind === "self_monthly" || x.kind === "team_monthly";
  const monthlyComing = c.coming.filter(isMonthly).reduce((t, x) => t + x.total, 0);
  const nextMonthlyAt = c.coming.find(isMonthly)?.at ?? null;
  const nextMonthly = nextMonthlyAt ? c.coming.filter((x) => isMonthly(x) && x.at === nextMonthlyAt).reduce((t, x) => t + x.total, 0) : 0;
  const pendingBonus = Math.max(0, c.pending - monthlyComing);
  const nextBonusAt = c.coming.find((x) => !isMonthly(x))?.at ?? null;
  const monthOf = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).slice(0, 7);
  const thisMonth = monthOf(new Date());
  const monthPoints = c.ledger.filter((e) => monthOf(e.at) === thisMonth).reduce((t, e) => t + e.points, 0);
  const closing = closeDaysText(rules);
  const closeAt = hourText(rules.closeHour);

  // What is still to come, day by day.
  const comingDays = [];
  for (const x of c.coming) {
    const day = comingDays.find((d) => d.at === x.at);
    if (day) {
      day.total += x.total;
      day.parts.push(x);
    } else comingDays.push({ at: x.at, total: x.total, parts: [x] });
  }

  const steps = [
    { icon: FileText, art: Handshake, title: "A sale happens", text: "You or someone in your team sells land." },
    { icon: ShieldCheck, art: FileCheck2, title: "We confirm it", text: "Our team checks the sale and records it." },
    { icon: Coins, art: Coins, title: "Points are added", text: `Commission points land here on the closing dates (${closing}). 1 point = ₹1.` },
    { icon: Wallet, art: Wallet, title: "We pay you", text: "Our team pays your points and marks them as paid." },
  ];


  // The next three things to aim for, all in one place: rank, level and reward.
  const waitingReward = c.rewards.find((r) => !r.given && !r.ready && r.legs);
  const rewardLeft = waitingReward
    ? [
        { name: "your power leg", left: Math.max(0, waitingReward.legs.powerCap - waitingReward.legs.power) },
        { name: "your weaker legs", left: Math.max(0, waitingReward.legs.otherNeed - waitingReward.legs.other) },
      ].filter((x) => x.left > 0)
    : [];
  const hint = c.levels.hint;
  const goals = [
    {
      icon: Target,
      tag: "Next rank",
      title: c.next ? c.next.title : "Top rank reached",
      text: c.next ? `${fmtArea(c.areaToNext)} sq. yd more land sold by you and your team.` : "You are at the top. Congratulations!",
      pct: c.next ? c.progress : 100,
      tone: "from-[#fff0e0] to-white ring-copper/15",
      chip: "bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-copper/30",
      bar: "bg-gradient-to-r from-copper to-copper-light",
    },
    {
      icon: Network,
      tag: "Next level",
      title: hint.target ? `Open level ${hint.target}` : `All ${c.levels.max} levels open`,
      text: hint.target
        ? `Sell ${fmtArea(hint.moreArea)} more sq. yd yourself, or add ${hint.moreDirects} more direct partner${hint.moreDirects === 1 ? "" : "s"}.`
        : "You are paid on every level of your team.",
      pct: (c.levels.open / c.levels.max) * 100,
      tone: "from-[#efe7ff] to-white ring-violet-200/60",
      chip: "bg-gradient-to-b from-violet-400 to-violet-600 text-white shadow-violet-500/30",
      bar: "bg-gradient-to-r from-violet-400 to-violet-600",
    },
    {
      icon: Gift,
      tag: "Next reward",
      title: waitingReward ? waitingReward.reward : c.next ? c.next.reward : "All rewards unlocked",
      text: waitingReward
        ? rewardLeft.length
          ? `You have the rank. ${rewardLeft.map((x) => `${fmtArea(x.left)} sq. yd more from ${x.name}`).join(" and ")} to unlock it (50:50).`
          : "Your 50:50 condition is complete."
        : c.next
          ? `Comes with the ${c.next.title} rank.`
          : "You have every reward. Well done!",
      pct: waitingReward ? (waitingReward.need > 0 ? (waitingReward.counted / waitingReward.need) * 100 : 100) : c.next ? c.progress : 100,
      tone: "from-[#e3f7ec] to-white ring-emerald-200/60",
      chip: "bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30",
      bar: "bg-gradient-to-r from-emerald-400 to-emerald-600",
    },
  ];
  const goalsStrip = (
    <Reveal>
      <section className={card}>
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Your next <span className="text-copper">goals</span>
        </h2>
        <p className="mt-1.5 text-sm text-ink/55">Three small steps that take you forward.</p>
        <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {goals.map(({ icon: Icon, tag, title, text, pct, tone, chip, bar }) => (
            <li key={tag} className={`rounded-2xl bg-gradient-to-br p-4 ring-1 sm:p-5 ${tone}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md ${chip}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink/50">{tag}</span>
                  <span className="mt-0.5 block [overflow-wrap:anywhere] text-base font-bold text-ink">{title}</span>
                </span>
              </div>
              <div className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-black/10">
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max(6, Math.min(100, pct))}%` }} />
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-ink/65">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );


  return (
    <div className="space-y-8">
      <Heading />

      <CommissionTabs
        tabs={[
          { id: "overview", label: "Overview", hint: "Money and next goals" },
          { id: "bonuses", label: "My plan", hint: "Every income explained", alias: ["plan", "monthly", "bonus"] },
          { id: "rank", label: "Rank & rewards", short: "Rewards", hint: "Your level and gifts", alias: ["rewards"] },
          { id: "history", label: "History", hint: "Points and sales", alias: ["your-sales", "sales"] },
        ]}
        panels={{
          overview: (
            <div className="space-y-8">
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
              <div className="mt-3 space-y-2 sm:max-w-[15rem] lg:max-w-[17rem]">
                {pendingBonus > 0 && (
                  <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold leading-snug text-amber-800 ring-1 ring-amber-200">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      ₹{fmtPoints(pendingBonus)} more is on the way{nextBonusAt ? <>, next on {fmtDate(nextBonusAt)}</> : null}
                    </span>
                  </p>
                )}
                {nextMonthly > 0 && (
                  <p className="flex items-start gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold leading-snug text-violet-800 ring-1 ring-violet-200">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Next monthly instalment ₹{fmtPoints(nextMonthly)} on {fmtDate(nextMonthlyAt)}
                    </span>
                  </p>
                )}
                <p className="text-xs leading-snug text-ink/50">
                  Points of a sale are added on the {closing} of the month, at {closeAt}.
                </p>
              </div>
            </div>
          </div>

        </section>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7">
          <ClipboardArt className="pointer-events-none absolute -bottom-3 -right-2 hidden h-56 w-60 opacity-90 sm:block" />

          <div className="relative flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-copper shadow-md ring-1 ring-black/5">
              <Clock className="h-5 w-5" />
            </span>
            <h2 className="min-w-0 font-display text-lg font-bold leading-tight text-ink min-[400px]:text-xl sm:text-2xl">Where your points came from</h2>
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

{goalsStrip}

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

      {/* What is still to come */}
      {comingDays.length > 0 && (
        <Reveal>
          <section className={card}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                Coming <span className="text-copper">up</span>
              </h2>
              {pendingBonus > 0 && (
                <span className="rounded-full bg-amber-50 px-3.5 py-1.5 text-sm font-extrabold tabular-nums text-amber-800 ring-1 ring-amber-200">
                  ₹{fmtPoints(pendingBonus)} on the way
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-ink/55">
              The sales bonus is added on {closing} at {closeAt}, and the monthly bonus every month. Not in your balance until then.
            </p>
            <ul className="mt-5 space-y-2.5">
              {comingDays.slice(0, 8).map((d) => (
                <li key={d.at} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-black/5">
                  <span className="min-w-[7.5rem] text-sm font-bold text-ink">{fmtDate(d.at)}</span>
                  <span className="flex flex-wrap gap-1.5">
                    {d.parts.map((x) => (
                      <span key={x.kind} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${KINDS[x.kind]?.tone ?? "bg-stone-200 text-stone-700"}`}>
                        {KINDS[x.kind]?.label ?? x.kind}
                      </span>
                    ))}
                  </span>
                  <span className="ml-auto text-base font-extrabold tabular-nums text-copper-dark">+{fmtPoints(d.total)}</span>
                </li>
              ))}
            </ul>
            {comingDays.length > 8 && <p className="mt-3 text-xs text-ink/50">and {comingDays.length - 8} more dates after these.</p>}
          </section>
        </Reveal>
      )}
            </div>
          ),
          bonuses: (
            <div className="space-y-8">
      <PlanGuide
        c={c}
        rules={rules}
        activatedOn={partner.activatedOn ?? ""}
        monthly={{ done: monthlyDone, next: nextMonthly, nextAt: nextMonthlyAt ? fmtDate(nextMonthlyAt) : "" }}
      />

      {/* How it works */}
      <Reveal>
        <section className={card}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="min-w-0 font-display text-xl font-bold leading-tight text-ink min-[380px]:text-2xl sm:text-3xl">
              How you get <span className="text-copper">paid</span>
            </h2>
            <a
              href="/opportunities#rewards"
              className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-copper-dark shadow-sm ring-1 ring-copper/25 transition hover:bg-copper hover:text-white hover:ring-copper sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
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
            </div>
          ),
          rank: (
            <div className="space-y-8">
<Reveal>
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
</Reveal>

<Reveal>
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
                    <span className="mt-1 block [overflow-wrap:anywhere] text-sm text-ink/55">
                      {r.title}
                      {r.value > 0 && <> · worth ₹{fmtPoints(r.value)}</>}
                    </span>
                    {!r.given && !r.ready && !r.legs && (
                      <span className="mt-1.5 block text-xs leading-snug text-rose-700">
                        {fmtArea(r.counted)} of {fmtArea(r.need)} sq. yd count so far: the strongest leg counts for at most half, the rest must come from your other
                        legs.
                      </span>
                    )}
                  </span>
                  {r.given ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      Received
                    </span>
                  ) : r.ready ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#fdeab8] px-3.5 py-1.5 text-xs font-bold text-amber-800">
                      <Clock className="h-3.5 w-3.5" />
                      On the way
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
                      <Lock className="h-3.5 w-3.5" />
                      Needs 50:50
                    </span>
                  )}
                  {!r.given && !r.ready && r.legs && (
                    <div className="w-full space-y-3 rounded-xl bg-white/70 p-3 ring-1 ring-rose-100">
                      {[
                        {
                          name: "Power leg",
                          hint: "your strongest leg (counts up to half)",
                          have: Math.min(r.legs.power, r.legs.powerCap),
                          need: r.legs.powerCap,
                          bar: "bg-copper",
                        },
                        {
                          name: "Weaker legs",
                          hint: "all your other legs and your own sales, together",
                          have: Math.min(r.legs.other, r.legs.otherNeed),
                          need: r.legs.otherNeed,
                          bar: "bg-violet-500",
                        },
                      ].map((row) => {
                        const left = Math.max(0, row.need - row.have);
                        return (
                          <div key={row.name}>
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs">
                              <span className="font-bold text-ink">{row.name}</span>
                              <span className={left > 0 ? "font-semibold text-rose-700" : "font-semibold text-emerald-700"}>
                                {left > 0 ? `${fmtArea(left)} sq. yd to go` : "Done"}
                              </span>
                            </div>
                            <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/5">
                              <div
                                className={`h-full rounded-full ${row.bar}`}
                                style={{ width: `${row.need > 0 ? Math.min(100, (row.have / row.need) * 100) : 100}%` }}
                              />
                            </div>
                            <p className="mt-1 text-[11px] leading-snug text-ink/50">
                              {fmtArea(row.have)} of {fmtArea(row.need)} sq. yd · {row.hint}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {c.next && (
              <div className="mt-3 flex items-center gap-3 rounded-2xl border-2 border-dashed border-copper/30 px-4 py-3.5 text-sm text-ink/60">
                <Lock className="h-5 w-5 shrink-0 text-copper/70" />
                <span className="min-w-0 flex-1">
                  Next reward: <b className="text-ink">{c.next.reward}</b>
                  {c.next.rewardValue > 0 && <> (₹{fmtPoints(c.next.rewardValue)})</>} at {c.next.title}
                </span>
              </div>
            )}
          </section>
</Reveal>
            </div>
          ),
          history: (
            <div className="space-y-8">
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

<Reveal>
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
</Reveal>
            </div>
          ),
        }}
      />
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
