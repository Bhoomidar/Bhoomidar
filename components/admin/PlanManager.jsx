"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Info, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { recheckRanks, saveRankPlan, savePlanRules, saveRules } from "@/actions/admin/plan";
import { buildChart, inr } from "@/lib/planChart";
import { RULE_KEYS, closeDaysText, hourText, monthlyShare, pctText, readRules } from "@/lib/planRules";
import { iconForReward, rewardIcon } from "@/lib/rankIcons";
import RewardPic from "../RewardPic";
import ImageUploader from "./ImageUploader";
import Switch from "./Switch";
import { btnGhost, btnPrimary, card, iconBtn, inputCls, labelCls } from "./ui";

const smallInput = `${inputCls} !py-2.5`;

function Notice({ ok, children }) {
  if (!children) return null;
  return (
    <p
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
        ok ? "border-emerald-500/25 bg-emerald-50 text-emerald-800" : "border-rose-500/25 bg-rose-50 text-rose-800"
      }`}
    >
      {ok && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
      {children}
    </p>
  );
}

// The rank table: one row per rank. The lines under each row are worked out from what is typed,
// so the admin sees what the website will print before saving.
function RanksCard({ initial, rules }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState({ ok: false, text: "" });
  const [rechecking, setRechecking] = useState(false);

  const set = (i, patch) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const preview = useMemo(
    () =>
      buildChart(
        rows.map((r, i) => ({
          rank_no: i + 1,
          title: r.title || "-",
          min_area: Number(String(r.min_area).replace(/,/g, "")) || 0,
          ps_rate: Number(String(r.ps_rate).replace(/%/g, "")) || 0,
          reward_value: Number(String(r.reward_value).replace(/[,₹\s]/g, "")) || 0,
          reward: r.reward,
          icon: r.icon,
          team_example: r.team_example,
        })),
        rules,
      ),
    [rows, rules],
  );

  // Typing the reward also picks the small fallback picture (used while there is no photo).
  const setReward = (i, text) => {
    const fit = iconForReward(text);
    set(i, { reward: text, ...(fit ? { icon: fit } : {}) });
  };

  const add = () => {
    const last = rows[rows.length - 1];
    const min = Math.round((Number(last?.min_area) || 0) * 2) || 500;
    setRows([
      ...rows,
      {
        rank_no: rows.length + 1,
        title: "New rank",
        min_area: String(min),
        ps_rate: String((Number(last?.ps_rate) || 2) + 0.25),
        reward_value: "0",
        reward: "",
        icon: "Gift",
        image_url: "",
        team_example: "",
        partners: 0,
        isNew: true,
      },
    ]);
  };

  const save = () =>
    start(async () => {
      setMsg({ ok: false, text: "" });
      const res = await saveRankPlan(rows);
      if (res.success) {
        setMsg({ ok: true, text: "Saved. The website and every partner's dashboard now use this plan." });
        router.refresh();
      } else setMsg({ ok: false, text: res.error });
    });

  const recheck = async () => {
    setRechecking(true);
    setMsg({ ok: false, text: "" });
    const res = await recheckRanks();
    setRechecking(false);
    setMsg(
      res.success
        ? { ok: true, text: `Checked ${res.checked} partner${res.checked === 1 ? "" : "s"}. ${res.added} new rank${res.added === 1 ? "" : "s"} given.` }
        : { ok: false, text: res.error },
    );
    router.refresh();
  };

  const last = rows.length - 1;

  return (
    <section className={card}>
      <h2 className="font-display text-2xl font-bold text-ink">
        Ranks &amp; <span className="text-copper">commission</span>
      </h2>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink/60">
        The same table is used for the website chart, the partners&apos; dashboards and the commission worked out on every sale. A partner reaches a
        rank when their whole team has sold that many sq. yards. A new rate is used only for sales you record after saving. The monthly bonus is the same for every rank, you set it in Bonuses &amp; closing dates below.
      </p>

      <ul className="mt-6 space-y-4">
        {rows.map((r, i) => {
          const Icon = rewardIcon(r.icon);
          const pv = preview[i];
          const canRemove = i === last && rows.length > 1 && (r.isNew || !r.partners);
          return (
            <li key={r.rank_no} className="rounded-2xl border border-black/10 bg-[#fbf7f0] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-sm font-bold text-white shadow">
                    {i + 1}
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block break-words text-sm font-semibold text-ink">{r.title || "Rank"}</span>
                    {!r.isNew && (
                      <span className="mt-1.5 inline-block rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink/55 ring-1 ring-black/5">
                        {r.partners} partner{r.partners === 1 ? "" : "s"} here
                      </span>
                    )}
                  </span>
                </div>
                {i === last && rows.length > 1 && (
                  <button
                    type="button"
                    disabled={!canRemove}
                    onClick={() => setRows(rows.slice(0, -1))}
                    title={canRemove ? "Remove this rank" : "Partners are on this rank, so it cannot be removed"}
                    aria-label="Remove the last rank"
                    className={`${iconBtn} shrink-0 hover:!border-rose-500 hover:!text-rose-600`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4 lg:grid-cols-6">
                <div className="col-span-2 lg:col-span-4">
                  <label className={labelCls}>Rank name</label>
                  <input value={r.title} onChange={(e) => set(i, { title: e.target.value })} maxLength={60} className={smallInput} />
                </div>
                <div>
                  <label className={labelCls}>Sq. yards needed</label>
                  <input
                    value={r.min_area}
                    onChange={(e) => set(i, { min_area: e.target.value })}
                    inputMode="decimal"
                    disabled={i === 0}
                    className={`${smallInput} disabled:opacity-60`}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    <span className="sm:hidden">Commission %</span>
                    <span className="hidden sm:inline">Own sale commission %</span>
                  </label>
                  <input value={r.ps_rate} onChange={(e) => set(i, { ps_rate: e.target.value })} inputMode="decimal" className={smallInput} />
                </div>
                {/* the reward and its picture: the picture follows the name until you pick one yourself */}
                <div className="col-span-2 rounded-2xl bg-white p-3.5 ring-1 ring-black/5 sm:p-4 lg:col-span-6">
                  <div className="flex items-end gap-3">
                    <span
                      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                      title={r.reward}
                    >
                      <RewardPic image={r.image_url} icon={r.icon} iconClassName="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <label className={labelCls}>Reward</label>
                      <input
                        value={r.reward}
                        onChange={(e) => setReward(i, e.target.value)}
                        maxLength={60}
                        placeholder="e.g. Smart Watch"
                        className={smallInput}
                      />
                    </div>
                    <div className="w-32 shrink-0 sm:w-44">
                      <label className={labelCls}>Worth (₹)</label>
                      <input
                        value={r.reward_value}
                        onChange={(e) => set(i, { reward_value: e.target.value.replace(/[^0-9]/g, "") })}
                        inputMode="numeric"
                        placeholder="5000"
                        className={smallInput}
                      />
                    </div>
                  </div>

                  <p className="mb-2 mt-3.5 text-xs font-semibold text-ink/60">
                    Photo of the reward{" "}
                    <span className="font-normal text-ink/45">(shown on the website and in every partner&apos;s dashboard)</span>
                  </p>
                  <ImageUploader
                    value={r.image_url}
                    onChange={(url) => set(i, { image_url: url })}
                    aspect="aspect-[4/3]"
                    maxWidth="max-w-[220px]"
                    optional
                  />
                </div>

                <div className="col-span-2 lg:col-span-6">
                  <label className={labelCls}>Team difference example (printed on the chart)</label>
                  <input
                    value={r.team_example}
                    onChange={(e) => set(i, { team_example: e.target.value })}
                    maxLength={80}
                    placeholder="e.g. 10L BV x 0.25% = 2,500 Rs"
                    className={smallInput}
                  />
                </div>
              </div>

              {pv && (
                <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 rounded-xl bg-white px-4 py-2.5 text-xs text-ink/65 ring-1 ring-black/5">
                  <span>
                    Eligibility <b className="text-ink">{pv.area}</b>
                  </span>
                  <span>
                    Example <b className="text-ink">{pv.example}</b>
                  </span>
                  <span>
                    Team difference <b className="text-ink">{pv.team}</b>
                  </span>
                  {pv.rewardValue && (
                    <span>
                      Reward worth <b className="text-ink">{pv.rewardValue}</b>
                    </span>
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={add} disabled={rows.length >= 20} className={btnGhost}>
          <Plus className="h-4 w-4" /> Add a rank
        </button>
        <button type="button" onClick={save} disabled={pending} className={btnPrimary}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save the plan
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <Notice ok={msg.ok}>{msg.text}</Notice>
        <div className="flex flex-col gap-3 rounded-2xl bg-[#fff8ef] p-4 text-sm text-ink/70 ring-1 ring-copper/15 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
            <span>
              If you lowered the sq. yards for a rank, partners get it on their next sale. To give it to everyone who already qualifies right now, press the
              button. Ranks are only ever added, never taken away.
            </span>
          </p>
          <button type="button" onClick={recheck} disabled={rechecking} className={`${btnGhost} shrink-0`}>
            {rechecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Update everyone&apos;s ranks
          </button>
        </div>
      </div>
    </section>
  );
}

// The referral code pattern.
function RulesCard({ rules, prefixes }) {
  const router = useRouter();
  const [v, setV] = useState(rules);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState({ ok: false, text: "" });
  const set = (patch) => setV((p) => ({ ...p, ...patch }));

  const sample = v.mode === "fixed" ? `${v.prefix.toUpperCase() || "??"}0011` : "UP810011";

  const save = () =>
    start(async () => {
      setMsg({ ok: false, text: "" });
      const res = await saveRules(v);
      if (res.success) {
        setMsg({ ok: true, text: "Saved. New partners get codes in this pattern. Codes already given do not change." });
        router.refresh();
      } else setMsg({ ok: false, text: res.error });
    });

  return (
    <section className={card}>
      <h2 className="font-display text-2xl font-bold text-ink">
        Referral <span className="text-copper">code</span>
      </h2>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink/60">
        Every partner gets a code when they register, and anyone who joins with it becomes part of their team. Choose how the code looks.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          <div>
            <p className={labelCls}>Letters at the start</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["state", "State and district", "State letters, the district number and a running number from 0011, like UP810011 (UP = state, 81 = Aligarh). Numbers ending in 13 are skipped. After 9999 a letter is added: UP81A0011."],
                ["fixed", "One fixed prefix", "Every code starts with the same letters and only a running number follows, like BH0011."],
              ].map(([key, title, note]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set({ mode: key })}
                  aria-pressed={v.mode === key}
                  className={`rounded-2xl p-4 text-left transition ${
                    v.mode === key ? "bg-copper/10 ring-2 ring-copper" : "bg-[#fbf7f0] ring-1 ring-black/10 hover:ring-copper/50"
                  }`}
                >
                  <span className="block text-sm font-bold text-ink">{title}</span>
                  <span className="mt-1 block text-xs leading-snug text-ink/60">{note}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-xs">
            <label className={labelCls}>{v.mode === "fixed" ? "Prefix (2 to 5 letters)" : "Letters when the state is not known"}</label>
            <input
              value={v.prefix}
              onChange={(e) => set({ prefix: e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 5).toUpperCase() })}
              placeholder="BH"
              className={`${inputCls} uppercase tracking-wider`}
            />
          </div>
        </div>

        <div className="flex min-w-[200px] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#3a2a1f] to-[#14100d] px-8 py-6 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">The next code looks like</p>
          <p className="mt-2 text-3xl font-extrabold tabular-nums tracking-wider">{sample}</p>
        </div>
      </div>

      {Object.keys(prefixes).length > 0 && (
        <p className="mt-5 text-xs text-ink/55">
          Codes already in use:{" "}
          {Object.entries(prefixes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([k, n]) => `${k} × ${n}`)
            .join(", ")}
          . They keep working after you change the pattern.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={pending} className={btnPrimary}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </button>
      </div>
      <div className="mt-4">
        <Notice ok={msg.ok}>{msg.text}</Notice>
      </div>
    </section>
  );
}

// A small number box with a label, a unit and a line of help.
function Num({ label, value, onChange, unit, help, wide = false }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <input value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal" className={`${inputCls} ${unit ? "pr-16" : ""}`} />
        {unit && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink/45">{unit}</span>}
      </div>
      {help && <p className="mt-1.5 text-[11px] leading-snug text-ink/50">{help}</p>}
    </div>
  );
}

function Group({ title, accent, note, children }) {
  return (
    <div className="mt-8 border-t border-black/5 pt-6 first:mt-6 first:border-0 first:pt-0">
      <h3 className="font-display text-xl font-bold text-ink">
        {title} <span className="text-copper">{accent}</span>
      </h3>
      {note && <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-ink/55">{note}</p>}
      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </div>
  );
}

// Every number of the paper plan that is not a rank: when points are added, the monthly bonus and
// the levels it pays, the partnership and C.T.O. bonus, and the 50:50 reward condition.
function BonusRulesCard({ initial, rankNames }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState({ ok: false, text: "" });
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));

  const r = readRules(Object.fromEntries(Object.entries(RULE_KEYS).map(([k, key]) => [key, v[k]])));
  const own = monthlyShare(1000000, r.selfPct, r.months);
  const lvl = monthlyShare(1000000, r.levelPct, r.months);

  const save = () =>
    start(async () => {
      setMsg({ ok: false, text: "" });
      const res = await savePlanRules(v);
      if (res.success) {
        setMsg({ ok: true, text: "Saved. It is used for the sales you record from now on. Sales already recorded keep the way they were worked out." });
        router.refresh();
      } else setMsg({ ok: false, text: res.error });
    });

  return (
    <section className={card}>
      <h2 className="font-display text-2xl font-bold text-ink">
        Bonuses &amp; <span className="text-copper">closing dates</span>
      </h2>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink/60">
        Everything of the plan that is not a rank. The sales bonus of a sale is added on a closing date, the monthly bonus is added every month.
      </p>

      <Group
        title="When points are"
        accent="added"
        note={`A sale made on the 1st to 10th is added on the 11th, a sale of the 11th to 20th on the 21st and a sale of the 21st to the end of the month on the 1st. Until then the partner sees the points as pending.`}
      >
        <Num label="Closing days of the month" value={v.closeDays} onChange={set("closeDays")} help="Days 1 to 28, like 11, 21, 1" />
        <Num label="Closing hour" value={v.closeHour} onChange={set("closeHour")} unit="0 - 23" help={`Now ${hourText(r.closeHour)} (India time)`} />
        <Num label="Monthly bonus is added on day" value={v.monthDay} onChange={set("monthDay")} help="Every month, at the closing hour" />
      </Group>

      <Group
        title="Monthly"
        accent="bonus"
        note="A percentage of every sale, paid in equal instalments over the months. The seller gets one percentage, and each level of the team above the seller gets another."
      >
        <Num label="Seller (own sale)" value={v.selfPct} onChange={set("selfPct")} unit="%" help="Of the sale value" />
        <Num label="Each level above" value={v.levelPct} onChange={set("levelPct")} unit="%" help="Of the sale value, for every open level" />
        <Num label="Number of levels" value={v.levels} onChange={set("levels")} help="Levels of the team that are paid" />
        <Num label="Paid over" value={v.months} onChange={set("months")} unit="months" help="Instalments, one a month" />
      </Group>

      <Group
        title="Which levels are"
        accent="open"
        note="A level pays a partner only when it is open for them. Either their own sales open levels, or each direct partner opens one level. They get whichever opens more."
      >
        <Num label="Own sales that open levels" value={v.openArea} onChange={set("openArea")} unit="sq. yd" help="Every time they sell this much" />
        <Num label="Levels it opens" value={v.openStep} onChange={set("openStep")} help={`${r.openArea} sq. yd opens ${r.openStep}, ${r.openArea * 2} opens ${r.openStep * 2}...`} />
      </Group>

      <Group
        title="Partnership"
        accent="bonus"
        note="A percentage of the company's sales of a month, shared equally by all active partners. You share it from Points & Payouts once the month is over."
      >
        <Num label="Share of the company's sales" value={v.partnershipPct} onChange={set("partnershipPct")} unit="%" />
        <Num label="Most a partner can get" value={v.capX} onChange={set("capX")} unit="times" help="Times the joining fee. 0 = no limit" />
      </Group>

      <Group
        title="C.T.O."
        accent="bonus"
        note="A percentage of the company's sales of a month, shared equally by the partners who reached the rank below."
      >
        <Num label="Share of the company's sales" value={v.ctoPct} onChange={set("ctoPct")} unit="%" />
        <div>
          <label className={labelCls}>Shared by the rank</label>
          <select value={v.ctoRank} onChange={(e) => set("ctoRank")(e.target.value)} className={inputCls}>
            {rankNames.map((name, i) => (
              <option key={i} value={i + 1}>
                {i + 1}. {name} and above
              </option>
            ))}
          </select>
        </div>
      </Group>

      <Group
        title="Shared"
        accent="by itself"
        note="Every night at 1 AM (India time) the system looks at the date. From the day below on, it shares last month's partnership bonus and C.T.O. bonus by itself, once. Switch it off to share them by hand on Points & Payouts."
      >
        <div className="sm:col-span-2">
          <p className={labelCls}>Share them by itself</p>
          <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
            <Switch checked={String(v.poolAuto) !== "0"} onChange={(on) => set("poolAuto")(on ? "1" : "0")} label="Share the pool bonuses by itself" />
            <span className="text-sm text-ink/70">{String(v.poolAuto) !== "0" ? "On: shared at 1 AM by itself" : "Off: you share them by hand"}</span>
          </div>
        </div>
        <Num label="From day of the month" value={v.poolDay} onChange={set("poolDay")} help="1 = on the 1st. A later day gives time to record late sales." />
      </Group>

      <Group
        title="Reward"
        accent="condition"
        note="For a reward at, say, 1000 sq. yards, the strongest leg of the team counts for only this much of it. The rest must come from the other legs and the partner's own sales."
      >
        <Num label="Strongest leg counts at most" value={v.powerPct} onChange={set("powerPct")} unit="%" help={`${r.powerPct}:${100 - r.powerPct}`} />
      </Group>

      <div className="mt-8 rounded-2xl bg-[#fff8ef] p-4 text-sm leading-relaxed text-ink/70 ring-1 ring-copper/15">
        <p className="font-semibold text-ink">A sale of ₹10,00,000 pays the monthly bonus like this</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px]">
          <li>
            Seller: {pctText(r.selfPct)}% = ₹{inr(own.total)}, that is ₹{own.each.toLocaleString("en-IN")} a month for {r.months} months.
          </li>
          <li>
            Each open level: {pctText(r.levelPct)}% = ₹{inr(lvl.total)}, that is ₹{lvl.each.toLocaleString("en-IN")} a month for {r.months} months (up to level {r.levels}).
          </li>
          <li>The sales bonus of the rank (2% to 4%) is added on {closeDaysText(r)} at {hourText(r.closeHour)}.</li>
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={pending} className={btnPrimary}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </button>
      </div>
      <div className="mt-4">
        <Notice ok={msg.ok}>{msg.text}</Notice>
      </div>
    </section>
  );
}

export default function PlanManager({ plan }) {
  return (
    <div className="space-y-8">
      <RanksCard
        initial={plan.ranks}
        rules={readRules(Object.fromEntries(Object.entries(RULE_KEYS).map(([k, key]) => [key, plan.bonus[k]])))}
      />
      <BonusRulesCard initial={plan.bonus} rankNames={plan.ranks.map((x) => x.title)} />
      <RulesCard rules={plan.rules} prefixes={plan.prefixes} />

      <section className={card}>
        <h2 className="font-display text-2xl font-bold text-ink">
          Other <span className="text-copper">plan settings</span>
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["/admin/payment", "Joining payment", "The amount a new partner pays before the account is activated, and the bank, UPI and contact details."],
            ["/admin/partners", "Activating a partner", "Open a partner and mark the payment as paid. You can write the amount actually received."],
            ["/admin/sales", "Recording a sale", "The seller and everyone above them in the team get their commission points when you record it."],
            ["/admin/payouts", "Points, payouts and pool bonuses", "Add a payout when you pay a partner. Share the partnership and C.T.O. bonus here once a month. 1 point = ₹1."],
            ["/admin/partner-page", "Words on the plan page", "Partnership bonus, sales bonus, monthly bonus, C.T.O. bonus and the notes printed under the chart."],
          ].map(([href, title, text]) => (
            <li key={href}>
              <a
                href={href}
                className="group flex h-full items-start gap-3 rounded-2xl bg-[#fbf7f0] p-4 ring-1 ring-black/5 transition hover:ring-copper/50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">{title}</span>
                  <span className="mt-1 block text-xs leading-snug text-ink/60">{text}</span>
                </span>
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-copper/60 transition group-hover:text-copper" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
