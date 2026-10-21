"use client";

import { useRef, useState } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import Reveal from "./Reveal";

const GAP = 20;

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("");

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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf6ee] to-[#f6ecdc] py-20 lg:py-24">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-copper-light/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#f0c58f]/25 blur-3xl" />
      <Quote
        className="pointer-events-none absolute right-10 top-8 hidden h-56 w-56 rotate-180 text-copper/[0.06] lg:block"
        fill="currentColor"
        strokeWidth={0}
      />

      <div className="container-x relative">
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
              className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:border-copper hover:bg-copper hover:text-white disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={index >= testimonials.length - 1}
              aria-label="Next"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:border-copper hover:bg-copper hover:text-white disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </Reveal>

        <div
          ref={track}
          onScroll={onScroll}
          className="no-scrollbar -mx-2 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 pb-8 pt-2"
        >
          {testimonials.map(({ id, name, role, text, rating }) => (
            <figure
              key={id}
              className="group relative flex shrink-0 basis-full snap-start flex-col overflow-hidden rounded-3xl bg-white p-7 shadow-[0_18px_40px_-20px_rgba(110,60,20,0.35)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_50px_-20px_rgba(110,60,20,0.45)] sm:basis-[calc(50%-10px)] lg:basis-[calc(33.333%-13.34px)]"
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-copper-light via-copper to-copper-dark opacity-0 transition group-hover:opacity-100" />

              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
                  <Quote
                    className="h-5 w-5 rotate-180"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </span>
                <span className="flex gap-0.5">
                  {Array.from({ length: rating ?? 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-copper-light"
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </span>
              </div>

              <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-ink/75">
                {text}
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-4 border-t border-black/5 pt-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-base font-bold text-white ring-4 ring-copper-light/20">
                  {initials(name)}
                </span>
                <span className="leading-tight">
                  <span className="flex items-center gap-1.5 text-base font-bold text-ink">
                    {name}
                    <BadgeCheck className="h-4 w-4 text-copper" />
                  </span>
                  <span className="mt-1 block text-sm text-ink/60">{role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="flex justify-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              onClick={() => goTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-8 bg-copper" : "w-2 bg-copper/25 hover:bg-copper/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
