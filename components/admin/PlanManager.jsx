"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Info, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { recheckRanks, saveRankPlan, saveRules } from "@/actions/admin/plan";
import { buildChart } from "@/lib/planChart";
import { REWARD_ICON_NAMES, rewardIcon } from "@/lib/rankIcons";
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
function RanksCard({ initial, months }) {
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
          monthly_bonus: Number(String(r.monthly_bonus).replace(/,/g, "")) || 0,
          reward: r.reward,
          icon: r.icon,
          team_example: r.team_example,
        })),
        months,
      ),
    [rows, months],
  );

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
        monthly_bonus: String(Math.round((Number(last?.monthly_bonus) || 1000) * 1.5)),
        reward: "",
        icon: "Gift",
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
        rank when their whole team has sold that many sq. yards. A new rate is used only for sales you record after saving.
      </p>

      <ul className="mt-6 space-y-4">
        {rows.map((r, i) => {
          const Icon = rewardIcon(r.icon);
          const pv = preview[i];
          const canRemove = i === last && rows.length > 1 && (r.isNew || !r.partners);
          return (
            <li key={r.rank_no} className="rounded-2xl border border-black/10 bg-[#fbf7f0] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-sm font-bold text-white shadow">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-ink">{r.title || "Rank"}</span>
                  {!r.isNew && (
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink/55 ring-1 ring-black/5">
                      {r.partners} partner{r.partners === 1 ? "" : "s"} here
                    </span>
                  )}
                </span>
                {i === last && rows.length > 1 && (
                  <button
                    type="button"
                    disabled={!canRemove}
                    onClick={() => setRows(rows.slice(0, -1))}
                    title={canRemove ? "Remove this rank" : "Partners are on this rank, so it cannot be removed"}
                    aria-label="Remove the last rank"
                    className={`${iconBtn} hover:!border-rose-500 hover:!text-rose-600`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div className="lg:col-span-2">
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
                  <label className={labelCls}>Own sale commission %</label>
                  <input value={r.ps_rate} onChange={(e) => set(i, { ps_rate: e.target.value })} inputMode="decimal" className={smallInput} />
                </div>
                <div>
                  <label className={labelCls}>Monthly bonus (₹)</label>
                  <input value={r.monthly_bonus} onChange={(e) => set(i, { monthly_bonus: e.target.value })} inputMode="numeric" className={smallInput} />
                </div>
                <div>
                  <label className={labelCls}>Reward</label>
                  <div className="flex items-center gap-2">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-copper/10 text-copper">
                      <Icon className="h-5 w-5" />
                    </span>
                    <select value={r.icon} onChange={(e) => set(i, { icon: e.target.value })} className={`${smallInput} w-full`} aria-label="Reward picture">
                      {REWARD_ICON_NAMES.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className={labelCls}>Reward name</label>
                  <input value={r.reward} onChange={(e) => set(i, { reward: e.target.value })} maxLength={60} placeholder="e.g. Smart Watch" className={smallInput} />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className={labelCls}>Team commission example (printed on the chart)</label>
                  <input
                    value={r.team_example}
                    onChange={(e) => set(i, { team_example: e.target.value })}
                    maxLength={80}
                    placeholder="e.g. 30L BV x 0.25% = 7,500 Rs"
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
                    Team commission <b className="text-ink">{pv.team}</b>
                  </span>
                  <span>
                    Monthly bonus <b className="text-ink">{pv.monthly}</b> = <b className="text-ink">{pv.monthlyTotal}</b>
                  </span>
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

// The monthly bonus length and the referral code pattern.
function RulesCard({ rules, prefixes }) {
  const router = useRouter();
  const [v, setV] = useState(rules);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState({ ok: false, text: "" });
  const set = (patch) => setV((p) => ({ ...p, ...patch }));

  const letters = v.mode === "fixed" ? v.prefix.toUpperCase() : "UP";
  const sample = `${letters || "??"}-${"8101234567".slice(0, Math.max(4, Math.min(8, Number(v.digits) || 4)))}`;

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
                ["state", "State letters", "Two letters of the partner's state, like UP-8101 or MH-4420."],
                ["fixed", "One fixed prefix", "Every code starts with the same letters, like BHM-8101."],
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{v.mode === "fixed" ? "Prefix (2 to 5 letters)" : "Letters when the state is not known"}</label>
              <input
                value={v.prefix}
                onChange={(e) => set({ prefix: e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 5).toUpperCase() })}
                placeholder="BH"
                className={`${inputCls} uppercase tracking-wider`}
              />
            </div>
            <div>
              <label className={labelCls}>Digits after the dash</label>
              <select value={v.digits} onChange={(e) => set({ digits: e.target.value })} className={inputCls}>
                {[4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} digits
                  </option>
                ))}
              </select>
            </div>
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

      <div className="mt-8 border-t border-black/5 pt-6">
        <h3 className="font-display text-xl font-bold text-ink">
          Monthly <span className="text-copper">bonus</span>
        </h3>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className={labelCls}>Paid for how many months</label>
            <input value={v.months} onChange={(e) => set({ months: e.target.value.replace(/\D/g, "").slice(0, 2) })} inputMode="numeric" className={`${inputCls} w-40`} />
          </div>
          <p className="max-w-md pb-3 text-xs leading-relaxed text-ink/55">
            After a partner reaches a rank, the bonus of that rank is added once for each completed month, up to this many months.
          </p>
        </div>
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
      <RanksCard initial={plan.ranks} months={Number(plan.rules.months) || 12} />
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
            ["/admin/payouts", "Redeeming points", "Add a payout when you pay a partner their points. 1 point = ₹1."],
            ["/admin/partner-page", "Words on the plan page", "Partner bonus, sales bonus, C.T.O. bonus and the notes printed under the chart."],
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
