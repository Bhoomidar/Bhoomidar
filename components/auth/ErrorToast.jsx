"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, X } from "lucide-react";

const SHOW_MS = 7000;

// An error from a form, shown as a toast in the corner instead of a box inside
// the form, so it is seen wherever the person has scrolled to. `trigger` changes
// on every submit, so the same error shows again when it happens again.
export default function ErrorToast({ error, trigger }) {
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(0); // counts shows, so the countdown restarts

  useEffect(() => {
    if (!error) return setVisible(false);
    setVisible(true);
    setShown((n) => n + 1);
    const timer = setTimeout(() => setVisible(false), SHOW_MS);
    return () => clearTimeout(timer);
  }, [error, trigger]);

  if (!error || !visible) return null;

  return createPortal(
    <div
      role="alert"
      className="fade-up fixed inset-x-4 top-4 z-[90] overflow-hidden rounded-2xl bg-rose-600 text-white shadow-[0_24px_60px_-12px_rgba(190,18,60,0.6)] sm:inset-x-auto sm:right-6 sm:top-6 sm:w-[26rem]"
    >
      <div className="flex items-start gap-3 px-5 py-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="flex-1 text-[15px] font-semibold leading-snug">{error}</p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Close"
          className="-mr-1 shrink-0 rounded-md p-1 text-white/80 transition hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {/* Time left before it goes away */}
      <div
        key={shown}
        className="h-1 bg-white/40"
        style={{ animation: `toast-shrink ${SHOW_MS}ms linear forwards` }}
      />
    </div>,
    document.body,
  );
}
