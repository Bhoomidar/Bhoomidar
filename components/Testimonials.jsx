"use client";

import { useRef, useState } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import Highlighted from "./Highlighted";
import Reveal from "./Reveal";

const GAP = 20;

const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function Testimonials({ c, testimonials }) {
  const track = useRef(null);
  const [index, setIndex] = useState(0);

  const step = () => {
    const first = track.current?.firstElementChild;
    return first ? first.offsetWidth + GAP : 0;
  };

  const scroll = (dir) =>
    track.current?.scrollBy({ left: dir * step(), behavior: "smooth" });

  const onScroll = () => {
    const s = step();
    if (s) setIndex(Math.round(track.current.scrollLeft / s));
  };

  const goTo = (i) =>
    track.current?.scrollTo({ left: i * step(), behavior: "smooth" });

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fdf8f1] to-[#f9efe0] py-20 lg:py-24">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-copper-light/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#f0c58f]/25 blur-3xl" />
      <Quote
        className="pointer-events-none absolute right-[8vw] top-6 hidden h-64 w-64 rotate-180 text-copper/[0.07] lg:block"
        fill="currentColor"
        strokeWidth={0}
      />

      <div className="container-x relative lg:!max-w-none lg:!px-[4.2vw]">
        <Reveal className="flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-8 bg-copper" />
              {c.testi_label}
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              {c.testi_title_1}{" "}
              <span className="text-copper">{c.testi_title_accent}</span>{" "}
              {c.testi_title_2}
            </h2>
            <p className="mt-3 text-base text-ink/65">
              {c.testi_text}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => scroll(-1)}
              disabled={index === 0}
              aria-label="Previous"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink shadow-[0_12px_28px_-12px_rgba(110,60,20,0.45)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:text-copper disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={index >= testimonials.length - 1}
              aria-label="Next"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-[0_14px_30px_-10px_rgba(140,72,33,0.7)] transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </Reveal>

        <div
          ref={track}
          onScroll={onScroll}
          className="no-scrollbar -mx-2 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 pb-10 pt-3"
        >
          {testimonials.map(({ id, name, role, text, rating }, i) => {
            const active = i === index;
            return (
              <figure
                key={id}
                className={`group relative flex shrink-0 basis-full snap-start flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-white to-[#fffaf3] p-7 ring-1 transition duration-300 hover:-translate-y-1.5 sm:basis-[calc(50%-10px)] lg:basis-[calc(33.333%-13.34px)] ${
                  active
                    ? "shadow-[0_30px_60px_-26px_rgba(181,98,47,0.55)] ring-copper/50"
                    : "shadow-[0_20px_44px_-26px_rgba(110,60,20,0.35)] ring-black/5 hover:ring-copper/30"
                }`}
              >
                {/* a soft corner and a big faint quote mark */}
                <div className="pointer-events-none absolute -bottom-4 -right-4 h-36 w-52 rounded-tl-[100%] bg-gradient-to-tl from-copper/[0.10] to-transparent" />
                <Quote
                  className="pointer-events-none absolute bottom-5 right-6 h-20 w-20 rotate-180 text-copper/[0.12]"
                  fill="currentColor"
                  strokeWidth={0}
                />

                <div className="relative flex items-start justify-between">
                  <span
                    className={`flex h-[52px] w-[52px] items-center justify-center rounded-full transition ${
                      active
                        ? "bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/35"
                        : "bg-[#f8e7d6] text-copper group-hover:bg-gradient-to-br group-hover:from-copper-light group-hover:to-copper-dark group-hover:text-white"
                    }`}
                  >
                    <Quote className="h-5 w-5 rotate-180" fill="currentColor" strokeWidth={0} />
                  </span>
                  <span className="flex gap-0.5">
                    {Array.from({ length: rating ?? 5 }).map((_, k) => (
                      <Star key={k} className="h-[18px] w-[18px] text-[#e8891a]" fill="currentColor" strokeWidth={0} />
                    ))}
                  </span>
                </div>

                <blockquote className="relative mt-6 flex-1 whitespace-pre-line font-display text-[17px] leading-relaxed text-ink/80">
                  <Highlighted text={text} />
                </blockquote>

                <figcaption className="relative mt-7">
                  <span className="mb-5 block h-px w-[78%] bg-black/10" />
                  <span className="flex items-center gap-4">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-lg font-bold text-white shadow-md ring-4 ring-copper-light/25">
                      {initials(name)}
                    </span>
                    <span className="min-w-0 leading-tight">
                      <span className="flex items-center gap-1.5 text-base font-bold text-ink">
                        <span className="truncate">{name}</span>
                        <BadgeCheck className="h-[18px] w-[18px] shrink-0 text-copper" />
                      </span>
                      <span className="mt-1 block truncate text-sm text-ink/60">{role}</span>
                    </span>
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <div className="flex justify-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              onClick={() => goTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-12 bg-gradient-to-r from-copper-light to-copper-dark" : "w-2.5 bg-copper/25 hover:bg-copper/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
