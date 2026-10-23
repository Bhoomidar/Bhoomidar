"use client";

import { useState } from "react";
import { Check, Copy, Gift, Link2, Share2 } from "lucide-react";

// The partner's own referral code and link, with copy and WhatsApp share buttons.
export default function ReferralCard({ code, link }) {
  const [copied, setCopied] = useState("");

  const copy = async (what, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      // Clipboard can be blocked; the code and link stay visible to copy by hand.
    }
  };

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(
    `Join Bhoomidar as a partner with my referral code ${code}: ${link}`,
  )}`;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-copper-light via-copper to-copper-dark p-6 text-white shadow-[0_30px_60px_-24px_rgba(140,72,33,0.7)] sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-black/20 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10">
        {/* Code */}
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
            <Gift className="h-4 w-4" />
            Your referral code
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="font-sans text-5xl font-extrabold tabular-nums tracking-[0.08em] drop-shadow-sm sm:text-6xl">
              {code || "—"}
            </span>
            {code && (
              <button
                type="button"
                onClick={() => copy("code", code)}
                aria-label="Copy referral code"
                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold ring-1 ring-white/30 transition hover:bg-white/30"
              >
                {copied === "code" ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
                {copied === "code" ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        </div>

        {/* Link and share */}
        {code && (
          <div className="lg:border-l-2 lg:border-dashed lg:border-white/35 lg:pl-10">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
              <Link2 className="h-4 w-4" />
              Your referral link
            </p>
            <p className="mt-3 break-all rounded-xl bg-black/20 px-4 py-3 font-mono text-sm text-white/95 ring-1 ring-white/15">
              {link}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => copy("link", link)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-copper-dark shadow-lg transition hover:-translate-y-0.5"
              >
                {copied === "link" ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
                {copied === "link" ? "Link copied" : "Copy link"}
              </button>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#1fbd5b]"
              >
                <Share2 className="h-4 w-4" />
                Share on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
