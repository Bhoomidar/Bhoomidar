"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, X } from "lucide-react";
import Reveal from "./Reveal";
import PropertyCard from "./PropertyCard";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/icons";

const LABELS = { Villa: "Villas" };

// What the search box looks at: the name, the type and every detail line (the place is in there).
const haystack = (p) =>
  [p.title, p.category, ...(p.details ?? []).map((d) => d.text)].join(" ").toLowerCase();

// All properties with a working filter by type and a search. `initialType` and
// `initialQuery` come from the search box at the top of the page (?type= and ?q=).
export default function PropertiesGrid({ properties, initialType = "All", initialQuery = "" }) {
  const [filter, setFilter] = useState(initialType);
  const [query, setQuery] = useState(initialQuery);

  const tabs = useMemo(
    () => [
      { id: "All", label: "All Properties", icon: LayoutGrid, count: properties.length },
      ...CATEGORIES.filter((cat) => properties.some((p) => p.category === cat)).map(
        (cat) => ({
          id: cat,
          label: LABELS[cat] ?? cat,
          icon: CATEGORY_ICONS[cat],
          count: properties.filter((p) => p.category === cat).length,
        }),
      ),
    ],
    [properties],
  );

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = properties.filter(
    (p) =>
      (filter === "All" || p.category === filter) &&
      words.every((w) => haystack(p).includes(w)),
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2.5 pb-3 pt-1 sm:gap-3">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
            className={`inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full px-5 py-3 text-[15px] font-medium transition sm:gap-3 sm:px-6 sm:py-3.5 sm:text-base ${
              filter === id
                ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30"
                : "bg-white/80 text-ink/80 shadow-sm ring-1 ring-black/5 hover:text-copper hover:ring-copper/40"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.7} />
            {label.replace(" Properties", "")}
            {label.endsWith(" Properties") && <span className="hidden sm:inline">&nbsp;Properties</span>}
            <span className={`tabular-nums ${filter === id ? "text-white/80" : "text-ink/40"}`}>
              <span className="sm:hidden">{count}</span>
              <span className="hidden sm:inline">{String(count).padStart(2, "0")}</span>
            </span>
          </button>
        ))}
      </div>

      {words.length > 0 && (
        <p className="mt-5 flex flex-wrap items-center gap-3 text-sm text-ink/65">
          {shown.length} result{shown.length === 1 ? "" : "s"} for
          <span className="inline-flex items-center gap-2 rounded-full bg-copper/10 px-3.5 py-1.5 font-semibold text-copper-dark">
            {query.trim()}
            <button type="button" onClick={() => setQuery("")} aria-label="Clear the search">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        </p>
      )}

      {shown.length === 0 ? (
        <p className="py-20 text-center text-ink/55">
          {words.length > 0
            ? "No property matches your search. Try another place or clear the search."
            : "No properties here yet. Please check back soon."}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {shown.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 100} className="h-full">
              <PropertyCard p={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
