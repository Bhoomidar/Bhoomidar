"use client";

import { useActionState, useState } from "react";
import { Building2, CheckCircle2, Loader2, Lock, Mail, MessageSquareText, PhoneCall, Send, UserRound } from "lucide-react";
import { submitInquiry } from "@/actions/contact";
import Select from "@/components/Select";
import { PHONE_PATTERN, keepDigits } from "@/lib/phone";

const interests = [
  "Residential Plots",
  "Premium Villas",
  "Farm Land",
  "Commercial Plots",
  "Something else",
];

const field =
  "w-full rounded-xl border border-black/10 bg-white py-3.5 pl-11 pr-4 text-[15px] shadow-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-copper focus:bg-white focus:ring-4 focus:ring-copper/15";

const iconCls = "pointer-events-none absolute left-4 h-[18px] w-[18px] text-copper";

// A label, and a box with an icon on its left.
function Field({ label, icon: Icon, top = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-ink/70">{label}</span>
      <span className="relative block">
        <Icon className={`${iconCls} ${top ? "top-4" : "top-1/2 -translate-y-1/2"}`} />
        {children}
      </span>
    </label>
  );
}

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
        <span className="relative flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/25" />
          <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 ring-8 ring-emerald-100">
            <CheckCircle2 className="h-12 w-12" strokeWidth={1.8} />
          </span>
        </span>
        <h3 className="mt-7 font-display text-3xl font-bold text-ink">
          Thank you!
        </h3>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/65">
          We have got your message. Our team will get back to you soon.
        </p>
        <button
          onClick={onAgain}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-copper shadow-sm ring-1 ring-copper/30 transition hover:-translate-y-0.5 hover:bg-copper hover:text-white"
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
        <Field label="Full Name" icon={UserRound}>
          <input required name="name" type="text" placeholder="Your name" className={field} />
        </Field>
        <Field label="Phone Number" icon={PhoneCall}>
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
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" icon={Mail}>
          <input name="email" type="email" placeholder="you@example.com" className={field} />
        </Field>
        <div className="block">
          <span className="mb-2 block text-xs font-semibold text-ink/70">
            I am interested in
          </span>
          <Select
            name="interest"
            defaultValue={interests[0]}
            options={interests}
            variant="form"
            icon={Building2}
            ariaLabel="I am interested in"
          />
        </div>
      </div>

      <Field label="Message" icon={MessageSquareText} top>
        <textarea
          required
          name="message"
          rows={5}
          placeholder="Tell us how we can help you"
          className={`${field} resize-none`}
        />
      </Field>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <p className="flex items-center gap-2 text-xs text-ink/50">
          <Lock className="h-3.5 w-3.5 shrink-0 text-copper" />
          We only use your details to reply to you.
        </p>
      </div>
    </form>
  );
}
