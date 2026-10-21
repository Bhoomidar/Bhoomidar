"use client";

import { useMemo, useState } from "react";
import { LayoutGrid } from "lucide-react";
import Reveal from "./Reveal";
import PropertyCard from "./PropertyCard";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/icons";

const LABELS = { Villa: "Villas" };

// All properties with a working filter by type.
export default function PropertiesGrid({ properties }) {
  const [filter, setFilter] = useState("All");

  const tabs = useMemo(
    () => [
      { id: "All", label: "All", icon: LayoutGrid, count: properties.length },
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

  const shown = properties.filter((p) => filter === "All" || p.category === filter);

  return (
    <div>
      <div className="no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-medium transition ${
              filter === id
                ? "border-copper-dark bg-copper-dark text-white shadow-md"
                : "border-black/10 bg-white/60 text-ink/80 hover:border-copper hover:text-copper"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className={filter === id ? "text-white/70" : "text-ink/40"}>{count}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-20 text-center text-ink/55">
          No properties here yet. Please check back soon.
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
