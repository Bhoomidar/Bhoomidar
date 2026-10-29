import { Check, Clock, Crown, Gift, Handshake, Lock, Network, TrendingUp, Wallet } from "lucide-react";
import RewardPic from "@/components/RewardPic";
import { fmtArea, fmtPoints } from "@/lib/points";
import { closeDaysList, hourText, monthlyShare, ordinal, pctText } from "@/lib/planRules";

// The partner plan laid out like the plan paper: joining, then every kind of income with its rule,
// a worked example, when it is added, and where this partner stands today.
//   c:        getPartnerCommission()      rules: c.rules      activatedOn: "25 Oct 2026" or ""
//   monthly:  { done, next, nextAt }      (the monthly bonus so far and the next instalment)

const SAMPLE = 1000000; // the example sale: Rs 10 lakh, as on the paper
const inr = (n) => `₹${fmtPoints(n)}`;

const TONES = {
  copper: { chip: "from-copper-light to-copper-dark shadow-copper/30", big: "bg-copper/10 text-copper-dark ring-copper/25", bar: "from-copper to-copper-light" },
  orange: { chip: "from-orange-400 to-orange-600 shadow-orange-500/30", big: "bg-orange-50 text-orange-800 ring-orange-200", bar: "from-orange-400 to-orange-600" },
  emerald: { chip: "from-emerald-400 to-emerald-600 shadow-emerald-500/30", big: "bg-emerald-50 text-emerald-800 ring-emerald-200", bar: "from-emerald-400 to-emerald-600" },
  violet: { chip: "from-violet-400 to-violet-600 shadow-violet-500/30", big: "bg-violet-50 text-violet-800 ring-violet-200", bar: "from-violet-400 to-violet-600" },
  amber: { chip: "from-[#f7c85a] to-[#d79a1c] shadow-amber-500/30", big: "bg-amber-50 text-amber-800 ring-amber-200", bar: "from-[#f7c85a] to-[#d79a1c]" },
};

// "Sales of the 1st to 10th are added on the 11th", ... from the closing days the admin set.
function closingPeriods(rules) {
  const days = closeDaysList(rules.closeDays);
  if (!days.length) return [];
  const out = [];
  let start = 1;
  for (const d of days) {
    if (d <= 1) continue;
    out.push({ sales: `${ordinal(start)} to ${ordinal(d - 1)}`, on: `${ordinal(d)} of the month` });
    start = d;
  }
  out.push({ sales: `${ordinal(start)} to the month end`, on: `${ordinal(days[0])} of the next month` });
  return out;
}

