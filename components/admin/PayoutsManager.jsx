"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeIndianRupee, CalendarClock, Check, Coins, Gift, Plus, Search, Wallet } from "lucide-react";
import {
  addPoints,
  creditMonthlyBonuses,
  markRewardGiven,
  recordPayout,
} from "@/actions/admin/commission";
import { fmtDate, fmtPoints } from "@/lib/points";
import Modal from "./Modal";
import { btnGhost, btnPrimary, card, inputCls, labelCls } from "./ui";

const PAY_MODES = ["UPI", "Bank transfer", "Cash", "Other"];

export default function PayoutsManager({ overview }) {
  const router = useRouter();
  const { rows, rewards, recent, totals } = overview;
  const [search, setSearch] = useState("");
  const [paying, setPaying] = useState(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => [r.name, r.code, r.rank].join(" ").toLowerCase().includes(term));
  }, [rows, search]);

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

  const given = (r) =>
    start(async () => {
      setError("");
      const res = await markRewardGiven(r.partnerId, r.rankNo);
      if (!res.success) setError(res.error);
      router.refresh();
    });

  const stats = [
    { icon: Wallet, label: "Points owed to partners", value: fmtPoints(totals.owed), tone: "bg-amber-100 text-amber-700" },
    { icon: BadgeIndianRupee, label: "Points paid out", value: fmtPoints(totals.paid), tone: "bg-emerald-100 text-emerald-700" },
    { icon: Coins, label: "Total points earned", value: fmtPoints(totals.earned), tone: "bg-copper/10 text-copper" },
  ];

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map(({ icon: Icon, label, value, tone }) => (
          <div key={label} className={card}>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-3xl font-extrabold tabular-nums text-ink">{value}</p>
            <p className="mt-0.5 text-xs text-ink/55">{label} (1 point = ₹1)</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search partner or rank" className={`${inputCls} pl-10`} />
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={monthly} disabled={pending} className={btnGhost}>
            <CalendarClock className="h-4 w-4" />
            Credit monthly bonus
          </button>
          <button onClick={() => setAdding(true)} className={btnPrimary}>
            <Plus className="h-4 w-4" />
            Add bonus / adjustment
          </button>
        </div>
      </div>

      {message && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}

      <div className={`${card} mt-4 overflow-x-auto !p-0`}>
        {shown.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-ink/55">No activated partners yet.</p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-black/5 text-[11px] font-semibold uppercase tracking-wider text-ink/50">
              <tr>
                <th className="px-5 py-3.5">Partner</th>
                <th className="px-4 py-3.5">Rank</th>
                <th className="px-4 py-3.5 text-right">Earned</th>
                <th className="px-4 py-3.5 text-right">Paid</th>
                <th className="px-4 py-3.5 text-right">Balance</th>
                <th className="px-5 py-3.5 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {shown.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-4">
                    <span className="block font-semibold text-ink">{r.name}</span>
                    <span className="block text-xs text-ink/50">{r.code}{!r.active && " · switched off"}</span>
                  </td>
                  <td className="px-4 py-4 text-ink/70">{r.rank}</td>
                  <td className="px-4 py-4 text-right tabular-nums">{fmtPoints(r.earned)}</td>
                  <td className="px-4 py-4 text-right tabular-nums text-ink/60">{fmtPoints(r.paid)}</td>
                  <td className="px-4 py-4 text-right text-base font-bold tabular-nums text-copper">{fmtPoints(r.balance)}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setPaying(r)}
                      disabled={r.balance <= 0}
                      className="rounded-lg border border-copper px-3.5 py-1.5 text-xs font-semibold text-copper transition hover:bg-copper hover:text-white disabled:pointer-events-none disabled:opacity-35"
                    >
                      Mark paid
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink">
            <Gift className="h-5 w-5 text-copper" />
            Rewards to hand over
          </h2>
          {rewards.length === 0 ? (
            <p className="mt-4 text-sm text-ink/55">No reward is waiting.</p>
          ) : (
            <ul className="mt-4 divide-y divide-black/5">
              {rewards.map((r) => (
                <li key={r.partnerId + r.rankNo} className="flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-sm font-semibold text-ink">{r.name}</span>
                    <span className="mt-0.5 block text-xs text-ink/55">
                      {r.rank} · <b className="text-ink/80">{r.reward}</b> · {fmtDate(r.at)}
                    </span>
                  </span>
                  <button
                    onClick={() => given(r)}
                    disabled={pending}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink/75 transition hover:border-emerald-400 hover:text-emerald-700"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Given
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-ink/45">
            Reward condition on the plan: Power 50% BV, Rest 50% BV. Check it before you hand a reward over.
          </p>
        </section>

        <section className={card}>
          <h2 className="font-display text-xl font-bold text-ink">Latest payouts</h2>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-ink/55">Nothing has been paid out yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-black/5">
              {recent.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-sm font-semibold text-ink">{p.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-ink/55">
                      {fmtDate(p.at)}{p.note && ` · ${p.note}`}
                    </span>
                  </span>
                  <span className="shrink-0 font-bold tabular-nums text-ink">{fmtPoints(p.points)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

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
    </>
  );
}

function PayModal({ partner, onClose, onDone }) {
  const [points, setPoints] = useState(String(partner.balance));
  const [mode, setMode] = useState("UPI");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

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
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#fbf7f0] p-5 ring-1 ring-black/5">
          <div className="min-w-0 leading-tight">
            <p className="truncate font-semibold text-ink">{partner.name}</p>
            <p className="mt-1 text-sm text-ink/55">{partner.code} · {partner.rank}</p>
          </div>
          <div className="shrink-0 text-right leading-tight">
            <p className="text-xs text-ink/55">Balance</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-copper">{fmtPoints(partner.balance)}</p>
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="pay-points">Points paid (1 point = ₹1)</label>
          <input id="pay-points" required type="number" min="1" max={partner.balance} step="1" value={points} onChange={(e) => setPoints(e.target.value)} className={inputCls} />
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
          <button type="submit" disabled={pending} className={btnPrimary}>
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
          <select id="add-partner" required value={partnerId} onChange={(e) => setPartnerId(e.target.value)} className={inputCls}>
            <option value="">Choose a partner</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>{p.name} {p.code && `(${p.code})`}</option>
            ))}
          </select>
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

        <p className="text-xs text-ink/55">
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
