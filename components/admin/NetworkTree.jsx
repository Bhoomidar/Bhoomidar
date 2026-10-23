"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { btnGhost, card, inputCls } from "./ui";

const date = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function Stat({ label, value }) {
  return (
    <div className={card}>
      <p className="text-xs text-ink/55">{label}</p>
      <p className="mt-1 font-sans text-3xl font-extrabold tabular-nums text-ink">{value}</p>
    </div>
  );
}

function Node({ id, tree, open, toggle, forceOpen, visible }) {
  const p = tree.byId.get(id);
  const kids = (tree.children.get(id) ?? []).filter((k) => !visible || visible.has(k));
  const isOpen = forceOpen || open.has(id);
  const direct = tree.children.get(id)?.length ?? 0;
  const total = tree.total.get(id) ?? 0;

  return (
    <li>
      <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-[#fbf7f0]">
        <button
          type="button"
          onClick={() => toggle(id)}
          disabled={!kids.length}
          aria-label={isOpen ? "Collapse" : "Expand"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink/60 transition enabled:hover:bg-black/5 disabled:opacity-0"
        >
          <ChevronRight className={`h-4 w-4 transition ${isOpen ? "rotate-90" : ""}`} />
        </button>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white">
          {p.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (p.full_name || p.email)[0].toUpperCase()
              )}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
            <a href={`/admin/partners/${p.id}`} className="truncate hover:text-copper" title="Open full profile">
              {p.full_name || p.email}
            </a>
            <span className="rounded-full bg-copper/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-copper-dark">
              {p.referral_code || "—"}
            </span>
            {p.role === "admin" && (
              <span className="rounded-full bg-copper/15 px-2 py-0.5 text-[10px] font-bold uppercase text-copper-dark">
                Admin
              </span>
            )}
            {p.is_active && !p.activated_at && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                Unpaid
              </span>
            )}
            {!p.is_active && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">
                Off
              </span>
            )}
          </p>
          <p className="mt-1 truncate text-xs text-ink/55">
            {[p.email, p.phone, `Joined ${date(p.created_at)}`].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="shrink-0 text-right text-xs leading-tight text-ink/65">
          <p>
            <b className="text-ink">{direct}</b> direct
          </p>
          <p className="mt-1">
            <b className="text-ink">{total}</b> in team
          </p>
        </div>
      </div>

      {isOpen && kids.length > 0 && (
        <ul className="ml-6 border-l border-copper/25 pl-3">
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

export default function NetworkTree({ people }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(() => new Set());

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

  // While searching: show only the matches and the partners above them.
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return null;
    const parent = new Map(people.map((p) => [p.id, p.referred_by]));
    const keep = new Set();
    for (const p of people) {
      const hay = [p.full_name, p.email, p.phone, p.referral_code].join(" ").toLowerCase();
      if (!hay.includes(term)) continue;
      for (let id = p.id; id && !keep.has(id); id = parent.get(id)) keep.add(id);
    }
    return keep;
  }, [people, search]);

  const roots = visible ? tree.roots.filter((r) => visible.has(r)) : tree.roots;
  const viaReferral = people.length - tree.roots.length;

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const expandAll = () => setOpen(new Set(tree.children.keys()));
  const collapseAll = () => setOpen(new Set());

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total partners" value={people.length} />
        <Stat label="Joined directly" value={tree.roots.length} />
        <Stat label="Joined by referral" value={viaReferral} />
        <Stat label="Levels deep" value={tree.maxDepth} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-copper/70" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone or code"
            className={`${inputCls} !py-2.5 pl-10`}
          />
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <button type="button" onClick={expandAll} className={btnGhost}>
            Expand all
          </button>
          <button type="button" onClick={collapseAll} className={btnGhost}>
            Collapse all
          </button>
        </div>
      </div>

      <div className={`${card} !p-4 sm:!p-6`}>
        {roots.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/60">
            {people.length === 0 ? "No partners yet." : "No partners found."}
          </p>
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
