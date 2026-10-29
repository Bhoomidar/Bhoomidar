import { Check, Lock } from "lucide-react";
import { fmtArea } from "@/lib/points";

// The 50:50 reward condition for one reward, drawn as one bar. The bar is the reward's sq. yards.
// The power leg (the strongest direct team) fills the first part, but only up to the limit (half by default).
// The weaker legs (every other team, and the partner's own sales) fill the rest in full.
//   need   sq. yards the reward needs
//   power  sq. yards of the power leg (all of it, even above the limit)
//   weaker sq. yards of all the other legs together
//   cap    the most the power leg may count
//   teamTotal  (optional) all the land of the team: what the rank counts. The part the reward does not count is drawn hatched.
//   compact    (optional) the short form: the bar, one line of numbers and the result. The long explanation is left out.
export default function LegsMeter({ need, power, weaker, cap, teamTotal, compact = false }) {
  const powerCounts = Math.min(power, cap);
  const weakerCounts = Math.min(weaker, Math.max(0, need - powerCounts));
  const counted = powerCounts + weaker;
  const ok = counted >= need;
  const left = Math.max(0, need - counted);
  const extra = Math.max(0, power - cap);
  const pct = (v) => (need > 0 ? Math.min(100, Math.max(0, (v / need) * 100)) : 0);
  const limitAt = pct(cap);
  const withRank = typeof teamTotal === "number";
  const notCounted = withRank ? Math.min(Math.max(0, teamTotal - counted), Math.max(0, need - powerCounts - weakerCounts)) : 0;

  return (
    <div className="w-full">
      {/* the bar */}
      <div className="relative pt-6">
        <span
          className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-md bg-copper/10 px-1.5 py-0.5 text-[10px] font-bold text-copper-dark"
          style={{ left: `${Math.min(88, Math.max(12, limitAt))}%` }}
        >
          Power leg limit {fmtArea(cap)}
        </span>
        <div className="flex h-6 overflow-hidden rounded-full bg-[repeating-linear-gradient(135deg,rgba(0,0,0,0.05)_0_6px,rgba(0,0,0,0.02)_6px_12px)] ring-1 ring-inset ring-black/10">
          <div className="h-full bg-gradient-to-r from-copper-light to-copper transition-[width]" style={{ width: `${pct(powerCounts)}%` }} />
          <div className="h-full bg-gradient-to-r from-violet-400 to-violet-500 transition-[width]" style={{ width: `${pct(weakerCounts)}%` }} />
          {notCounted > 0 && (
            <div
              className="h-full bg-[repeating-linear-gradient(135deg,rgba(181,98,47,0.4)_0_5px,rgba(181,98,47,0.15)_5px_10px)]"
              style={{ width: `${pct(notCounted)}%` }}
              title="Counts for the rank, but not for the reward"
            />
          )}
        </div>
        <span className="pointer-events-none absolute bottom-[-4px] top-5 w-0.5 -translate-x-1/2 rounded-full bg-ink/70" style={{ left: `${limitAt}%` }} />
        <div className="mt-1.5 flex justify-between text-[11px] font-semibold tabular-nums text-ink/50">
          <span>0</span>
          <span>{fmtArea(need)} sq. yd needed</span>
        </div>
      </div>

      {compact && (
        <>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/70">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-copper" />
              Power leg <b className="tabular-nums text-ink">{fmtArea(powerCounts)}</b> (counts up to {fmtArea(cap)})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
              Weaker legs <b className="tabular-nums text-ink">{fmtArea(weaker)}</b>
            </span>
          </p>
          <p className="mt-1 text-[11px] leading-snug text-ink/50">
            Power leg is your strongest team. Weaker legs are all your other teams and your own sales.
            {extra > 0 && ` Your strongest team sold ${fmtArea(power)}, so ${fmtArea(extra)} of it does not count for the reward.`}
          </p>
        </>
      )}

      {/* what each part is */}
      {!compact && (
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        <li className="rounded-xl bg-copper/[0.07] px-3.5 py-2.5 ring-1 ring-copper/20">
          <span className="flex items-center gap-2 text-xs font-bold text-copper-dark">
            <span className="h-2.5 w-2.5 rounded-full bg-copper" />
            Power leg
          </span>
          <span className="mt-1 block text-lg font-extrabold leading-none tabular-nums text-ink">
            {fmtArea(powerCounts)}
            <span className="ml-1 text-xs font-semibold text-ink/50">of {fmtArea(cap)} counts</span>
          </span>
          <span className="mt-1 block text-[11px] leading-snug text-ink/55">
            {power === 0
              ? "Your strongest team. It has not sold yet."
              : extra > 0
                ? `Your strongest team sold ${fmtArea(power)}. Only ${fmtArea(cap)} counts, ${fmtArea(extra)} is extra.`
                : `Your strongest team sold ${fmtArea(power)}. It counts in full.`}
          </span>
        </li>
        <li className="rounded-xl bg-violet-50 px-3.5 py-2.5 ring-1 ring-violet-200">
          <span className="flex items-center gap-2 text-xs font-bold text-violet-700">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
            Weaker legs
          </span>
          <span className="mt-1 block text-lg font-extrabold leading-none tabular-nums text-ink">
            {fmtArea(weaker)}
            <span className="ml-1 text-xs font-semibold text-ink/50">counts in full</span>
          </span>
          <span className="mt-1 block text-[11px] leading-snug text-ink/55">All your other teams and your own sales, together.</span>
        </li>
      </ul>
      )}

      {withRank && (
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-[#fde8da] px-3.5 py-2.5 text-xs text-ink/75">
          <b className="tabular-nums text-ink">
            Rank: {fmtArea(teamTotal)} of {fmtArea(need)} sq. yd of team land
          </b>
          <span>{teamTotal >= need ? "You have the rank." : `${fmtArea(need - teamTotal)} sq. yd to go. The rank counts all the land of you and your team.`}</span>
        </p>
      )}

      {/* the result */}
      <p
        className={`mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl px-3.5 py-2.5 text-xs font-bold ${
          ok ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
        }`}
      >
        {ok ? <Check className="h-4 w-4 shrink-0" strokeWidth={3} /> : <Lock className="h-4 w-4 shrink-0" />}
        <span className="tabular-nums">
          {fmtArea(powerCounts)} + {fmtArea(weaker)} = {fmtArea(counted)} of {fmtArea(need)} sq. yd
        </span>
        <span className="font-semibold">
          {ok
            ? "Reward unlocked"
            : power < cap
              ? `${fmtArea(left)} sq. yd more. Your power leg can still add ${fmtArea(cap - power)} of it.`
              : `${fmtArea(left)} sq. yd more from your weaker legs`}
        </span>
      </p>
    </div>
  );
}
