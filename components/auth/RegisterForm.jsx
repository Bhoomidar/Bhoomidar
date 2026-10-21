"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Lock, Mail, Phone, User, UserPlus } from "lucide-react";
import { register } from "@/actions/auth";
import { PHONE_PATTERN, keepDigits } from "@/lib/phone";
import { errorClass, iconClass, inputClass, submitClass } from "./fields";

export default function RegisterForm({ redirectTo }) {
  const [state, formAction, pending] = useActionState(register, {});
  const [show, setShow] = useState(false);

  return (
    <div className="rounded-3xl bg-white p-7 shadow-[0_30px_60px_-24px_rgba(110,60,20,0.4)] ring-1 ring-black/5 sm:p-10">
      <h1 className="font-display text-3xl font-bold text-ink">
        Become a <span className="text-copper">partner</span>
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Create your account and start earning commission.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <input type="hidden" name="redirect_to" value={redirectTo} />

        {state.error && (
          <div className={errorClass}>
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
            {state.error}
          </div>
        )}

        <div className="relative">
          <User className={iconClass} />
          <input
            required
            name="full_name"
            autoComplete="name"
            placeholder="Full name"
            className={inputClass}
          />
        </div>

        <div className="relative">
          <Phone className={iconClass} />
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
            className={inputClass}
          />
        </div>

        <div className="relative">
          <Mail className={iconClass} />
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email address"
            className={inputClass}
          />
        </div>

        <div className="relative">
          <Lock className={iconClass} />
          <input
            required
            name="password"
            type={show ? "text" : "password"}
            minLength={6}
            autoComplete="new-password"
            placeholder="Password (at least 6 characters)"
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-copper/70 transition hover:text-copper"
          >
            {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>

        <button type="submit" disabled={pending} className={`${submitClass} mt-2`}>
          {pending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create Account
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-ink/65">
        Already have an account?{" "}
        <a
          href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-semibold text-copper transition hover:text-copper-dark"
        >
          Log in
        </a>
      </p>
    </div>
  );
}
