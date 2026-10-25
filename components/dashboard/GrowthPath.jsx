"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  Gem,
  Gift,
  Laptop,
  Medal,
  Smartphone,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import RewardPic from "@/components/RewardPic";
import { fmtArea } from "@/lib/points";

// Icon, colours and number colour of each rank card, in the order of the ranks.
const LOOKS = [
  { icon: Award, tile: "bg-[#fde6cc] text-copper-dark ring-1 ring-copper/20", card: "from-[#fff3e6] to-white", num: "text-copper" },
  { icon: Medal, tile: "bg-gradient-to-br from-[#5fd3a0] to-[#2f9e83] text-white", card: "from-[#e9f8f0] to-white", num: "text-emerald-600" },
  { icon: Smartphone, tile: "bg-gradient-to-br from-[#ff9a7a] to-[#e0533d] text-white", card: "from-[#ffeee8] to-white", num: "text-orange-600" },
  { icon: Laptop, tile: "bg-gradient-to-br from-[#5ea2ff] to-[#2f67d6] text-white", card: "from-[#eaf2ff] to-white", num: "text-blue-600" },
  { icon: Users, tile: "bg-gradient-to-br from-[#b184f0] to-[#7c3fd0] text-white", card: "from-[#f3ecff] to-white", num: "text-violet-600" },
  { icon: Crown, tile: "bg-gradient-to-br from-[#f7c85a] to-[#d79a1c] text-white", card: "from-[#fff6df] to-white", num: "text-amber-600" },
  { icon: Star, tile: "bg-gradient-to-br from-[#ff9a7a] to-[#c9382a] text-white", card: "from-[#ffece8] to-white", num: "text-red-600" },
  { icon: Gem, tile: "bg-gradient-to-br from-[#5ea2ff] to-[#2f67d6] text-white", card: "from-[#eaf2ff] to-white", num: "text-blue-600" },
  { icon: Trophy, tile: "bg-gradient-to-br from-[#f7c85a] to-[#9a4bd8] text-white", card: "from-[#fff6df] to-white", num: "text-violet-600" },
];

// "500 - 1,000 Sq. Yards"; the first rank is 0 - 499 and the last one is open ended.
function range(i, mins) {
  if (i === 0) return `0 - ${fmtArea((mins[1] ?? 500) - 1)} Sq. Yards`;
  if (i === mins.length - 1) return `${fmtArea(mins[i])}+ Sq. Yards`;
  return `${fmtArea(mins[i])} - ${fmtArea(mins[i + 1])} Sq. Yards`;
}