export default function PlanGuide({ c, rules, activatedOn, monthly }) {
  const plan = c.plan ?? [];
  const base = plan[0]?.rate ?? 2;
  const top = plan[plan.length - 1]?.rate ?? base;
  const myNo = c.rank?.no ?? 1;
  const myRate = c.rank?.rate ?? base;
  const hour = hourText(rules.closeHour);

  // 1: partnership bonus, the paper's example: Rs 1 crore of sales shared by 100 active partners
  const pool = (10000000 * rules.partnershipPct) / 100;
  const cap = c.partnership.cap;

  // 2: sales bonus
  const periods = closingPeriods(rules);
  const second = plan[1];

  // 3: monthly bonus
  const self = monthlyShare(SAMPLE, rules.selfPct, rules.months);
  const level = monthlyShare(SAMPLE, rules.levelPct, rules.months);
  const areaSteps = Array.from({ length: Math.ceil(rules.levels / rules.openStep) }, (_, i) => ({
    area: (i + 1) * rules.openArea,
    upTo: Math.min(rules.levels, (i + 1) * rules.openStep),
  }));

  // rewards: what the partner has reached, by rank
  const reached = Object.fromEntries((c.rewards ?? []).map((r) => [r.no, r]));
  const half = rules.powerPct / 100;
  const findReward = (area, fallback) => plan.find((r) => r.minArea === area)?.reward || fallback;

  // C.T.O. bonus
  const ctoRank = plan.find((r) => r.no === rules.ctoRank) ?? plan[plan.length - 1];
  const ctoOn = myNo >= (ctoRank?.no ?? Infinity);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-5 text-ink shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-copper">Your partner plan</p>
        <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">How you earn at Bhoomidar</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/65">
          Every rule of the plan in one place, with an example and where you stand today. 1 point = ₹1.
        </p>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["1", "Partnership bonus", `${pctText(rules.partnershipPct)}%`, Handshake, "orange"],
            ["2", "Sales bonus", `${pctText(base)}% to ${pctText(top)}%`, TrendingUp, "emerald"],
            ["3", "Monthly bonus", `${pctText(rules.selfPct)}% + ${pctText(rules.levelPct)}%`, Network, "violet"],
            ["4", "Lifetime rewards", "50 : 50", Gift, "amber"],
            ["5", "C.T.O. bonus", `${pctText(rules.ctoPct)}%`, Crown, "amber"],
          ].map(([n, name, value, Icon, tone]) => (
            <li
              key={n}
              className="group relative flex flex-col rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md max-sm:last:flex-row max-sm:last:items-center max-sm:last:gap-3.5 last:col-span-2 sm:last:col-span-1"
            >
              <span className="absolute right-3 top-2.5 text-xs font-bold text-ink/20 max-sm:group-last:top-1/2 max-sm:group-last:-translate-y-1/2">
                {n}
              </span>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${TONES[tone].chip}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-3 block min-w-0 max-sm:group-last:mt-0">
                <span className="block text-xs font-medium text-ink/60">{name}</span>
                <span className="mt-0.5 block text-xl font-extrabold leading-tight tabular-nums text-ink">{value}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Joining */}
      <Section tone="copper" icon={Wallet} kicker="Start" title="Joining">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Fact label="Registration" value="Free" />
          <Fact label="ID activation" value={inr(c.fee)} note="one time" />
          <Fact label="Your ID" value="Active" note={activatedOn ? `since ${activatedOn}` : ""} good />
        </ul>
        <p className="text-sm text-ink/65">You start earning once your ID is activated.</p>
      </Section>

      {/* 1: Partnership bonus */}
      <Section tone="orange" icon={Handshake} kicker="Income 1" title="Partnership bonus" big={`${pctText(rules.partnershipPct)}%`}>
        <Rules
          items={[
            `${pctText(rules.partnershipPct)}% of all the company's sales of a month is shared equally by every active partner.`,
            cap > 0
              ? `You can get up to ${pctText(rules.capX)} times your ID fee from this bonus, that is ${inr(cap)} in all. After that it stops.`
              : "There is no upper limit on this bonus.",
          ]}
        />
        <Example>
          Company sales ₹1,00,00,000 × {pctText(rules.partnershipPct)}% = <b>{inr(pool)}</b>
          <br />
          {inr(pool)} ÷ 100 active partners = <b className="text-orange-700">{inr(pool / 100)} each</b>
        </Example>
        <When>
          Added by itself on the {ordinal(rules.poolDay)} of the next month, {hour}.
        </When>
        <You tone="orange">
          {cap > 0 ? (
            <>
              <p className="text-sm text-ink/75">
                You have got <b className="text-ink">{inr(c.partnership.got)}</b> of {inr(cap)}.
              </p>
              <Bar tone="orange" pct={(c.partnership.got / cap) * 100} />
            </>
          ) : (
            <p className="text-sm text-ink/75">
              You have got <b className="text-ink">{inr(c.partnership.got)}</b> so far.
            </p>
          )}
        </You>
      </Section>

      {/* 2: Sales bonus */}
      <Section tone="emerald" icon={TrendingUp} kicker="Income 2" title="Sales bonus" big={`${pctText(base)}% – ${pctText(top)}%`}>
        <Rules
          items={[
            "Every sale pays a sales bonus. Your percentage depends on your rank.",
            "Your rank grows with the land sold by you and your whole team together, in sq. yards. A rank is never taken back.",
            "When someone in your team sells, you get only the difference (team difference) between your % and the highest % below you.",
          ]}
        />

        <div className="overflow-hidden rounded-2xl ring-1 ring-black/10">
          <div className="hidden grid-cols-[2.25rem_1.5fr_1.2fr_0.7fr_0.9fr] gap-3 bg-[#fbf3e8] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-copper-dark sm:grid">
            <span>#</span>
            <span>Rank</span>
            <span>Team land (sq. yd)</span>
            <span className="text-right">Sales %</span>
            <span className="text-right">Team difference</span>
          </div>
          <ul className="divide-y divide-black/5">
            {plan.map((r, i) => {
              const next = plan[i + 1];
              const area = next ? `${fmtArea(r.minArea)} – ${fmtArea(next.minArea - 1)}` : `${fmtArea(r.minArea)} & above`;
              const diff = i === 0 ? "0%" : `up to ${pctText(r.rate - base)}%`;
              const me = r.no === myNo;
              return (
                <li
                  key={r.no}
                  className={`grid grid-cols-[2.25rem_1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-3 sm:grid-cols-[2.25rem_1.5fr_1.2fr_0.7fr_0.9fr] ${
                    me ? "bg-emerald-50" : ""
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      r.no <= myNo ? "bg-gradient-to-b from-emerald-400 to-emerald-600 text-white" : "bg-[#ece5dc] text-ink/50"
                    }`}
                  >
                    {r.no < myNo ? <Check className="h-4 w-4" strokeWidth={3} /> : r.no}
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block [overflow-wrap:anywhere] text-sm font-bold text-ink">{r.title}</span>
                    {me && <span className="mt-0.5 block text-[11px] font-bold text-emerald-700">You are here</span>}
                    <span className="mt-0.5 block text-[11px] text-ink/55 sm:hidden">
                      {area} sq. yd · team {diff}
                    </span>
                  </span>
                  <span className="hidden text-sm tabular-nums text-ink/70 sm:block">{area}</span>
                  <span className="text-right text-base font-extrabold tabular-nums text-emerald-700">{pctText(r.rate)}%</span>
                  <span className="hidden text-right text-sm tabular-nums text-ink/70 sm:block">{diff}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <Example>
          Your sale ₹10,00,000 × {pctText(myRate)}% = <b className="text-emerald-700">{inr((SAMPLE * myRate) / 100)}</b>
          {second && (
            <>
              <br />
              Team difference: a {plan[0].title} ({pctText(base)}%) in the team of a {second.title} ({pctText(second.rate)}%) sells ₹10,00,000. The{" "}
              {second.title} gets {pctText(second.rate - base)}% = <b className="text-emerald-700">{inr((SAMPLE * (second.rate - base)) / 100)}</b>.
            </>
          )}
        </Example>

        <div>
          <p className="text-sm font-bold text-ink">Closing dates: when the sales bonus is added</p>
          <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {periods.map((p) => (
              <li key={p.sales} className="rounded-xl bg-[#fbf7f0] px-3.5 py-3 ring-1 ring-black/5">
                <span className="block text-[11px] text-ink/55">Sales of the {p.sales}</span>
                <span className="mt-0.5 block text-sm font-bold text-ink">
                  Added on the {p.on}, {hour}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink/55">Until then the points show under Coming up on the Overview tab.</p>
        </div>

        <You tone="emerald">
          <p className="text-sm text-ink/75">
            You are <b className="text-ink">{c.rank?.title}</b> and earn <b className="text-ink">{pctText(myRate)}%</b> on your own sales.
          </p>
          {c.next ? (
            <>
              <Bar tone="emerald" pct={c.progress} />
              <p className="mt-1.5 text-xs text-ink/60">
                {fmtArea(c.teamArea)} of {fmtArea(c.next.minArea)} sq. yd: {fmtArea(c.areaToNext)} more to become {c.next.title} ({pctText(c.next.rate)}%).
              </p>
            </>
          ) : (
            <p className="mt-1 text-xs text-ink/60">You are at the top rank.</p>
          )}
        </You>
      </Section>

      {/* 3: Monthly bonus */}
      <Section tone="violet" icon={Network} kicker="Income 3" title="Monthly bonus" big={`${pctText(rules.selfPct)}% + ${pctText(rules.levelPct)}%`}>
        <Rules
          items={[
            `Your own sale: ${pctText(rules.selfPct)}% of it, split into ${rules.months} equal parts, one every month.`,
            `Your team's sales, level 1 to level ${rules.levels}: ${pctText(rules.levelPct)}% for each level, also split into ${rules.months} monthly parts.`,
            `Level 1 is the partner you added. Level 2 is the partner they added, and so on up to level ${rules.levels}.`,
          ]}
        />
        <Example>
          Your sale ₹10,00,000 × {pctText(rules.selfPct)}% = {inr(self.total)} ÷ {rules.months} ={" "}
          <b className="text-violet-700">{inr(self.each)} a month</b>
          <br />
          A team sale ₹10,00,000 × {pctText(rules.levelPct)}% = {inr(level.total)} ÷ {rules.months} ={" "}
          <b className="text-violet-700">{inr(level.each)} a month</b> for each open level
        </Example>

        <div>
          <p className="text-sm font-bold text-ink">How a level opens (whichever way opens more)</p>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-[#f6f1ff] p-4 ring-1 ring-violet-200/70">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-800">Way 1: your own sales</p>
              <ul className="mt-2.5 space-y-1.5">
                {areaSteps.map((s) => (
                  <li key={s.area} className="flex flex-wrap items-center justify-between gap-x-3 text-sm">
                    <span className="text-ink/75">{fmtArea(s.area)} sq. yd sold</span>
                    <b className="text-ink">{s.upTo === 1 ? "Level 1" : `Levels 1 – ${s.upTo}`} open</b>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-[#f6f1ff] p-4 ring-1 ring-violet-200/70">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-800">Way 2: your direct partners</p>
              <p className="mt-1 text-xs text-ink/55">Partners you added yourself, with an active ID.</p>
              <ul className="mt-2.5 grid grid-cols-4 gap-2">
                {Array.from({ length: rules.levels }, (_, i) => (
                  <li key={i} className="rounded-xl bg-white px-2 py-2 text-center ring-1 ring-violet-200/70">
                    <span className="block text-base font-extrabold text-violet-700">{i + 1}</span>
                    <span className="block text-[10px] leading-tight text-ink/55">
                      direct{i ? "s" : ""} = {i + 1} level{i ? "s" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-2 text-xs text-ink/55">The levels are checked when a sale is recorded. A level opened later pays on the new sales.</p>
        </div>

        <When>
          Added on the {ordinal(rules.monthDay)} of every month, {hour}. The first part comes in the month after the sale.
        </When>

        <You tone="violet">
          <p className="text-sm text-ink/75">
            Your own sales: <b className="text-ink">{fmtArea(c.levels.selfArea)} sq. yd</b> · Direct partners:{" "}
            <b className="text-ink">{c.levels.directs}</b> · Levels open: <b className="text-ink">{c.levels.open} of {c.levels.max}</b>
          </p>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {Array.from({ length: c.levels.max }, (_, i) => {
              const open = i < c.levels.open;
              return (
                <li
                  key={i}
                  title={open ? `Level ${i + 1} is open` : `Level ${i + 1} is not open yet`}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    open ? "bg-gradient-to-b from-violet-400 to-violet-600 text-white" : "bg-[#ece5dc] text-ink/45"
                  }`}
                >
                  {open ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-ink/60">
            {c.levels.hint.target
              ? `To open level ${c.levels.hint.target}: sell ${fmtArea(c.levels.hint.moreArea)} more sq. yd yourself, or add ${c.levels.hint.moreDirects} more direct partner${
                  c.levels.hint.moreDirects === 1 ? "" : "s"
                }.`
              : "Every level is open. You are paid on your whole team."}
          </p>
          <p className="mt-2 text-xs text-ink/60">
            Monthly bonus so far: <b className="text-ink">{inr(monthly.done)}</b>
            {monthly.next > 0 && monthly.nextAt && (
              <>
                {" "}
                · Next part <b className="text-ink">{inr(monthly.next)}</b> on {monthly.nextAt}
              </>
            )}
          </p>
        </You>
      </Section>

      {/* 4: Lifetime rewards */}
      <Section tone="amber" icon={Gift} kicker="Income 4" title="Lifetime rewards" big="50 : 50">
        <Rules
          items={[
            "Every rank has a reward. You get it once, for life.",
            `50:50 condition: your strongest leg (power leg) counts for at most ${rules.powerPct}% of the reward's sq. yards. The rest must come from your other legs (weaker legs) and your own sales.`,
            "A leg is one direct partner and their whole team.",
          ]}
        />

        <ul className="space-y-2">
          {plan.map((r) => {
            const got = reached[r.no];
            const status = !got
              ? { text: "Locked", cls: "bg-[#ece5dc] text-ink/55", icon: Lock }
              : got.given
                ? { text: "Received", cls: "bg-emerald-100 text-emerald-800", icon: Check }
                : got.ready
                  ? { text: "On the way", cls: "bg-[#fdeab8] text-amber-800", icon: Clock }
                  : { text: "Needs 50:50", cls: "bg-rose-50 text-rose-700 ring-1 ring-rose-200", icon: Lock };
            const Icon = status.icon;
            return (
              <li key={r.no} className="flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-2xl bg-gradient-to-r from-white to-[#fff8ef] p-3 ring-1 ring-black/5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#f7c85a] to-[#d79a1c] text-white">
                  <RewardPic image={r.image} icon={r.icon} alt={r.reward} iconClassName="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 basis-40 leading-tight">
                  <span className="block [overflow-wrap:anywhere] text-sm font-bold text-ink">
                    {r.reward}
                    {r.rewardValue > 0 && <span className="font-semibold text-ink/50"> · {inr(r.rewardValue)}</span>}
                  </span>
                  <span className="mt-0.5 block [overflow-wrap:anywhere] text-xs text-ink/55">
                    {r.title} · {fmtArea(r.minArea)} sq. yd
                  </span>
                </span>
                <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${status.cls}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {status.text}
                </span>
              </li>
            );
          })}
        </ul>

        <div>
          <p className="text-sm font-bold text-ink">The 50:50 condition, with examples</p>
          <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <LegsExample reward={findReward(500, "Smart Watch")} need={500} legs={[250, 100, 150]} half={half} />
            <LegsExample reward={findReward(1000, "Smart Phone")} need={1000} legs={[900, 200, 200, 100]} half={half} />
            <LegsExample reward={findReward(1000, "Smart Phone")} need={1000} legs={[900, 100]} half={half} />
          </div>
        </div>

        <You tone="amber">
          <p className="text-sm text-ink/75">
            Your power leg and weaker legs, for every reward you have reached, are on the{" "}
            <a href="#rank" className="font-bold text-copper-dark underline underline-offset-2">
              Rank &amp; rewards
            </a>{" "}
            tab.
          </p>
        </You>
      </Section>

      {/* 5: C.T.O. bonus */}
      <Section tone="amber" icon={Crown} kicker="Income 5" title="C.T.O. bonus" big={`${pctText(rules.ctoPct)}%`}>
        <Rules
          items={[
            `${pctText(rules.ctoPct)}% of all the company's sales of a month is shared equally by the partners who reach ${ctoRank?.title ?? "the top rank"} (house achievers).`,
            "It is separate from the partnership bonus.",
          ]}
        />
        <When>
          Added by itself on the {ordinal(rules.poolDay)} of the next month, {hour}.
        </When>
        <You tone="amber">
          {ctoOn ? (
            <p className="text-sm font-semibold text-emerald-700">You share the C.T.O. bonus every month.</p>
          ) : (
            <>
              <p className="text-sm text-ink/75">
                Opens at <b className="text-ink">{ctoRank?.title}</b> ({fmtArea(ctoRank?.minArea ?? 0)} sq. yd of team land). You have{" "}
                <b className="text-ink">{fmtArea(c.teamArea)} sq. yd</b>.
              </p>
              <Bar tone="amber" pct={ctoRank?.minArea ? (c.teamArea / ctoRank.minArea) * 100 : 0} />
            </>
          )}
        </You>
      </Section>
    </div>
  );
}

function Section({ tone, icon: Icon, kicker, title, big, children }) {
  const t = TONES[tone];
  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b text-white shadow-md ${t.chip}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1 basis-40 leading-tight">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/50">{kicker}</p>
          <h3 className="mt-0.5 font-display text-2xl font-bold text-ink sm:text-[1.7rem]">{title}</h3>
        </div>
        {big && <span className={`shrink-0 rounded-2xl px-4 py-2 text-lg font-extrabold tabular-nums ring-1 sm:text-xl ${t.big}`}>{big}</span>}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Rules({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((text) => (
        <li key={text} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/75">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-copper" strokeWidth={3} />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

function Example({ children }) {
  return (
    <div className="rounded-2xl bg-[#fbf7f0] px-4 py-3.5 ring-1 ring-black/5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">Example</p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{children}</p>
    </div>
  );
}

function When({ children }) {
  return (
    <p className="flex w-fit max-w-full items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs font-semibold leading-snug text-amber-800 ring-1 ring-amber-200">
      <Clock className="mt-px h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function You({ tone, children }) {
  const ring = {
    orange: "ring-orange-200 from-orange-50/70",
    emerald: "ring-emerald-200 from-emerald-50/70",
    violet: "ring-violet-200 from-violet-50/70",
    amber: "ring-amber-200 from-amber-50/70",
  }[tone];
  return (
    <div className={`rounded-2xl bg-gradient-to-br to-white p-4 ring-1 ${ring}`}>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink/45">Where you stand</p>
      {children}
    </div>
  );
}

function Bar({ tone, pct }) {
  return (
    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/10">
      <div className={`h-full rounded-full bg-gradient-to-r ${TONES[tone].bar}`} style={{ width: `${Math.max(3, Math.min(100, pct || 0))}%` }} />
    </div>
  );
}

function Fact({ label, value, note, good }) {
  return (
    <li className="rounded-2xl bg-[#fbf7f0] px-4 py-3 ring-1 ring-black/5">
      <span className="block text-[11px] text-ink/55">{label}</span>
      <span className={`mt-0.5 block text-lg font-extrabold ${good ? "text-emerald-700" : "text-ink"}`}>{value}</span>
      {note && <span className="block text-[11px] text-ink/50">{note}</span>}
    </li>
  );
}

// One drawing of the 50:50 condition, as on the paper: "You" on top, the legs below.
function LegsExample({ reward, need, legs, half }) {
  const strongest = Math.max(...legs);
  const at = legs.indexOf(strongest);
  const powerCounts = Math.min(strongest, need * half);
  const weaker = legs.reduce((t, v, i) => (i === at ? t : t + v), 0);
  const counted = powerCounts + weaker;
  const ok = counted >= need;
  return (
    <div className="rounded-2xl bg-[#fbf7f0] p-4 ring-1 ring-black/5">
      <p className="text-sm font-bold text-ink">
        {reward}: {fmtArea(need)} sq. yd needed
      </p>
      <div className="mt-3 flex flex-col items-center">
        <span className="rounded-full bg-ink px-4 py-1 text-xs font-bold text-white">You</span>
        <span className="h-3 w-px bg-ink/25" />
        <ul className="flex flex-wrap justify-center gap-1.5">
          {legs.map((v, i) => (
            <li
              key={i}
              className={`rounded-xl px-2.5 py-1.5 text-center leading-tight ring-1 ${
                i === at ? "bg-copper/10 ring-copper/40" : "bg-violet-50 ring-violet-200"
              }`}
            >
              <span className="block text-sm font-extrabold tabular-nums text-ink">{fmtArea(v)}</span>
              <span className={`block text-[10px] font-semibold ${i === at ? "text-copper-dark" : "text-violet-700"}`}>
                {i === at ? "Power" : "Weaker"}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink/70">
        Power leg counts {fmtArea(powerCounts)}
        {strongest > powerCounts && <> (not {fmtArea(strongest)})</>} + weaker legs {fmtArea(weaker)} = <b className="text-ink">{fmtArea(counted)}</b>
      </p>
      <p className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${ok ? "bg-emerald-100 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>
        {ok ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Lock className="h-3.5 w-3.5" />}
        {ok ? "Reward unlocked" : `Not yet: ${fmtArea(need - counted)} more from weaker legs`}
      </p>
    </div>
  );
}
