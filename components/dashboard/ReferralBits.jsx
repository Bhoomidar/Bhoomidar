"use client";

import { useState } from "react";
import { ArrowUp, ArrowUpRight, Check, Copy, Gift, Link2, Lock, Share2, UserCheck, Users } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { GiftArt } from "@/components/dashboard/StatArt";

// Copy-to-clipboard with a short "copied" flash.
function useCopy() {
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
  return [copied, copy];
}

const whatsappLink = (code, link) =>
  `https://wa.me/?text=${encodeURIComponent(`Join Bhoomidar as a partner with my referral code ${code}: ${link}`)}`;

// The small "your referral code" card on top of the profile banner.
export function HeroCodeCard({ code, link }) {
  const [copied, copy] = useCopy();

  return (
    <div className="w-full rounded-2xl bg-white/95 p-4 shadow-[0_24px_50px_-20px_rgba(60,30,10,0.5)] ring-1 ring-black/5 backdrop-blur sm:p-5 lg:w-[290px]">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
        <Gift className="h-4 w-4" />
        Your referral code
      </p>
      <div className="mt-2.5 flex items-center justify-between gap-3">
        <span className="whitespace-nowrap font-sans text-3xl font-extrabold tabular-nums tracking-[0.04em] text-copper-dark">
          {code}
        </span>
        <button
          type="button"
          onClick={() => copy("code", code)}
          aria-label="Copy referral code"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 transition hover:-translate-y-0.5 ${
            copied === "code" ? "bg-emerald-500 text-white ring-emerald-500" : "bg-white text-copper-dark ring-black/10 hover:ring-copper"
          }`}
        >
          {copied === "code" ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <a
        href={whatsappLink(code, link)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3.5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5"
      >
        <FaWhatsapp className="h-4 w-4" />
        Share on WhatsApp
      </a>
    </div>
  );
}

// The "Your referral" strip at the bottom of the profile page: code, link, share
// buttons and two numbers. `locked` is for a partner who is not activated yet.
export function ReferralStrip({ code, link, locked, referredCount, joinedThisMonth, referredBy }) {
  const [copied, copy] = useCopy();

  const share = async () => {
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
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-5 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7">
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-copper-light/20 blur-3xl" />

      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,330px)] lg:gap-0">
        <div className="min-w-0 lg:pr-8">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
              <Gift className="h-5 w-5" />
            </span>
            <div className="min-w-0 leading-tight">
              <h2 className="font-display text-2xl font-bold text-ink">Your referral</h2>
              <p className="mt-1 text-sm text-ink/55">Share your code and invite more people to grow your network.</p>
            </div>
          </div>

          {locked ? (
            <p className="mt-5 flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-4 text-sm text-ink/65 ring-1 ring-black/5">
              <Lock className="h-5 w-5 shrink-0 text-copper" />
              Your referral code and link appear after your account is activated.
            </p>
          ) : (
            <div className="mt-5 flex flex-wrap items-stretch gap-3">
              <div className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-copper/35 bg-white/70 px-4 py-3 sm:w-auto sm:justify-start">
                <span className="leading-tight">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-copper">Your referral code</span>
                  <span className="mt-1 block whitespace-nowrap text-2xl font-extrabold tabular-nums tracking-[0.04em] text-copper-dark">
                    {code}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => copy("code", code)}
                  aria-label="Copy referral code"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 transition ${
                    copied === "code" ? "bg-emerald-500 text-white ring-emerald-500" : "bg-white text-copper-dark ring-black/10 hover:ring-copper"
                  }`}
                >
                  {copied === "code" ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="min-w-0 flex-1 basis-56">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/50">
                  <Link2 className="h-3.5 w-3.5 text-copper" />
                  Your referral link
                </p>
                <button
                  type="button"
                  onClick={() => copy("link", link)}
                  aria-label="Copy referral link"
                  className="group mt-1.5 flex w-full items-center gap-2 rounded-xl bg-white py-2 pl-3 pr-2 text-left shadow-sm ring-1 ring-black/10 transition hover:ring-copper/50"
                >
                  <span className="min-w-0 flex-1 break-all font-mono text-xs leading-snug text-ink/75 [overflow-wrap:anywhere]">{link}</span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition ${
                      copied === "link" ? "bg-emerald-500 text-white" : "bg-copper/10 text-copper group-hover:bg-copper group-hover:text-white"
                    }`}
                  >
                    {copied === "link" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Copy className="h-3.5 w-3.5" />}
                  </span>
                </button>
              </div>
            </div>
          )}

          {!locked && (
            <div className="mt-3.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copy("link", link)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5"
              >
                {copied === "link" ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
                {copied === "link" ? "Copied" : "Copy link"}
              </button>
              <a
                href={whatsappLink(code, link)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#2bd96b] to-[#1aa850] px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-[#25D366]/30 transition hover:-translate-y-0.5 hover:brightness-110"
              >
                <FaWhatsapp className="h-4 w-4" />
                Share on WhatsApp
              </a>
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-bold text-copper-dark shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:ring-copper"
              >
                <Share2 className="h-4 w-4" />
                Share more
              </button>
            </div>
          )}
        </div>

        {/* two numbers, and a gift */}
        <div className="relative flex flex-col justify-center gap-5 overflow-hidden lg:border-l lg:border-black/10 lg:pl-8">
          <GiftArt className="pointer-events-none absolute -bottom-2 right-0 h-28 w-36" />
          <div className="relative flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper ring-1 ring-copper/15">
              <Users className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm text-ink/55">People you referred</span>
              <span className="mt-1 flex items-center gap-2">
                <b className="text-2xl font-extrabold tabular-nums text-ink">{referredCount}</b>
                {joinedThisMonth !== null && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    <ArrowUp className="h-3 w-3" strokeWidth={3} />+{joinedThisMonth} this month
                  </span>
                )}
              </span>
            </span>
          </div>

          <div className="relative flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper ring-1 ring-copper/15">
              <UserCheck className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm text-ink/55">Referred by</span>
              <span className="mt-1 flex items-center gap-2 text-lg font-bold text-ink">
                {referredBy}
                <a
                  href="/dashboard/network"
                  aria-label="Open My Network"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-copper shadow-sm ring-1 ring-copper/25 transition hover:bg-copper hover:text-white"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
