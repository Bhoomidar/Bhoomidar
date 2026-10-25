"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

// Opens the phone's own share sheet; on a laptop it copies the link instead.
export default function PropertyShare({ title, label, doneLabel, shareText }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: shareText || title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The person closed the share sheet, or the browser blocked it: nothing to do.
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
      {copied ? doneLabel : label}
    </button>
  );
}
