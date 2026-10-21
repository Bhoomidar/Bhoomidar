"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LogIn, Lock, Mail } from "lucide-react";
import { login } from "@/actions/auth";
import { errorClass, iconClass, inputClass, submitClass } from "./fields";

export default function LoginForm({ redirectTo }) {
  const [state, formAction, pending] = useActionState(login, {});
  const [show, setShow] = useState(false);

  return (
    <div className="rounded-3xl bg-white p-7 shadow-[0_30px_60px_-24px_rgba(110,60,20,0.4)] ring-1 ring-black/5 sm:p-10">
      <h1 className="font-display text-3xl font-bold text-ink">
        Welcome <span className="text-copper">back</span>
      </h1>
      <p className="mt-2 text-sm text-ink/60">Log in to your partner account.</p>

      <form action={formAction} className="mt-8 space-y-4">
        <input type="hidden" name="redirect_to" value={redirectTo} />

        {state.error && (
          <div className={errorClass}>
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
            {state.error}
          </div>
        )}

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
            autoComplete="current-password"
            placeholder="Password"
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
              Logging in...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Log In
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-ink/65">
        New here?{" "}
        <a
          href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-semibold text-copper transition hover:text-copper-dark"
        >
          Create an account
        </a>
      </p>
    </div>
  );
}
