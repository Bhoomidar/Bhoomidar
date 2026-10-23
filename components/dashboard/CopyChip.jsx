"use client";

import { useState } from "react";
import { Check, Copy, Gift } from "lucide-react";

// A value (like the referral code) on a copper "ticket", with a one-tap copy button.
export default function CopyChip({ value, label }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; the value stays visible to copy by hand.
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-copper-light via-copper to-copper-dark text-white shadow-[0_20px_40px_-18px_rgba(140,72,33,0.7)] sm:w-auto">
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 left-1/4 h-28 w-28 rounded-full bg-black/15 blur-2xl" />

      <div className="relative flex items-stretch">
        <div className="flex-1 px-6 py-4 sm:pr-8">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
            <Gift className="h-3.5 w-3.5" />
            {label}
          </p>
          <p className="mt-1.5 font-sans text-3xl font-extrabold tabular-nums tracking-[0.1em] drop-shadow-sm sm:text-4xl">
            {value}
          </p>
        </div>

        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${label}`}
          className="flex w-24 shrink-0 flex-col items-center justify-center gap-1.5 border-l-2 border-dashed border-white/40 bg-black/10 px-3 text-xs font-bold uppercase tracking-wider transition hover:bg-black/20"
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
              copied ? "bg-white text-copper-dark" : "bg-white/20"
            }`}
          >
            {copied ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
          </span>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
