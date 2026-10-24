"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Building2, ChevronsUpDown, FileText } from "lucide-react";
import { LeafArt } from "@/components/dashboard/StatArt";
import { fmtDate, fmtPoints, KINDS } from "@/lib/points";

const TABS = [
  ["all", "All", null],
  ["sales", "My sales", ["sale"]],
  ["team", "Team", ["team"]],
  ["bonus", "Bonus", ["monthly", "cto"]],
  ["paid", "Paid to me", ["payout"]],
];

const PAGE = 10;

// What happened to the points: they came in, were paid out, or were taken back.
const statusOf = (kind) =>
  kind === "payout"
    ? { text: "Paid", tone: "bg-teal-100 text-teal-800" }
    : kind === "reversal"
      ? { text: "Cancelled", tone: "bg-rose-100 text-rose-800" }
      : { text: "Credited", tone: "bg-emerald-100 text-emerald-800" };

// Every point that came in or went out, newest first, with the balance after each.
// rows: [{ id, kind, points, note, from, rate, at, balance }]
export default function PointsHistory({ rows }) {
  const [tab, setTab] = useState("all");
  const [shown, setShown] = useState(PAGE);
  const [sort, setSort] = useState({ key: "date", dir: "desc" });

  const counts = useMemo(
    () =>
      Object.fromEntries(
        TABS.map(([key, , kinds]) => [key, kinds ? rows.filter((r) => kinds.includes(r.kind)).length : rows.length]),
      ),
    [rows],
  );

  const list = useMemo(() => {
    const kinds = TABS.find(([key]) => key === tab)?.[2];
    const picked = kinds ? rows.filter((r) => kinds.includes(r.kind)) : rows.slice();
    const sign = sort.dir === "asc" ? 1 : -1;
    picked.sort((a, b) =>
      sort.key === "type"
        ? sign * (KINDS[a.kind]?.label ?? "").localeCompare(KINDS[b.kind]?.label ?? "")
        : sign * (new Date(a.at) - new Date(b.at)),
    );
    return picked;
  }, [rows, tab, sort]);

  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));

  const SortHead = ({ k, children }) => (
    <button type="button" onClick={() => toggleSort(k)} className="inline-flex items-center gap-1.5 font-semibold transition hover:text-copper">
      {children}
      <ChevronsUpDown className={`h-3.5 w-3.5 ${sort.key === k ? "text-copper" : "text-ink/35"}`} />
    </button>
  );

  return (
    <div>
      <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key);
              setShown(PAGE);
            }}
            aria-pressed={tab === key}
            className={`inline-flex shrink-0 items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              tab === key
                ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                : "bg-white text-ink/70 shadow-sm ring-1 ring-black/10 hover:ring-copper"
            }`}
          >
            {label}
            <span
              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                tab === key ? "bg-white/25 text-white" : "bg-black/5 text-ink/60"
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl bg-white/70 ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#f6f0e7] text-xs text-ink/60">
              <tr>
                <th className="px-5 py-3.5 font-semibold">#</th>
                <th className="px-4 py-3.5">
                  <SortHead k="date">Date</SortHead>
                </th>
                <th className="px-4 py-3.5">
                  <SortHead k="type">Type</SortHead>
                </th>
                <th className="px-4 py-3.5 font-semibold">Description</th>
                <th className="px-4 py-3.5 font-semibold">From</th>
                <th className="px-4 py-3.5 text-right font-semibold">Points</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            {list.length > 0 && (
              <tbody className="divide-y divide-black/5 bg-white">
                {list.slice(0, shown).map((r, i) => {
                  const kind = KINDS[r.kind] ?? KINDS.adjustment;
                  const status = statusOf(r.kind);
                  const out = r.points < 0;
                  return (
                    <tr key={r.id} className="transition hover:bg-[#fdf7ef]">
                      <td className="px-5 py-4 text-ink/55">{i + 1}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-ink/70">{fmtDate(r.at)}</td>
                      <td className="px-4 py-4">
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${kind.tone}`}>{kind.label}</span>
                        {r.rate !== null && r.kind !== "payout" && <span className="ml-2 text-xs text-ink/45">{r.rate}%</span>}
                      </td>
                      <td className="max-w-[260px] truncate px-4 py-4 text-ink/75" title={r.note}>
                        {r.note}
                      </td>
                      <td className="px-4 py-4 text-ink/70">{r.from || "—"}</td>
                      <td className="px-4 py-3 text-right leading-tight">
                        <span
                          className={`block text-base font-extrabold tabular-nums ${
                            r.kind === "payout" ? "text-teal-700" : out ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {out ? "−" : "+"}
                          {fmtPoints(Math.abs(r.points))}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-ink/45">Balance {fmtPoints(r.balance)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${status.tone}`}>{status.text}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>

        {list.length === 0 && (
          <div className="relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden px-6 py-10 text-center">
            <LeafArt className="pointer-events-none absolute -bottom-3 left-2 h-44 w-32" />
            <LeafArt className="pointer-events-none absolute -bottom-3 right-2 h-44 w-32 -scale-x-100" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-copper/10 text-copper ring-8 ring-copper/5">
              <FileText className="h-7 w-7" strokeWidth={1.6} />
            </span>
            <p className="relative mt-4 text-lg font-bold text-ink">Nothing here yet</p>
            <p className="relative mt-1.5 max-w-xs text-sm leading-relaxed text-ink/55">
              Your points show up here as soon as a sale is confirmed by our team.
            </p>
            <a
              href="/properties"
              className="group relative mt-5 inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5"
            >
              <Building2 className="h-4 w-4" />
              Explore properties
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
          </div>
        )}
      </div>

      {list.length > shown && (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE)}
          className="mx-auto mt-4 block rounded-xl border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink/75 transition hover:border-copper hover:text-copper"
        >
          Show more ({list.length - shown} left)
        </button>
      )}
    </div>
  );
}