// Soft bars, a rising dotted line and a crown on the tallest one.
function RankArt({ className = "" }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden className={className}>
      <g fill="#d98b52">
        <rect x="14" y="118" width="22" height="32" rx="5" opacity="0.28" />
        <rect x="42" y="102" width="24" height="48" rx="5" opacity="0.32" />
        <rect x="72" y="84" width="24" height="66" rx="5" opacity="0.36" />
        <rect x="102" y="58" width="26" height="92" rx="5" opacity="0.4" />
        <rect x="136" y="26" width="30" height="124" rx="6" opacity="0.46" />
      </g>
      <path
        d="M26 108 54 92 84 74 115 46 151 16"
        stroke="#d98b52"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 7"
        opacity="0.8"
      />
      <path d="M137 22 142 6 151 14 160 6 165 22Z" fill="#f2b84b" stroke="#d98b1c" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// The rank ladder of the partner plan. Ranks already reached are filled in, the
// current one is outlined, and the next target shows how far away it is.
// `mins` is the area each rank starts at; `next` is null at the top rank.
export default function GrowthPath({ chart: ranks, currentRank, teamArea, next, mins }) {
  const track = useRef(null);

  // Open with the partner's own rank in view.
  useEffect(() => {
    const el = track.current?.children[currentRank];
    if (el && track.current) track.current.scrollTo({ left: Math.max(0, el.offsetLeft - 40) });
  }, [currentRank]);

  const scroll = (dir) => track.current?.scrollBy({ left: dir * 480, behavior: "smooth" });

  const arrows = [
    [-1, ChevronLeft, "Previous ranks"],
    [1, ChevronRight, "Next ranks"],
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-8">
      {/* the picture on the right of the heading */}
      <div
        className="pointer-events-none absolute right-0 top-0 hidden h-[270px] w-[52%] lg:block"
        style={{
          maskImage: "linear-gradient(to right, transparent, #000 45%), linear-gradient(to bottom, #000 62%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 45%), linear-gradient(to bottom, #000 62%, transparent)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
        aria-hidden
      >
        <Image
          src="/images/villa.png"
          alt=""
          fill
          sizes="50vw"
          className="object-cover"
          style={{ objectPosition: "60% 50%", filter: "saturate(0.72) sepia(0.18) brightness(1.1) contrast(0.92)" }}
        />
        <div className="absolute inset-0 bg-[#fff3e3]/30" />
        <RankArt className="absolute bottom-[10%] right-[26%] h-44 w-56 opacity-80" />
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-copper">
            <Trophy className="h-4 w-4" />
            Partner ranks
          </p>
          <h2 className="mt-2.5 flex items-center gap-3.5 font-display text-3xl font-bold text-ink sm:text-[2.6rem] sm:leading-tight">
            <span>
              Your growth <span className="text-copper-dark">path</span>
            </span>
            <span className="hidden h-11 w-11 items-center justify-center rounded-full bg-copper/10 text-copper ring-1 ring-copper/20 sm:flex">
              <TrendingUp className="h-5 w-5" />
            </span>
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60 sm:text-base">
            Sell more land, move up the ranks and earn a higher commission and a bigger reward.
          </p>
        </div>
      </div>

      {/* arrows, on the picture */}
      <div className="absolute right-6 top-[165px] z-10 hidden gap-3 sm:top-[170px] lg:flex">
        {arrows.map(([dir, Icon, label]) => (
          <button
            key={dir}
            type="button"
            onClick={() => scroll(dir)}
            aria-label={label}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink/80 shadow-lg shadow-black/10 ring-1 ring-black/5 transition hover:bg-copper hover:text-white"
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>

      {/* The next target */}
      <div className="relative mt-7 rounded-2xl bg-white/85 p-4 shadow-[0_14px_30px_-20px_rgba(110,60,20,0.45)] ring-1 ring-black/5 backdrop-blur-sm sm:p-5">
        {next ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <span className="flex items-center gap-4 sm:w-80 sm:shrink-0">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30">
                <Target className="h-8 w-8" strokeWidth={1.7} />
              </span>
              <span className="leading-tight">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/50">Your next target</span>
                <span className="mt-1 block text-xl font-bold text-ink">{next.title}</span>
                <span className="mt-1 block text-xs text-ink/55">
                  {fmtArea(next.areaToNext)} sq. yards to go <span className="mx-1">•</span> Keep sharing!
                </span>
              </span>
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-ink">{fmtArea(next.areaToNext)} sq. yards to go</span>
              <span className="mt-2.5 block h-2.5 overflow-hidden rounded-full bg-black/10">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-copper to-copper-light"
                  style={{ width: `${Math.max(next.progress, 7)}%` }}
                />
              </span>
              <span className="mt-1.5 block text-right text-xs text-ink/50">
                {fmtArea(teamArea)} / {fmtArea(next.minArea)}
              </span>
            </span>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm font-semibold text-copper">
            <Trophy className="h-4 w-4" />
            Top rank reached. Congratulations!
          </p>
        )}
      </div>

      {/* The ladder */}
      <div
        ref={track}
        className="no-scrollbar relative -mx-6 -mb-5 mt-3 flex snap-x scroll-px-6 gap-4 overflow-x-auto px-6 pb-9 pt-6 [mask-image:linear-gradient(to_right,transparent,#000_20px,#000_calc(100%-56px),transparent)] sm:-mx-8 sm:scroll-px-8 sm:px-8"
      >
        {ranks.map((r, i) => {
          const look = LOOKS[i] ?? LOOKS[0];
          const Icon = look.icon;
          const here = i === currentRank;
          const passed = i < currentRank;
          return (
            <div key={r.title} className="relative w-[210px] shrink-0 snap-start pt-8">
              {/* the track with a dot for each rank */}
              <span
                className={`absolute -left-2 -right-2 top-[11px] h-0.5 ${passed ? "bg-copper" : "bg-black/10"}`}
              />
              <span className="absolute left-12 top-0 flex h-6 w-6 items-center justify-center">
                {here && <span className="absolute inset-0 animate-ping rounded-full bg-copper/35" />}
                <span
                  className={`relative flex items-center justify-center rounded-full ring-4 ring-[#fffaf3] ${
                    here ? "h-6 w-6 bg-copper shadow-md shadow-copper/40" : passed ? "h-5 w-5 bg-copper text-white" : "h-5 w-5 bg-[#e3d9ca]"
                  }`}
                >
                  {passed && <Check className="h-3 w-3" strokeWidth={3.5} />}
                </span>
              </span>

              <div
                className={`relative rounded-2xl bg-gradient-to-b ${look.card} p-4 transition duration-300 hover:-translate-y-1 ${
                  here
                    ? "shadow-[0_16px_30px_-16px_rgba(181,98,47,0.6)] ring-2 ring-copper"
                    : "shadow-[0_12px_26px_-18px_rgba(110,60,20,0.5)] ring-1 ring-black/5 hover:shadow-[0_18px_32px_-16px_rgba(110,60,20,0.5)]"
                }`}
              >
                {here && (
                  <span className="absolute -top-3 right-5 rounded-full bg-gradient-to-b from-copper-light to-copper-dark px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-copper/30">
                    You are here
                  </span>
                )}

                <div className="flex items-start justify-between">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-md ${look.tile}`}>
                    <Icon className="h-7 w-7" strokeWidth={1.7} />
                  </span>
                  <span className={`text-sm font-bold ${look.num}`}>#{i + 1}</span>
                </div>

                <p className="mt-3 min-h-11 text-[15px] font-bold leading-tight text-ink">{r.title}</p>
                <p className="mt-2 text-[2rem] font-extrabold leading-none text-[#a8431a]">{r.commission}</p>
                <p className="mt-1.5 text-xs text-ink/55">{mins?.length ? range(i, mins) : r.area}</p>

                <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5">
                  <span className="flex h-10 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#f8f4ee] to-[#ece4d8] text-copper-dark">
                    <RewardPic image={r.image} icon={i === 0 ? "Gift" : r.icon} alt={r.reward} />
                  </span>
                  <span className="min-w-0 flex-1 [overflow-wrap:anywhere] text-xs font-semibold text-ink/80">{r.reward}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-copper" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
