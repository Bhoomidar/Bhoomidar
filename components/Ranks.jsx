"use client";

import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ranks } from "@/lib/data";

export default function Ranks() {
  const track = useRef(null);
  const scroll = (dir) =>
    track.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  return (
    <section id="rewards" className="bg-night py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Partner Rank &amp; Rewards
            </p>
            <h2 className="mt-3 font-serif text-4xl font-bold text-copper-light sm:text-5xl">
              Grow Higher. Earn Bigger.
            </h2>
          </div>
          <a
            href="#rewards"
            className="inline-flex items-center gap-2 self-start rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:self-auto"
          >
            View Full Plan <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="relative mt-8">
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous"
            className="absolute -left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lg lg:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Next"
            className="absolute -right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-night-2 text-white shadow-lg lg:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div
            ref={track}
            className="no-scrollbar flex snap-x gap-4 overflow-x-auto"
          >
            {ranks.map(({ title, area, commission, reward, icon: Icon }, i) => (
              <div
                key={title}
                className="min-w-[210px] flex-1 snap-start rounded-2xl bg-[#f8efe2] p-4 text-center"
              >
                <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-copper text-xs font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-sm font-bold text-ink">{title}</h3>
                <p className="mt-1 text-[11px] text-ink/60">{area}</p>
                <p className="mt-0.5 text-xs font-bold text-copper">
                  {commission}
                </p>

                <div className="mt-4 flex h-28 items-center justify-center rounded-xl bg-gradient-to-b from-white to-[#efe2cf]">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-night text-copper-light shadow-lg">
                    <Icon className="h-8 w-8" strokeWidth={1.5} />
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-ink/80">
                  {reward}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
