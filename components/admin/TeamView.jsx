"use client";

import { useMemo, useState } from "react";
import { List, Network } from "lucide-react";
import { Node } from "./NetworkTree";

const seg = (on) =>
  `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
    on ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30" : "text-ink/65 hover:text-copper"
  }`;

const ghost =
  "rounded-xl bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-black/10 transition hover:text-copper hover:ring-copper";

// The team under one partner, as a tree (who brought in whom) or as a plain list.
// `list` is the ready-made list markup from the page.
export default function TeamView({ team, rootId, list }) {
  const [view, setView] = useState("tree");

  const tree = useMemo(() => {
    const byId = new Map(team.map((m) => [m.id, m]));
    const children = new Map();
    const roots = [];
    for (const m of team) {
      if (m.referred_by === rootId || !byId.has(m.referred_by)) roots.push(m.id);
      else {
        if (!children.has(m.referred_by)) children.set(m.referred_by, []);
        children.get(m.referred_by).push(m.id);
      }
    }
    const total = new Map();
    const walk = (id, seen) => {
      if (seen.has(id)) return 0;
      seen.add(id);
      let n = 0;
      for (const k of children.get(id) ?? []) n += 1 + walk(k, seen);
      total.set(id, n);
      return n;
    };
    for (const r of roots) walk(r, new Set());
    return { byId, children, roots, total };
  }, [team, rootId]);

  const [open, setOpen] = useState(() => new Set(tree.children.keys()));
  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-black/5 px-5 py-3.5 sm:px-7">
        <div className="inline-flex gap-1 rounded-2xl bg-[#faf1e6] p-1 ring-1 ring-black/5">
          <button type="button" onClick={() => setView("tree")} className={seg(view === "tree")}>
            <Network className="h-4 w-4" />
            Tree
          </button>
          <button type="button" onClick={() => setView("list")} className={seg(view === "list")}>
            <List className="h-4 w-4" />
            List
          </button>
        </div>

        {view === "tree" && (
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={() => setOpen(new Set(tree.children.keys()))} className={ghost}>
              Expand all
            </button>
            <button type="button" onClick={() => setOpen(new Set())} className={ghost}>
              Collapse all
            </button>
          </div>
        )}
      </div>

      {view === "tree" ? (
        <div className="bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-4 sm:p-6">
          <ul className="space-y-3">
            {tree.roots.map((id) => (
              <Node
                key={id}
                id={id}
                depth={1}
                tree={tree}
                open={open}
                toggle={toggle}
                forceOpen={false}
                visible={null}
                matches={null}
              />
            ))}
          </ul>
        </div>
      ) : (
        list
      )}
    </div>
  );
}
