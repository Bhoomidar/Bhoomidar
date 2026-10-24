"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitInquiry } from "@/actions/contact";
import { PHONE_PATTERN, keepDigits } from "@/lib/phone";

const interests = [
  "Residential Plots",
  "Premium Villas",
  "Farm Land",
  "Commercial Plots",
  "Something else",
];

const field =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-[15px] shadow-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-copper focus:bg-white focus:ring-4 focus:ring-copper/15";

// Remounting the form (new key) gives a fresh, empty form for "Send another".
export default function ContactForm() {
  const [round, setRound] = useState(0);
  return <ContactFormInner key={round} onAgain={() => setRound((n) => n + 1)} />;
}

function ContactFormInner({ onAgain }) {
  const [state, formAction, pending] = useActionState(submitInquiry, {});

  if (state.success) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-copper/10 text-copper ring-8 ring-copper/5">
          <CheckCircle2 className="h-10 w-10" />
        </span>
        <h3 className="mt-6 font-display text-3xl font-bold text-ink">
          Thank you!
        </h3>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/65">
          We have got your message. Our team will get back to you soon.
        </p>
        <button
          onClick={onAgain}
          className="mt-6 text-sm font-semibold text-copper underline-offset-4 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Hidden field: real visitors never see it, spam bots fill it in. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      {state.error && (
        <p className="rounded-xl border border-rose-500/25 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-ink/70">
            Full Name
          </span>
          <input
            required
            name="name"
            type="text"
            placeholder="Your name"
            className={field}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-ink/70">
            Phone Number
          </span>
          <input
            required
            name="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            pattern={PHONE_PATTERN}
            title="Enter a 10-digit mobile number starting with 6, 7, 8 or 9"
            onInput={(e) => (e.currentTarget.value = keepDigits(e.currentTarget.value))}
            placeholder="10-digit mobile number"
            className={field}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-ink/70">
            Email
          </span>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            className={field}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-ink/70">
            I am interested in
          </span>
          <select name="interest" defaultValue={interests[0]} className={field}>
            {interests.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-ink/70">
          Message
        </span>
        <textarea
          required
          name="message"
          rows={5}
          placeholder="Tell us how we can help you"
          className={`${field} resize-none`}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="btn-shimmer group inline-flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-10 py-4 text-[15px] font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-copper/40 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Sending..." : "Send Message"}
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4 transition group-hover:translate-x-1" />
        )}
      </button>
    </form>
  );
}
