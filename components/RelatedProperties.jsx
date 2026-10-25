"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Home, MapPin } from "lucide-react";
import { DETAIL_ICONS, categoryIcon } from "@/lib/icons";

const badgeTone = (text) => (/hot/i.test(text) ? "bg-[#e5473d]" : "bg-[#f07b3f]");

function Card({ p, button }) {
  const CategoryIcon = categoryIcon(p);
  const href = p.slug ? `/properties/${p.slug}` : "/contact";
  const details = Array.isArray(p.details) ? p.details.filter((d) => d?.text) : [];
  // The place goes on its own line, the other lines in two columns under it.
  const place = p.location || details[0]?.text || "";
  const rest = details.filter((d) => d.text !== place).slice(0, 4);

  return (
    <article className="group flex h-full flex-col rounded-3xl bg-white p-2.5 shadow-[0_18px_44px_-20px_rgba(60,35,15,0.35)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_54px_-18px_rgba(60,35,15,0.45)]">
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden rounded-2xl bg-[#f1e6d4]">
        {p.image_url && (
          <Image
            src={p.image_url}
            alt={p.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-ink shadow">
          <CategoryIcon className="h-3.5 w-3.5 text-copper" />
          {p.category}
        </span>
        {p.badge && (
          <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold text-white shadow ${badgeTone(p.badge)}`}>
            {p.badge}
          </span>
        )}
        <a
          href={href}
          aria-label={`See ${p.title}`}
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-lg transition hover:bg-copper hover:text-white"
        >
          <ArrowRight className="h-5 w-5" />
        </a>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <h3 className="font-display text-2xl font-bold leading-tight text-ink">
          <a href={href} className="transition hover:text-copper-dark">
            {p.title}
          </a>
        </h3>
        {place && (
          <p className="mt-2.5 flex items-center gap-2.5 text-sm text-ink/70">
            <MapPin className="h-4 w-4 shrink-0 text-copper" />
            {place}
          </p>
        )}
        {rest.length > 0 && (
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {rest.map(({ icon, text }, i) => {
              const Icon = DETAIL_ICONS[icon] ?? DETAIL_ICONS.MapPin;
              return (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-snug text-ink/70">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                  {text}
                </li>
              );
            })}
          </ul>
        )}
        <a
          href={href}
          className="mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-6 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-copper/25 transition hover:brightness-110 lg:mt-auto"
        >
          {button}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}

// "More properties": a row of cards you can slide with the arrows (or swipe).
export default function RelatedProperties({ c, items }) {
  const track = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () =>
      setEdge({
        start: el.scrollLeft <= 4,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  const slide = (dir) => {
    const el = track.current;
    const card = el?.firstElementChild;
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 20), behavior: "smooth" });
  };

  const arrow =
    "flex h-12 w-12 items-center justify-center rounded-full bg-[#f9e3cf] text-copper-dark transition hover:bg-copper hover:text-white disabled:pointer-events-none disabled:opacity-40";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {c.pd_more_label && (
            <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-ink/60">
              {c.pd_more_label}
              <span className="h-px w-16 bg-copper/60" />
            </p>
          )}
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-5xl">
            {c.pd_more_title_1} <span className="text-copper">{c.pd_more_title_accent}</span>
          </h2>
          {c.pd_more_text && <p className="mt-3 max-w-xl text-base text-ink/65">{c.pd_more_text}</p>}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => slide(-1)} disabled={edge.start} aria-label="Previous properties" className={arrow}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => slide(1)} disabled={edge.end} aria-label="Next properties" className={arrow}>
            <ChevronRight className="h-5 w-5" />
          </button>
          {c.pd_more_link && (
            <a href="/properties" className="group ml-3 hidden items-center gap-2 text-[15px] font-semibold text-copper-dark sm:inline-flex">
              {c.pd_more_link}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
          )}
        </div>
      </div>

      <div
        ref={track}
        className="no-scrollbar -mx-6 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 sm:mx-0 sm:px-0"
      >
        {items.map((p) => (
          <div key={p.id} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
            <Card p={p} button={c.pd_card_btn || "View Details"} />
          </div>
        ))}
      </div>
    </div>
  );
}
