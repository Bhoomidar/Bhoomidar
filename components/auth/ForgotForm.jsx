"use client";

import { useActionState } from "react";
import { ArrowLeft, ArrowRight, MailCheck, UserRound } from "lucide-react";
import { requestPasswordReset } from "@/actions/auth";
import Logo from "../Logo";
import ErrorToast from "./ErrorToast";
import { iconClass, inputClass, submitClass } from "./fields";

const input = `${inputClass} !rounded-2xl !bg-white !py-4 !text-base shadow-sm hover:border-copper/40`;

// "Forgot password": the partner types their email (or referral code) and gets a one-time link by email.
export default function ForgotForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {});

  return (
    <div className="rounded-3xl bg-gradient-to-b from-white to-[#fffaf3] p-6 shadow-[0_40px_80px_-36px_rgba(110,60,20,0.55)] ring-1 ring-black/5 sm:p-8 lg:rounded-[2rem] lg:px-11 lg:py-11">
      <div className="mb-6 hidden justify-center lg:flex">
        <Logo dark size="h-[72px]" />
      </div>

      <div className="text-center">
        <h1 className="font-display text-[2rem] font-bold leading-tight text-ink sm:text-4xl">
          Forgot <span className="text-copper">password?</span>
        </h1>
        <p className="mt-2 text-[15px] text-ink/60">We will email you a link to choose a new one.</p>
      </div>

      {state.sent ? (
        <div className="mt-7 space-y-5 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
            <MailCheck className="h-8 w-8" />
          </span>
          <p className="text-[15px] leading-relaxed text-ink/75">
            If an account exists for this email or referral code, we have sent a link to its email. It works for 30 minutes
            and only once. Check the spam folder too.
          </p>
        </div>
      ) : (
        <form action={formAction} className="mt-7 space-y-5">
          <ErrorToast error={state.error} trigger={state} />

          <div>
            <label htmlFor="forgot-email" className="mb-2.5 block text-sm font-bold text-ink/85">
              Email or referral code
            </label>
            <div className="relative [&>svg:first-child]:transition focus-within:[&>svg:first-child]:text-copper">
              <UserRound className={iconClass} />
              <input
                required
                id="forgot-email"
                name="email"
                type="text"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="you@example.com or UP810011"
                className={input}
              />
            </div>
          </div>

          <button type="submit" disabled={pending} className={`${submitClass} btn-shimmer group !rounded-2xl py-4 text-base`}>
            {pending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                Send reset link
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-6 border-t border-black/10 pt-5 text-center text-[15px]">
        <a href="/login" className="inline-flex items-center gap-2 font-bold text-copper transition hover:text-copper-dark">
          <ArrowLeft className="h-4 w-4" />
          Back to log in
        </a>
      </div>
    </div>
  );
}
