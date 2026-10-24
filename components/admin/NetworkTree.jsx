"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, ChevronRight, Network, Search, Users } from "lucide-react";
import { AwardArt, BarsArt, OrgChartArt, PeopleArt, TeamArt } from "@/components/dashboard/StatArt";
import Select from "../Select";

const date = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const field =
  "w-full rounded-2xl border border-black/10 bg-white text-sm text-ink shadow-[0_8px_20px_-14px_rgba(110,60,20,0.45)] outline-none transition placeholder:text-ink/45 focus:border-copper focus:ring-4 focus:ring-copper/15";

const ghostBtn =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-ink shadow-[0_8px_20px_-14px_rgba(110,60,20,0.45)] ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:text-copper hover:ring-copper";

const statusOf = (p) => (!p.is_active ? "off" : p.activated_at ? "paid" : "unpaid");

function Stat({ icon: Icon, art: Art, label, value, note, theme }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} p-5 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.4)] ring-1 ${theme.ring} transition duration-300 hover:-translate-y-1`}
    >
      <Art
        className={`pointer-events-none absolute bottom-3 right-3 h-20 w-24 origin-bottom-right transition duration-500 group-hover:scale-110 ${theme.art}`}
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

function StatusPill({ status }) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200">
        <Check className="h-3 w-3" strokeWidth={3} />
        Paid
      </span>
    );
  }
  if (status === "unpaid") {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200">
        Unpaid
      </span>
    );
  }
  return (
    <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200">
      Off
    </span>
  );
}

export function Node({ id, depth, tree, open, toggle, forceOpen, visible, matches }) {
  const p = tree.byId.get(id);
  const kids = (tree.children.get(id) ?? []).filter((k) => !visible || visible.has(k));
  const isOpen = forceOpen || open.has(id);
  const direct = tree.children.get(id)?.length ?? 0;
  const total = tree.total.get(id) ?? 0;
  const hit = matches?.has(id);
  const dim = visible && !hit; // only here because someone below matched

  return (
    <li
      className={
        depth > 1
          ? // elbow into the row, and the line that carries on down to the next sibling
            "relative before:absolute before:-left-5 before:-top-3 before:h-12 before:w-5 before:rounded-bl-2xl before:border-b-2 before:border-l-2 before:border-copper/25 after:absolute after:-left-5 after:bottom-0 after:top-9 after:border-l-2 after:border-copper/25 last:after:hidden sm:before:-left-6 sm:before:w-6 sm:after:-left-6"
          : "relative"
      }
    >
      <div
        className={`flex items-center gap-2.5 rounded-2xl bg-white px-2.5 py-3 shadow-[0_10px_24px_-18px_rgba(110,60,20,0.5)] ring-1 transition duration-300 hover:-translate-y-0.5 sm:gap-4 sm:px-4 ${
          hit ? "ring-2 ring-copper" : "ring-black/5 hover:ring-copper/30"
        } ${dim ? "opacity-60" : ""}`}
      >
        <button
          type="button"
          onClick={() => toggle(id)}
          disabled={!kids.length}
          aria-label={isOpen ? "Collapse" : "Expand"}
          aria-expanded={isOpen}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper transition enabled:hover:bg-copper enabled:hover:text-white disabled:opacity-0 sm:h-8 sm:w-8"
        >
          <ChevronRight className={`h-4 w-4 transition ${isOpen ? "rotate-90" : ""}`} />
        </button>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-base font-bold text-white shadow-md shadow-copper/30 ring-2 ring-white sm:h-12 sm:w-12">
          {p.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            (p.full_name || p.email)[0].toUpperCase()
          )}
        </span>

        <div className="min-w-0 flex-1 leading-tight">
          <p className="flex flex-wrap items-center gap-2">
            <a
              href={`/admin/partners/${p.id}`}
              className="truncate text-[15px] font-bold text-ink transition hover:text-copper"
              title="Open full profile"
            >
              {p.full_name || p.email}
            </a>
            <span className="rounded-full bg-[#f6ecdf] px-2.5 py-1 font-mono text-[11px] font-semibold text-ink/75 ring-1 ring-copper/10">
              {p.referral_code || "—"}
            </span>
            {p.role === "admin" && (
              <span className="rounded-full bg-copper/15 px-2 py-0.5 text-[10px] font-bold uppercase text-copper-dark">
                Admin
              </span>
            )}
            <StatusPill status={statusOf(p)} />
            {depth > 1 && (
              <span className="rounded-full bg-copper/10 px-2.5 py-1 text-[11px] font-bold text-copper-dark ring-1 ring-copper/15">
                Level {depth}
              </span>
            )}
          </p>
          <p className="mt-1.5 truncate text-[13px] text-ink/55">
            {[p.email, p.phone, `Joined ${date(p.created_at)}`].filter(Boolean).join(" · ")}
          </p>
          {/* the direct / team boxes are hidden on phones, so say it here */}
          <p className="mt-1 text-xs text-ink/60 sm:hidden">
            <b className="text-ink">{direct}</b> direct · <b className="text-ink">{total}</b> in team
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <span
            className="rounded-xl bg-[#faf1e6] px-3 py-1.5 text-center text-xs leading-tight text-ink/60 ring-1 ring-black/5"
            title="People this partner referred directly"
          >
            <b className="block text-base font-extrabold tabular-nums text-ink">{direct}</b>
            direct
          </span>
          <span
            className="rounded-xl bg-[#faf1e6] px-3 py-1.5 text-center text-xs leading-tight text-ink/60 ring-1 ring-black/5"
            title="Everyone under this partner, all levels"
          >
            <b className="block text-base font-extrabold tabular-nums text-ink">{total}</b>
            in team
          </span>
        </div>

        <a
          href={`/admin/partners/${p.id}`}
          aria-label={`Open ${p.full_name || p.email}`}
          title="Open full profile"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-copper shadow-sm ring-1 ring-copper/25 transition hover:bg-copper hover:text-white"
        >
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      {isOpen && kids.length > 0 && (
        <ul className="ml-4 mt-3 space-y-3 pl-5 sm:ml-10 sm:pl-6">
          {kids.map((k) => (
            <Node
              key={k}
              id={k}
              depth={depth + 1}
              tree={tree}
              open={open}
              toggle={toggle}
              forceOpen={forceOpen}
              visible={visible}
              matches={matches}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function NetworkTree({ people }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const tree = useMemo(() => {
    const byId = new Map(people.map((p) => [p.id, p]));
    const children = new Map();
    const roots = [];
    for (const p of people) {
      if (p.referred_by && byId.has(p.referred_by)) {
        if (!children.has(p.referred_by)) children.set(p.referred_by, []);
        children.get(p.referred_by).push(p.id);
      } else {
        roots.push(p.id);
      }
    }
    // Team size and depth, counting everyone below a partner.
    const total = new Map();
    let maxDepth = people.length ? 1 : 0;
    const walk = (id, depth, seen) => {
      if (seen.has(id)) return 0; // guards against a loop in bad data
      seen.add(id);
      maxDepth = Math.max(maxDepth, depth);
      let n = 0;
      for (const k of children.get(id) ?? []) n += 1 + walk(k, depth + 1, seen);
      total.set(id, n);
      return n;
    };
    for (const r of roots) walk(r, 1, new Set());
    return { byId, children, roots, total, maxDepth };
  }, [people]);

  // Start with the top partners open, so the first level of their teams shows.
  const [open, setOpen] = useState(() => new Set(tree.roots.filter((r) => tree.children.has(r))));

  // While searching or filtering: show only the matches and the partners above them.
  const { visible, matches } = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term && status === "all") return { visible: null, matches: null };
    const parent = new Map(people.map((p) => [p.id, p.referred_by]));
    const keep = new Set();
    const hits = new Set();
    for (const p of people) {
      if (status !== "all" && statusOf(p) !== status) continue;
      if (term && ![p.full_name, p.email, p.phone, p.referral_code].join(" ").toLowerCase().includes(term)) continue;
      hits.add(p.id);
      for (let id = p.id; id && !keep.has(id); id = parent.get(id)) keep.add(id);
    }
    return { visible: keep, matches: hits };
  }, [people, search, status]);

  const roots = visible ? tree.roots.filter((r) => visible.has(r)) : tree.roots;
  const viaReferral = people.length - tree.roots.length;
  const paid = people.filter((p) => statusOf(p) === "paid").length;
  const unpaid = people.filter((p) => statusOf(p) === "unpaid").length;

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const expandAll = () => setOpen(new Set(tree.children.keys()));
  const collapseAll = () => setOpen(new Set());

  const stats = [
    {
      icon: Users,
      art: PeopleArt,
      label: "Total partners",
      value: people.length,
      note: `${paid} paid · ${unpaid} unpaid`,
      theme: { bg: "from-[#fdebdc] to-[#fff6ec]", ring: "ring-copper/10", chip: "bg-[#f9d6b8] text-copper", art: "text-copper" },
    },
    {
      icon: Network,
      art: AwardArt,
      label: "Joined directly",
      value: tree.roots.length,
      note: "top of a tree, no referrer",
      theme: { bg: "from-[#fff1cf] to-[#fffaf0]", ring: "ring-amber-300/30", chip: "bg-amber-200/80 text-amber-700", art: "text-amber-500" },
    },
    {
      icon: Users,
      art: BarsArt,
      label: "Joined by referral",
      value: viaReferral,
      note: "came in through a partner",
      theme: { bg: "from-[#dff5e8] to-[#f5fcf8]", ring: "ring-emerald-300/30", chip: "bg-emerald-200/80 text-emerald-700", art: "text-emerald-500" },
    },
    {
      icon: Network,
      art: OrgChartArt,
      label: "Levels deep",
      value: tree.maxDepth,
      note: "the longest chain of referrals",
      theme: { bg: "from-[#ece4fb] to-[#f9f6ff]", ring: "ring-violet-300/30", chip: "bg-violet-200/80 text-violet-700", art: "text-violet-500" },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-[340px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-copper" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone or code..."
            className={`${field} py-3.5 pl-11 pr-4`}
          />
        </div>
        <Select
          wrapperClassName="lg:w-[190px]"
          variant="toolbar"
          value={status}
          onChange={setStatus}
          ariaLabel="Filter partners"
          menuMinWidth={200}
          options={[
            { value: "all", label: "All partners" },
            { value: "paid", label: "Paid" },
            { value: "unpaid", label: "Unpaid" },
            { value: "off", label: "Switched off" },
          ]}
        />
        {matches && (
          <p className="text-sm text-ink/60">
            {matches.size} {matches.size === 1 ? "match" : "matches"}
          </p>
        )}
        <div className="flex gap-2 lg:ml-auto">
          <button type="button" onClick={expandAll} className={ghostBtn}>
            Expand all
          </button>
          <button type="button" onClick={collapseAll} className={ghostBtn}>
            Collapse all
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-4 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-6">
        {roots.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <TeamArt className="h-24 w-36" />
            <p className="mt-3 text-sm font-semibold text-ink/70">
              {people.length === 0 ? "No partners yet." : "No partners found."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {roots.map((id) => (
              <Node
                key={id}
                id={id}
                depth={1}
                tree={tree}
                open={open}
                toggle={toggle}
                forceOpen={!!visible}
                visible={visible}
                matches={matches}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
