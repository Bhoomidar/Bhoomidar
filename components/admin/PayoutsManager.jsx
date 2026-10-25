"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeIndianRupee,
  CalendarClock,
  Check,
  ChevronDown,
  Coins,
  Gift,
  Plus,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import {
  addPoints,
  creditMonthlyBonuses,
  markRewardGiven,
  recordPayout,
} from "@/actions/admin/commission";
import { fmtDate, fmtPoints } from "@/lib/points";
import { CoinPileArt, CoinsArt, BarsArt, PeopleArt, TeamArt, ClipboardArt } from "@/components/dashboard/StatArt";
import ConfirmDialog from "../ConfirmDialog";
import Select from "../Select";
import Modal from "./Modal";
import { btnGhost, btnPrimary, card, inputCls, labelCls } from "./ui";

const PAY_MODES = ["UPI", "Bank transfer", "Cash", "Other"];

const field =
  "w-full rounded-2xl border border-black/10 bg-white text-sm text-ink shadow-[0_8px_20px_-14px_rgba(110,60,20,0.45)] outline-none transition placeholder:text-ink/45 focus:border-copper focus:ring-4 focus:ring-copper/15";
const th = "px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/55";
const rowCard =
  "flex items-center gap-4 rounded-2xl bg-white px-4 py-3.5 shadow-[0_10px_24px_-18px_rgba(110,60,20,0.5)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:ring-copper/30";

function Avatar({ url, name, className = "h-12 w-12 text-base" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark font-bold text-white shadow-md shadow-copper/30 ring-2 ring-white ${className}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        (name || "?")[0].toUpperCase()
      )}
    </span>
  );
}

