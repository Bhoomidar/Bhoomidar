"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// The big view of a photo, on top of everything. Closes on the X, a tap outside the photo, or Escape.
function Lightbox({ image, alt, onClose }) {
  useEffect(() => {
    // Caught early (window, capture) so Escape closes only the photo, not a popup underneath it.
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Photo"}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-[90] flex cursor-zoom-out items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-10"
    >
      <button
        type="button"
        autoFocus
        aria-label="Close"
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-ink shadow-lg transition hover:text-copper"
      >
        <X className="h-5 w-5" />
      </button>
      <figure onClick={(e) => e.stopPropagation()} className="flex max-w-3xl cursor-default flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={alt} className="max-h-[75vh] w-auto min-w-[min(80vw,420px)] max-w-full rounded-2xl bg-white object-contain shadow-2xl" />
        {alt && <figcaption className="rounded-full bg-white px-5 py-2 text-center text-base font-bold text-ink shadow-lg">{alt}</figcaption>}
      </figure>
    </div>,
    document.body,
  );
}

// Anything you can tap to see `image` big. `className` styles the tappable box.
export default function RewardZoom({ image, alt = "", className = "", children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={alt ? `See a bigger photo of ${alt}` : "See a bigger photo"}
        className={`cursor-zoom-in ${className}`}
      >
        {children}
      </button>
      {open && <Lightbox image={image} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}
