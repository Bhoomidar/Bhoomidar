"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy, Gift, Link2, Share2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { GiftArt } from "@/components/dashboard/StatArt";

const STEPS = [
  { title: "Share your code", note: "with friends & network" },
  { title: "They join using your code", note: "and become a partner" },
  { title: "You earn commission", note: "when they sell land" },
];

// The partner's own referral code and link: copy, WhatsApp and share buttons,
// and a short "how it works".
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

  // The link in two parts, so the part that carries the code can stand out.
  let linkBase = link;
  let linkQuery = "";
  try {
    const u = new URL(link);
    linkBase = u.origin + u.pathname;
    linkQuery = u.search;
  } catch {
    // Not a full address: show it whole.
  }

  const message = `Join Bhoomidar as a partner with my referral code ${code}: ${link}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(message)}`;

  // The phone's own share sheet when there is one, otherwise just copy the link.
  const shareMore = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join Bhoomidar", text: `My referral code ${code}`, url: link });
      } catch {
        // The partner closed the share sheet.
      }
    } else {
      copy("link", link);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-5 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(circle, #b5622f 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      />
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-copper-light/20 blur-3xl" />

      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.95fr)] lg:gap-0">
        {/* Code */}
        <div className="flex flex-col justify-center lg:pr-7">
          <div className="rounded-2xl border-2 border-dashed border-copper/35 bg-white/70 p-5 sm:p-6">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-copper">
              <Gift className="h-4 w-4" />
              Your referral code
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="min-w-0 whitespace-nowrap font-sans text-3xl font-extrabold tabular-nums tracking-[0.04em] text-copper-dark sm:text-4xl">
                {code || "—"}
              </span>
              {code && (
                <button
                  type="button"
                  onClick={() => copy("code", code)}
                  aria-label="Copy referral code"
                  className={`ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 transition hover:-translate-y-0.5 ${
                    copied === "code" ? "bg-emerald-500 text-white ring-emerald-500" : "bg-white text-copper-dark ring-black/10 hover:ring-copper"
                  }`}
                >
                  {copied === "code" ? <Check className="h-5 w-5" strokeWidth={3} /> : <Copy className="h-5 w-5" />}
                </button>
              )}
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink/55">
            Share your code and earn commissions when someone joins using it.
          </p>
        </div>

        {/* Link and share */}
        {code && (
          <div className="flex flex-col justify-center lg:border-l lg:border-black/10 lg:px-7">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/55">
              <Link2 className="h-4 w-4 text-copper" />
              Your referral link
            </p>

            <button
              type="button"
              onClick={() => copy("link", link)}
              aria-label="Copy referral link"
              className="group mt-3 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-white to-[#fff6ea] p-1.5 pl-4 text-left shadow-[0_12px_26px_-16px_rgba(110,60,20,0.5)] ring-1 ring-copper/25 transition hover:-translate-y-0.5 hover:ring-copper/60"
            >
              <span className="min-w-0 flex-1 break-all py-1 font-mono text-[13px] leading-snug">
                <span className="text-ink/45">{linkBase}</span>
                <span className="font-bold text-copper-dark">{linkQuery}</span>
              </span>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold shadow-sm transition ${
                  copied === "link"
                    ? "bg-emerald-500 text-white"
                    : "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-copper/30 group-hover:brightness-110"
                }`}
              >
                {copied === "link" ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
                {copied === "link" ? "Copied" : "Copy"}
              </span>
            </button>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <button
                type="button"
                onClick={() => copy("link", link)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-3.5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5"
              >
                {copied === "link" ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
                {copied === "link" ? "Copied" : "Copy link"}
              </button>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="order-first col-span-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-b from-[#2bd96b] to-[#1aa850] px-3.5 py-2.5 sm:order-none sm:col-span-1 text-[13px] font-bold text-white shadow-md shadow-[#25D366]/30 transition hover:-translate-y-0.5 hover:brightness-110"
              >
                <FaWhatsapp className="h-4 w-4" />
                Share on WhatsApp
              </a>
              <button
                type="button"
                onClick={shareMore}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-3.5 py-2.5 text-[13px] font-bold text-copper-dark shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:ring-copper"
              >
                <Share2 className="h-4 w-4" />
                Share more
              </button>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/70 to-[#fbe3cc]/70 p-5 ring-1 ring-copper/10 lg:ml-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-ink">How it works?</p>
            <a
              href="/opportunities"
              aria-label="Read about the partner program"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-copper shadow-sm ring-1 ring-copper/25 transition hover:bg-copper hover:text-white"
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <ol className="relative z-10 mt-4 space-y-4">
            <span className="absolute bottom-4 left-[13px] top-4 w-px bg-copper/30" />
            {STEPS.map(({ title, note }, i) => (
              <li key={title} className="relative flex items-start gap-3">
                <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-xs font-bold text-white shadow-md shadow-copper/30 ring-4 ring-[#fdf1e4]">
                  {i + 1}
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-bold text-ink">{title}</span>
                  <span className="mt-0.5 block text-xs text-ink/55">{note}</span>
                </span>
              </li>
            ))}
          </ol>

          <GiftArt className="pointer-events-none absolute bottom-2 right-2 h-24 w-32" />
        </div>
      </div>
    </div>
  );
}