function Stat({ icon: Icon, art: Art, label, value, note, theme }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} p-5 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.4)] ring-1 ${theme.ring} transition duration-300 hover:-translate-y-1`}
    >
      <Art
        className={`pointer-events-none absolute bottom-3 right-3 h-20 w-24 origin-bottom-right transition duration-500 group-hover:scale-110 ${theme.art ?? ""}`}
      />
      <div className="relative flex items-center gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-sm ${theme.chip}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-medium text-ink/70">{label}</p>
          <p className="mt-1 text-4xl font-extrabold tabular-nums text-ink">{value}</p>
        </div>
      </div>
      <p className="relative mt-3 max-w-[62%] text-xs text-ink/55">{note}</p>
    </div>
  );
}

function SectionTitle({ icon: Icon, children, count }) {
  return (
    <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-ink sm:text-[1.7rem]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
        <Icon className="h-5 w-5" />
      </span>
      {children}
      {count > 0 && (
        <span className="rounded-full bg-copper/10 px-3 py-1 font-sans text-sm font-bold text-copper-dark ring-1 ring-copper/20">
          {count}
        </span>
      )}
    </h2>
  );
}

// How much of what a partner earned has been paid out.
function PaidBar({ earned, paid }) {
  const pct = earned > 0 ? Math.min(100, Math.round((paid / earned) * 100)) : 0;
  return (
    <span className="mt-1.5 flex items-center gap-2" title={`${pct}% of earned points paid`}>
      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-black/10">
        <span className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-[11px] font-semibold text-ink/50">{pct}%</span>
    </span>
  );
}

export default function PayoutsManager({ overview }) {
  const router = useRouter();
  const { rows, rewards, recent, totals } = overview;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [paying, setPaying] = useState(null);
  const [adding, setAdding] = useState(false);
  const [giving, setGiving] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const toPay = rows.filter((r) => r.balance > 0).length;

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "due" && r.balance <= 0) return false;
      if (filter === "settled" && r.balance > 0) return false;
      if (!term) return true;
      return [r.name, r.code, r.rank].join(" ").toLowerCase().includes(term);
    });
  }, [rows, search, filter]);

  const shownTotals = useMemo(
    () => ({
      earned: shown.reduce((t, r) => t + r.earned, 0),
      paid: shown.reduce((t, r) => t + r.paid, 0),
      balance: shown.reduce((t, r) => t + Math.max(0, r.balance), 0),
    }),
    [shown],
  );

  const monthly = () =>
    start(async () => {
      setError("");
      setMessage("");
      const res = await creditMonthlyBonuses();
      if (!res.success) return setError(res.error);
      setMessage(
        res.added > 0
          ? `Credited ${res.added} monthly bonus${res.added === 1 ? "" : "es"}.`
          : "Nothing new is due. All monthly bonuses are already credited.",
      );
      router.refresh();
    });

  const confirmGiven = () =>
    start(async () => {
      const r = giving;
      setError("");
      const res = await markRewardGiven(r.partnerId, r.rankNo);
      if (!res.success) setError(res.error);
      setGiving(null);
      router.refresh();
    });

  const stats = [
    {
      icon: Wallet,
      art: CoinPileArt,
      label: "Points owed",
      value: fmtPoints(totals.owed),
      note: "to be paid to partners (1 point = ₹1)",
      theme: { bg: "from-[#fff1cf] to-[#fffaf0]", ring: "ring-amber-300/30", chip: "bg-amber-200/80 text-amber-700" },
    },
    {
      icon: BadgeIndianRupee,
      art: BarsArt,
      label: "Points paid out",
      value: fmtPoints(totals.paid),
      note: "already handed to partners",
      theme: { bg: "from-[#dff5e8] to-[#f5fcf8]", ring: "ring-emerald-300/30", chip: "bg-emerald-200/80 text-emerald-700", art: "text-emerald-500" },
    },
    {
      icon: Coins,
      art: CoinsArt,
      label: "Total earned",
      value: fmtPoints(totals.earned),
      note: "all points partners have earned",
      theme: { bg: "from-[#fdebdc] to-[#fff6ec]", ring: "ring-copper/10", chip: "bg-[#f9d6b8] text-copper", art: "text-copper" },
    },
    {
      icon: Users,
      art: PeopleArt,
      label: "Partners to pay",
      value: toPay,
      note: rewards.length > 0 ? `${rewards.length} reward${rewards.length === 1 ? "" : "s"} waiting too` : "with points waiting",
      theme: { bg: "from-[#e3ecfd] to-[#f6f9ff]", ring: "ring-sky-300/30", chip: "bg-sky-200/80 text-sky-700", art: "text-sky-500" },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      {/* Search, filter and the two things you do here */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative xl:w-[320px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-copper" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search partner, code or rank..."
            className={`${field} py-3.5 pl-11 pr-4`}
          />
        </div>
        <Select
          wrapperClassName="xl:w-[190px]"
          variant="toolbar"
          value={filter}
          onChange={setFilter}
          ariaLabel="Filter partners"
          menuMinWidth={200}
          options={[
            { value: "all", label: "All partners" },
            { value: "due", label: "Points to pay" },
            { value: "settled", label: "Settled" },
          ]}
        />
        <p className="text-sm text-ink/60">
          Showing {shown.length} of {rows.length}
        </p>
        <div className="flex flex-wrap gap-3 xl:ml-auto">
          <button onClick={monthly} disabled={pending} className={`${btnGhost} !rounded-2xl !px-5 !py-3 shadow-[0_8px_20px_-14px_rgba(110,60,20,0.45)]`}>
            <CalendarClock className="h-4 w-4 text-copper" />
            Credit monthly bonus
          </button>
          <button onClick={() => setAdding(true)} className={`${btnPrimary} !rounded-2xl !px-5 !py-3`}>
            <Plus className="h-4 w-4" />
            Add bonus / adjustment
          </button>
        </div>
      </div>

      {message && (
        <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
          <Check className="h-4 w-4" strokeWidth={3} />
          {message}
        </p>
      )}
      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">{error}</p>}

      {/* Partners */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5">
        {shown.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <ClipboardArt className="h-28 w-32" />
            <p className="mt-2 text-sm font-semibold text-ink/65">
              {rows.length === 0 ? "No activated partners yet." : "No partners found."}
            </p>
          </div>
        ) : (
          <>
            {/* Phones: a card per partner */}
            <ul className="divide-y divide-black/5 md:hidden">
              {shown.map((r) => (
                <li key={r.id} className="px-5 py-4">
                  <div className="flex items-center gap-3.5">
                    <Avatar url={r.avatarUrl} name={r.name} />
                    <a href={`/admin/partners/${r.id}`} className="min-w-0 flex-1 leading-tight">
                      <span className="block [overflow-wrap:anywhere] text-[15px] font-bold text-ink">{r.name}</span>
                      <span className="mt-1 block [overflow-wrap:anywhere] text-xs text-ink/55">
                        {r.code} · {r.rank}
                        {!r.active && " · switched off"}
                      </span>
                    </a>
                    <span className="shrink-0 text-right leading-tight">
                      <span className="block text-[11px] text-ink/50">Balance</span>
                      <span className="mt-0.5 block text-lg font-extrabold tabular-nums text-copper">{fmtPoints(r.balance)}</span>
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-ink/55">
                      Earned <b className="text-ink">{fmtPoints(r.earned)}</b> · Paid <b className="text-ink">{fmtPoints(r.paid)}</b>
                      <PaidBar earned={r.earned} paid={r.paid} />
                    </span>
                    <button
                      onClick={() => setPaying(r)}
                      disabled={r.balance <= 0}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-35"
                    >
                      <Wallet className="h-4 w-4" />
                      Mark paid
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-black/5 bg-gradient-to-b from-white to-[#fcf6ee]">
                  <th className={`${th} pl-6`}>Partner</th>
                  <th className={`${th} hidden xl:table-cell`}>Rank</th>
                  <th className={`${th} text-right`}>Earned</th>
                  <th className={`${th} text-right`}>Paid</th>
                  <th className={`${th} text-right`}>Balance</th>
                  <th className={`${th} pr-6 text-right`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {shown.map((r) => (
                  <tr key={r.id} className="transition hover:bg-[#fffaf3]">
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex items-center gap-3.5">
                        <Avatar url={r.avatarUrl} name={r.name} />
                        <span className="min-w-0 max-w-[240px] leading-tight">
                          <a
                            href={`/admin/partners/${r.id}`}
                            className="block [overflow-wrap:anywhere] text-[15px] font-bold text-ink transition hover:text-copper"
                            title="Open full profile"
                          >
                            {r.name}
                          </a>
                          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full bg-[#f6ecdf] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink/75 ring-1 ring-copper/10">
                              {r.code || "—"}
                            </span>
                            <span className="rounded-full bg-copper/10 px-2.5 py-0.5 text-[11px] font-bold text-copper-dark ring-1 ring-copper/15 xl:hidden">
                              {r.rank}
                            </span>
                            {!r.active && (
                              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200">
                                Off
                              </span>
                            )}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-3 py-4 xl:table-cell">
                      <span className="rounded-full bg-copper/10 px-3 py-1.5 text-xs font-bold text-copper-dark ring-1 ring-copper/15">
                        {r.rank}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right text-sm font-medium tabular-nums text-ink/80">{fmtPoints(r.earned)}</td>
                    <td className="px-3 py-4 text-right">
                      <span className="block text-sm font-medium tabular-nums text-ink/80">{fmtPoints(r.paid)}</span>
                      <span className="flex justify-end">
                        <PaidBar earned={r.earned} paid={r.paid} />
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <span
                        className={`inline-block rounded-full px-3.5 py-1.5 text-base font-extrabold tabular-nums ring-1 ${
                          r.balance > 0 ? "bg-amber-50 text-copper-dark ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        }`}
                      >
                        {fmtPoints(r.balance)}
                      </span>
                    </td>
                    <td className="py-4 pl-3 pr-6 text-right">
                      <button
                        onClick={() => setPaying(r)}
                        disabled={r.balance <= 0}
                        className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:bg-none disabled:bg-black/5 disabled:text-ink/35 disabled:shadow-none"
                      >
                        <Wallet className="h-4 w-4" />
                        {r.balance > 0 ? "Mark paid" : "Settled"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-black/10 bg-[#fcf6ee]">
                  <td className="py-4 pl-6 pr-3 text-xs font-bold uppercase tracking-[0.12em] text-ink/60">
                    Total ({shown.length})
                  </td>
                  <td className="hidden xl:table-cell" />
                  <td className="px-3 py-4 text-right text-sm font-bold tabular-nums text-ink">{fmtPoints(shownTotals.earned)}</td>
                  <td className="px-3 py-4 text-right text-sm font-bold tabular-nums text-ink">{fmtPoints(shownTotals.paid)}</td>
                  <td className="px-3 py-4 text-right text-base font-extrabold tabular-nums text-copper-dark">
                    {fmtPoints(shownTotals.balance)}
                  </td>
                  <td className="pr-6" />
                </tr>
              </tfoot>
            </table>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className={`${card} min-w-0`}>
          <SectionTitle icon={Gift} count={rewards.length}>
            Rewards to <span className="text-copper">hand over</span>
          </SectionTitle>
          {rewards.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <TeamArt className="h-20 w-32" />
              <p className="mt-2 text-sm text-ink/55">No reward is waiting.</p>
            </div>
          ) : (
            <ul className="mt-5 space-y-2.5">
              {rewards.map((r) => (
                <li key={r.partnerId + r.rankNo} className={rowCard}>
                  <Avatar url={r.avatarUrl} name={r.name} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <a href={`/admin/partners/${r.partnerId}`} className="block [overflow-wrap:anywhere] text-base font-bold text-ink transition hover:text-copper">
                      {r.name}
                    </a>
                    <span className="mt-1 block text-xs text-ink/55">
                      {r.rank} · <b className="text-copper-dark">{r.reward}</b> · {fmtDate(r.at)}
                    </span>
                  </span>
                  <button
                    onClick={() => setGiving(r)}
                    disabled={pending}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-ink/80 shadow-sm ring-1 ring-black/10 transition hover:text-emerald-700 hover:ring-emerald-400"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    Given
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-5 rounded-xl bg-[#fbf7f0] px-3.5 py-3 text-xs text-ink/55 ring-1 ring-black/5">
            Reward condition on the plan: Power 50% BV, Rest 50% BV. Check it before you hand a reward over.
          </p>
        </section>

        <section className={`${card} min-w-0`}>
          <SectionTitle icon={BadgeIndianRupee} count={recent.length}>
            Latest <span className="text-copper">payouts</span>
          </SectionTitle>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <ClipboardArt className="h-24 w-28" />
              <p className="mt-2 text-sm text-ink/55">Nothing has been paid out yet.</p>
            </div>
          ) : (
            <ul className="mt-5 max-h-[460px] space-y-2.5 overflow-y-auto pr-1">
              {recent.map((p) => (
                <li key={p.id} className={rowCard}>
                  <Avatar url={p.avatarUrl} name={p.name} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <a href={`/admin/partners/${p.partnerId}`} className="block [overflow-wrap:anywhere] text-base font-bold text-ink transition hover:text-copper">
                      {p.name}
                    </a>
                    <span className="mt-1 block [overflow-wrap:anywhere] text-xs text-ink/55">
                      {fmtDate(p.at)}
                      {p.note && ` · ${p.note}`}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-3.5 py-1.5 text-sm font-extrabold tabular-nums text-emerald-800 ring-1 ring-emerald-200">
                    {fmtPoints(p.points)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {giving && (
        <ConfirmDialog
          tone="warn"
          icon={Gift}
          title="Reward handed over?"
          text={
            <>
              <b className="text-ink">{giving.name}</b>&apos;s <b className="text-ink">{giving.rank}</b> reward (
              {giving.reward}) will be marked as given and leave this list.
            </>
          }
          confirmText="Yes, it is given"
          busy={pending}
          onConfirm={confirmGiven}
          onCancel={() => setGiving(null)}
        />
      )}
      {paying && (
        <PayModal
          partner={paying}
          onClose={() => setPaying(null)}
          onDone={() => {
            setPaying(null);
            router.refresh();
          }}
        />
      )}
      {adding && (
        <AddModal
          partners={rows}
          onClose={() => setAdding(false)}
          onDone={() => {
            setAdding(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function PayModal({ partner, onClose, onDone }) {
  const [points, setPoints] = useState(String(partner.balance));
  const [mode, setMode] = useState("UPI");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const entered = Math.max(0, Math.round(Number(points) || 0));
  const left = partner.balance - entered;
  const tooMuch = entered > partner.balance;

  const submit = (e) => {
    e.preventDefault();
    start(async () => {
      const note = reference.trim() ? `${mode} · ${reference.trim()}` : mode;
      const res = await recordPayout({ partnerId: partner.id, points, note });
      if (!res.success) return setError(res.error);
      onDone();
    });
  };

  return (
    <Modal title="Mark points as paid" onClose={onClose}>
      <form onSubmit={submit} className="space-y-6">
        <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <Avatar url={partner.avatarUrl} name={partner.name} className="h-14 w-14 text-lg" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="[overflow-wrap:anywhere] text-base font-bold text-ink">{partner.name}</p>
            <p className="mt-1 text-sm text-ink/55">
              {partner.code} · {partner.rank}
            </p>
          </div>
          <div className="shrink-0 text-right leading-tight">
            <p className="text-xs text-ink/55">Balance</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-copper">{fmtPoints(partner.balance)}</p>
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="pay-points">Points paid (1 point = ₹1)</label>
          <input id="pay-points" required type="number" min="1" max={partner.balance} step="1" value={points} onChange={(e) => setPoints(e.target.value)} className={inputCls} />
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {[
              ["Full balance", partner.balance],
              ["Half", Math.floor(partner.balance / 2)],
            ].map(([label, value]) => (
              <button
                key={label}
                type="button"
                onClick={() => setPoints(String(value))}
                className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-ink/70 ring-1 ring-black/10 transition hover:text-copper hover:ring-copper"
              >
                {label} · {fmtPoints(value)}
              </button>
            ))}
            <span className={`ml-auto text-xs font-semibold ${tooMuch ? "text-rose-700" : "text-ink/55"}`}>
              {tooMuch ? "More than the balance" : `Balance after: ${fmtPoints(left)}`}
            </span>
          </div>
        </div>

        <div>
          <p className={labelCls}>How did you pay?</p>
          <div className="flex flex-wrap gap-2">
            {PAY_MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === m
                    ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                    : "bg-white text-ink/70 ring-1 ring-black/10 hover:ring-copper"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="pay-ref">Reference (optional)</label>
          <input id="pay-ref" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={150} placeholder="UPI transaction ID, cheque number..." className={inputCls} />
        </div>

        {error && <p className="text-sm text-rose-700">{error}</p>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
          <button type="submit" disabled={pending || tooMuch} className={btnPrimary}>
            {pending ? "Saving..." : "Mark as paid"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddModal({ partners, onClose, onDone }) {
  const [partnerId, setPartnerId] = useState("");
  const [kind, setKind] = useState("cto");
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const submit = (e) => {
    e.preventDefault();
    start(async () => {
      const res = await addPoints({ partnerId, kind, points, note });
      if (!res.success) return setError(res.error);
      onDone();
    });
  };

  return (
    <Modal title="Add bonus or adjustment" onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className={labelCls} htmlFor="add-partner">Partner</label>
          <Select
            id="add-partner"
            required
            searchable
            icon={Users}
            value={partnerId}
            onChange={setPartnerId}
            placeholder="Choose a partner"
            options={partners.map((p) => ({ value: p.id, label: p.name, hint: p.code, avatar: true, avatarUrl: p.avatarUrl }))}
          />
        </div>

        <div>
          <p className={labelCls}>Type</p>
          <div className="flex flex-wrap gap-2">
            {[
              ["cto", "C.T.O. bonus"],
              ["adjustment", "Adjustment (+ or −)"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value)}
                aria-pressed={kind === value}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  kind === value
                    ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                    : "bg-white text-ink/70 ring-1 ring-black/10 hover:ring-copper"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="add-points">Points</label>
            <input id="add-points" required type="number" step="1" value={points} onChange={(e) => setPoints(e.target.value)} placeholder={kind === "adjustment" ? "500 or -500" : "5000"} className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="add-note">Note (the partner sees it)</label>
            <input id="add-note" required value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="C.T.O. bonus, October" className={inputCls} />
          </div>
        </div>

        <p className="rounded-xl bg-[#fbf7f0] px-3.5 py-3 text-xs text-ink/55 ring-1 ring-black/5">
          The C.T.O. bonus is added by hand because its amount is not worked out by the system. Use Adjustment to correct a mistake; a minus number takes points away.
        </p>
        {error && <p className="text-sm text-rose-700">{error}</p>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
          <button type="submit" disabled={pending} className={btnPrimary}>
            {pending ? "Saving..." : "Add points"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
