"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

// Photos of a property: a big one with small ones beside it, and a full screen viewer
// (arrows, keyboard, swipe-friendly thumbnails) that opens on a click.
export default function PropertyGallery({ images, title }) {
  const [open, setOpen] = useState(-1);
  const n = images.length;

  const go = useCallback((dir) => setOpen((i) => (i < 0 ? i : (i + dir + n) % n)), [n]);

  useEffect(() => {
    if (open < 0) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(-1);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, go]);

  if (n === 0) return null;

  // How the big photo and the small ones share the grid on a laptop.
  const shownSmall = Math.min(n - 1, 4);
  const mainSpan = n === 1 ? "lg:col-span-4" : n === 2 ? "lg:col-span-3" : "lg:col-span-2";
  // The small photos fill the right half without leaving a hole: with four photos the last one runs across.
  const smallSpanOf = (k) =>
    n === 2 ? "lg:col-span-1 lg:row-span-2" : n === 3 ? "lg:col-span-2" : n === 4 && k === 2 ? "lg:col-span-2" : "";

  const tile = (i, cls, sizes) => (
    <button
      key={i}
      type="button"
      onClick={() => setOpen(i)}
      aria-label={`Open photo ${i + 1} of ${n}`}
      className={`group relative overflow-hidden rounded-2xl bg-[#f1e6d4] ${cls}`}
    >
      <Image
        src={images[i]}
        alt={`${title} - photo ${i + 1}`}
        fill
        priority={i === 0}
        sizes={sizes}
        className="object-cover transition duration-700 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
      {i === 0 && (
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/55 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
          <Expand className="h-3.5 w-3.5" />
          View all {n} photos
        </span>
      )}
    </button>
  );

  return (
    <>
      {/* phones: one big photo and a strip under it */}
      <div className="lg:hidden">
        {tile(0, "block aspect-[4/3] w-full", "100vw")}
        {n > 1 && (
          <div className="no-scrollbar -mx-6 mt-3 flex gap-3 overflow-x-auto px-6">
            {images.slice(1).map((_, k) =>
              tile(k + 1, "h-20 w-28 shrink-0 sm:h-24 sm:w-36", "150px"),
            )}
          </div>
        )}
      </div>

      {/* laptops: a grid */}
      <div className="hidden h-[min(34rem,62vh)] grid-cols-4 grid-rows-2 gap-3 lg:grid">
        {tile(0, `row-span-2 ${mainSpan}`, "50vw")}
        {Array.from({ length: shownSmall }, (_, k) => {
          const i = k + 1;
          const last = k === 3 && n > 5;
          return (
            <div key={i} className={`relative ${smallSpanOf(k)}`}>
              {tile(i, "absolute inset-0 h-full w-full", "25vw")}
              {last && (
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 text-lg font-semibold text-white backdrop-blur-[2px]"
                >
                  +{n - 5} more
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* the full screen viewer */}
      {open >= 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photos`}
          className="fixed inset-0 z-[100] flex flex-col bg-[#0a0705]/95 backdrop-blur-md"
        >
          <div className="flex items-center justify-between px-5 py-4 text-white">
            <p className="text-sm text-white/70">
              <b className="font-semibold text-white">{title}</b> &nbsp;·&nbsp; {open + 1} / {n}
            </p>
            <button
              type="button"
              onClick={() => setOpen(-1)}
              aria-label="Close"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1" onClick={() => setOpen(-1)}>
            <Image
              src={images[open]}
              alt={`${title} - photo ${open + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {n > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-copper sm:left-6"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-copper sm:right-6"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {n > 1 && (
            <div className="no-scrollbar flex justify-center gap-2.5 overflow-x-auto px-5 py-4">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                    i === open ? "ring-copper-light" : "opacity-60 ring-transparent hover:opacity-100"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="96px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
