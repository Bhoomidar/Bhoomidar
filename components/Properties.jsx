"use client";

import { useState } from "react";
import { ArrowRight, Building2, Castle, Home, LandPlot, Wheat } from "lucide-react";
import Reveal from "./Reveal";
import PropertyCard from "./PropertyCard";

const TABS = [
  { label: "Residential", icon: Home },
  { label: "Commercial", icon: Building2 },
  { label: "Farm Land", icon: Wheat },
  { label: "Plots", icon: LandPlot },
  { label: "Villas", icon: Castle },
];

export default function Properties({ c, properties }) {
  const [active, setActive] = useState("Residential");

  return (
    <section id="properties" className="bg-cream py-16 lg:py-20">
      <div className="container-x">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-8 bg-copper" />
              {c.props_label}
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.25] text-ink sm:text-5xl lg:text-[48px]">
              {c.props_title_1}
              <br />
              {c.props_title_2} <span className="text-copper">{c.props_title_accent}</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">
              {c.props_text}
            </p>
          </div>

          <div className="lg:pb-2">
            <a
              href="/properties"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-copper px-5 py-2.5 text-sm font-semibold text-copper transition hover:bg-copper hover:text-white"
            >
              {c.props_button} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>

        <Reveal
          delay={100}
          className="no-scrollbar -mx-6 mt-8 flex gap-3 overflow-x-auto px-6 pb-1 sm:mx-0 sm:mt-10 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          {TABS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                active === label
                  ? "border-copper-dark bg-copper-dark text-white shadow-md"
                  : "border-black/10 bg-white/60 text-ink/80 hover:border-copper hover:text-copper"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {properties.map((p, i) => (
            <Reveal key={p.id} delay={i * 100} className="h-full">
              <PropertyCard p={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
