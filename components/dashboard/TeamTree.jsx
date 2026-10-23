"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, ChevronRight, Clock, MapPin, Search, Users } from "lucide-react";

const STATUS = {
  active: { text: "Active", chip: "bg-emerald-100 text-emerald-800" },
  unpaid: { text: "Unpaid", chip: "bg-amber-100 text-amber-800" },
  off: { text: "Off", chip: "bg-rose-100 text-rose-700" },
};

const FILTERS = [
  ["all", "All"],
  ["active", "Active"],
  ["unpaid", "Unpaid"],
];

const initialsOf = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

function Node({ id, tree, open, toggle, forceOpen, visible }) {
  const p = tree.byId.get(id);
  const kids = (tree.children.get(id) ?? []).filter((k) => !visible || visible.has(k));
  const isOpen = forceOpen || open.has(id);
  const direct = tree.children.get(id)?.length ?? 0;
  const team = tree.total.get(id) ?? 0;
  const status = STATUS[p.status];

  return (
    <li>
      <div className="flex items-start gap-3 rounded-2xl px-2 py-3 transition hover:bg-[#fbf7f0] sm:items-center">
        <button
          type="button"
          onClick={() => toggle(id)}
          disabled={!kids.length}
          aria-label={isOpen ? "Hide team" : "Show team"}
          className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink/60 transition enabled:hover:bg-black/5 disabled:opacity-0 sm:mt-0"
        >
          <ChevronRight className={`h-4 w-4 transition ${isOpen ? "rotate-90" : ""}`} />
        </button>

        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white shadow-md">
          {p.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            initialsOf(p.name)
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-ink">{p.name}</span>
            <span className="rounded-full bg-copper/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-copper-dark">
              {p.code}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${status.chip}`}>
              {p.status === "active" && <Check className="h-3 w-3" strokeWidth={3} />}
              {p.status === "unpaid" && <Clock className="h-3 w-3" />}
              {status.text}
            </span>
            <span className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-ink/60">
              Level {p.level}
            </span>
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/55">
            {p.place && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {p.place}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Joined {p.joined}
            </span>
            {p.activatedOn && <span>Active since {p.activatedOn}</span>}
          </p>
        </div>

        <div className="hidden shrink-0 text-right text-xs leading-tight text-ink/60 sm:block">
          <p>
            <b className="text-base text-ink">{direct}</b> direct
          </p>
          <p className="mt-1">
            <b className="text-ink">{team}</b> in team
          </p>
        </div>
      </div>

      {isOpen && kids.length > 0 && (
        <ul className="ml-5 border-l-2 border-copper/20 pl-3 sm:ml-8">
          {kids.map((k) => (
            <Node
              key={k}
              id={k}
              tree={tree}
              open={open}
              toggle={toggle}
              forceOpen={forceOpen}
              visible={visible}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// The partner's whole team as a tree they can open and close, search, and filter.
export default function TeamTree({ nodes, rootId }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(() => new Set());

  const tree = useMemo(() => {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const children = new Map();
    const roots = [];
    for (const n of nodes) {
      if (n.parentId === rootId) {
        roots.push(n.id);
      } else if (byId.has(n.parentId)) {
        if (!children.has(n.parentId)) children.set(n.parentId, []);
        children.get(n.parentId).push(n.id);
      }
    }
    const total = new Map();
    const walk = (id) => {
      let count = 0;
      for (const k of children.get(id) ?? []) count += 1 + walk(k);
      total.set(id, count);
      return count;
    };
    roots.forEach(walk);
    return { byId, children, roots, total };
  }, [nodes, rootId]);

  // Searching or filtering: keep the matches and the people above them.
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term && filter === "all") return null;
    const keep = new Set();
    for (const n of nodes) {
      if (filter !== "all" && n.status !== filter) continue;
      if (term && ![n.name, n.code, n.place].join(" ").toLowerCase().includes(term)) continue;
      for (let id = n.id; id && id !== rootId && !keep.has(id); id = tree.byId.get(id)?.parentId) {
        keep.add(id);
      }
    }
    return keep;
  }, [nodes, search, filter, rootId, tree]);

  const roots = visible ? tree.roots.filter((r) => visible.has(r)) : tree.roots;

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:max-w-xs lg:flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-copper/70" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, code or city"
            className="w-full rounded-xl border border-black/10 bg-[#fbf7f0] py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-copper focus:bg-white focus:ring-4 focus:ring-copper/15"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === key
                  ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                  : "bg-white text-ink/70 ring-1 ring-black/10 hover:ring-copper"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 lg:ml-auto">
          <button
            type="button"
            onClick={() => setOpen(new Set(tree.children.keys()))}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink/80 transition hover:border-copper hover:text-copper"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={() => setOpen(new Set())}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink/80 transition hover:border-copper hover:text-copper"
          >
            Collapse all
          </button>
        </div>
      </div>

      <div className="mt-5">
        {roots.length === 0 ? (
nodes.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-copper/10 text-copper ring-8 ring-copper/5">
                <Users className="h-9 w-9" strokeWidth={1.6} />
              </span>
              <p className="mt-5 font-display text-2xl font-bold text-ink">Your team is empty for now</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">
                Share your referral link above. Every partner who joins with your code shows up here,
                along with the people they bring in.
              </p>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-ink/55">
              No one matches. Try a different search or filter.
            </p>
          )
        ) : (
          <ul className="space-y-1">
            {roots.map((id) => (
              <Node
                key={id}
                id={id}
                tree={tree}
                open={open}
                toggle={toggle}
                forceOpen={!!visible}
                visible={visible}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
