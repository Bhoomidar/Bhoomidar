"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { formatRupees } from "@/lib/partnerFee";
import { card } from "@/components/admin/ui";

const PAGE = 20;

const STATUS = {
  paid: { text: "Paid", chip: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  credit: { text: "On credit", chip: "bg-sky-100 text-sky-800", dot: "bg-sky-500" },
  unpaid: { text: "Unpaid", chip: "bg-amber-100 text-amber-800", dot: "bg-amber-400" },
  off: { text: "Switched off", chip: "bg-stone-200 text-stone-700", dot: "bg-stone-400" },
};

const TABS = [
  ["all", "All"],
  ["paid", "Paid"],
  ["credit", "On credit"],
  ["unpaid", "Unpaid"],
];

const day = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

function Pill({ status }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${s.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.text}
    </span>
  );
}

// Every ID with what it paid and what is still to come. Filter by status, search by name, ID or phone.
export default function CollectionsTable({ rows }) {
  const [tab, setTab] = useState("all");
  const [term, setTerm] = useState("");
  const [shown, setShown] = useState(PAGE);

  const counts = useMemo(() => {
    const c = { all: rows.length, paid: 0, credit: 0, unpaid: 0 };
    for (const r of rows) if (c[r.status] !== undefined) c[r.status] += 1;
    return c;
  }, [rows]);

  const list = useMemo(() => {
    const q = term.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab !== "all" && r.status !== tab) return false;
      return !q || [r.name, r.code, r.phone].join(" ").toLowerCase().includes(q);
    });
  }, [rows, tab, term]);

  const shownRows = list.slice(0, shown);

  return (
    <section className={card}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-[1.7rem]">
          Every <span className="text-copper">ID</span>
        </h2>
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-copper/70" />
          <input
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setShown(PAGE);
            }}
            placeholder="Search name, ID or phone"
            className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-copper focus:ring-4 focus:ring-copper/15"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TABS.map(([key, label]) => {
          const on = tab === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setTab(key);
                setShown(PAGE);
              }}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                on
                  ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                  : "bg-white text-ink/70 shadow-sm ring-1 ring-black/10 hover:ring-copper"
              }`}
            >
              {label}
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${on ? "bg-white/25" : "bg-black/5 text-ink/60"}`}>
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink/55">No one matches.</p>
      ) : (
        <>
          {/* phone: one card each */}
          <ul className="mt-5 space-y-3 md:hidden">
            {shownRows.map((r) => (
              <li key={r.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 leading-tight">
                    <span className="block [overflow-wrap:anywhere] text-[15px] font-bold text-ink">{r.name}</span>
                    <span className="mt-1 block font-mono text-xs text-copper-dark">{r.code || "No ID yet"}</span>
                  </span>
                  <Pill status={r.status} />
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-[#fbf7f0] px-3 py-2.5">
                  <div>
                    <dt className="text-[11px] text-ink/50">Paid</dt>
                    <dd className="mt-0.5 text-[15px] font-extrabold tabular-nums text-emerald-700">{formatRupees(r.paid)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-ink/50">From income</dt>
                    <dd className={`mt-0.5 text-[15px] font-extrabold tabular-nums ${r.fromIncome > 0 ? "text-teal-700" : "text-ink/40"}`}>
                      {formatRupees(r.fromIncome)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-ink/50">Still to come</dt>
                    <dd className={`mt-0.5 text-[15px] font-extrabold tabular-nums ${r.pending > 0 ? "text-amber-700" : "text-ink/40"}`}>
                      {formatRupees(r.pending)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-ink/55">
                  <span>
                    Joined {day(r.joinedAt)}
                    {r.phone ? ` · ${r.phone}` : ""}
                  </span>
                  <a href={`/admin/partners/${r.id}`} className="inline-flex shrink-0 items-center gap-1 font-semibold text-copper">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </li>
            ))}
          </ul>

          {/* bigger screens: a table */}
          <div className="mt-5 hidden overflow-x-auto rounded-2xl ring-1 ring-black/5 md:block">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-[#f6f0e7] text-xs font-semibold text-ink/60">
                <tr>
                  <th className="px-4 py-3.5 text-left">Name</th>
                  <th className="px-3 py-3.5 text-left">Phone</th>
                  <th className="px-3 py-3.5 text-left">Joined</th>
                  <th className="px-3 py-3.5 text-left">Status</th>
                  <th className="px-3 py-3.5 text-right">Paid</th>
                  <th className="px-3 py-3.5 text-right">From income</th>
                  <th className="px-3 py-3.5 text-right">Still to come</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 bg-white">
                {shownRows.map((r) => (
                  <tr key={r.id} className="align-middle transition hover:bg-[#fdf7ef]">
                    <td className="px-4 py-3.5">
                      <span className="block [overflow-wrap:anywhere] font-bold text-ink">{r.name}</span>
                      <span className="mt-0.5 block font-mono text-[11px] text-copper-dark">{r.code || "No ID yet"}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-[13px] text-ink/70">{r.phone || "—"}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-[13px] text-ink/70">{day(r.joinedAt)}</td>
                    <td className="px-3 py-3.5">
                      <Pill status={r.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-right font-bold tabular-nums text-emerald-700">{formatRupees(r.paid)}</td>
                    <td className={`whitespace-nowrap px-3 py-3.5 text-right font-bold tabular-nums ${r.fromIncome > 0 ? "text-teal-700" : "text-ink/40"}`}>
                      {formatRupees(r.fromIncome)}
                    </td>
                    <td className={`whitespace-nowrap px-3 py-3.5 text-right font-bold tabular-nums ${r.pending > 0 ? "text-amber-700" : "text-ink/35"}`}>
                      {formatRupees(r.pending)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <a href={`/admin/partners/${r.id}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-copper transition hover:text-copper-dark">
                        Open <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {list.length > shown && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE)}
              className="mx-auto mt-4 block cursor-pointer rounded-xl border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink/75 transition hover:border-copper hover:text-copper"
            >
              Show more ({list.length - shown} left)
            </button>
          )}
        </>
      )}
    </section>
  );
}
