"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// One payment detail (like the UPI ID) with a button to copy it.
export default function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked. The value stays on screen to copy by hand.
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">{label}</p>
        <p className="mt-1 break-all font-mono text-[15px] font-semibold text-white">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 transition hover:bg-white/30"
      >
        {copied ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
