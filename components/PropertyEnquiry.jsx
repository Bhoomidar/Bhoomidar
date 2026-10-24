"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, MessageCircle, Phone, Send } from "lucide-react";
import { submitInquiry } from "@/actions/contact";
import { PHONE_PATTERN, keepDigits } from "@/lib/phone";

const field =
  "w-full rounded-xl border border-black/10 bg-[#fbf7f0] px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-copper focus:bg-white focus:ring-4 focus:ring-copper/15";

// The side card on a property page: price, a short "call me" form (it goes to the
// admin's Inquiries list like the contact page does), a call button and WhatsApp.
export default function PropertyEnquiry({ title, interest, price, unit, phone, phoneLink, whatsappLink }) {
  const [state, formAction, pending] = useActionState(submitInquiry, {});

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[0_30px_70px_-30px_rgba(110,60,20,0.5)] ring-1 ring-black/5">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#3a2a1f] via-[#251b14] to-[#14100d] px-6 py-6 text-white">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-copper/40 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-white/60">{unit || "Price"}</p>
        <p className="relative mt-1.5 text-4xl font-extrabold tabular-nums">{price}</p>
      </div>

      <div className="p-6">
        {state.success ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-copper/10 text-copper ring-8 ring-copper/5">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <p className="mt-4 font-display text-2xl font-bold text-ink">Thank you!</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">
              We have your request. Our team will call you soon to book your free site visit.
            </p>
          </div>
        ) : (
          <form action={formAction} className="space-y-3.5">
            <p className="font-display text-xl font-bold text-ink">Book a free site visit</p>
            <p className="-mt-2 text-sm text-ink/60">Leave your number. We will call you back.</p>

            {/* only bots fill this */}
            <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <input type="hidden" name="interest" value={interest} />
            <input type="hidden" name="message" value={`I want a free site visit for ${title}. Please call me.`} />

            <input required name="name" autoComplete="name" placeholder="Your name" className={field} aria-label="Your name" />
            <input
              required
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel-national"
              pattern={PHONE_PATTERN}
              title="Enter a 10-digit mobile number starting with 6, 7, 8 or 9"
              onInput={(e) => (e.currentTarget.value = keepDigits(e.currentTarget.value))}
              placeholder="10-digit mobile number"
              className={field}
              aria-label="Your mobile number"
            />

            {state.error && (
              <p className="rounded-xl border border-rose-500/25 bg-rose-50 px-4 py-3 text-sm text-rose-800">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn-shimmer group inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5 hover:brightness-110 disabled:pointer-events-none disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {pending ? "Sending..." : "Request a call back"}
            </button>
          </form>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-black/5 pt-5">
          <a
            href={phoneLink}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-copper/40 px-4 py-3 text-sm font-semibold text-copper-dark transition hover:bg-copper hover:text-white"
          >
            <Phone className="h-4 w-4" />
            Call us
          </a>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25d366]/10 px-4 py-3 text-sm font-semibold text-[#128c4a] transition hover:bg-[#25d366] hover:text-white"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
        {phone && <p className="mt-3 text-center text-xs text-ink/50">{phone}</p>}
      </div>
    </div>
  );
}
