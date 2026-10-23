"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { login } from "@/actions/auth";
import ErrorToast from "./ErrorToast";
import { iconClass, inputClass, submitClass } from "./fields";

const input = `${inputClass} !bg-white !py-4 !text-base shadow-sm hover:border-copper/40`;

// A label above its input. The icon at the start lights up while the field is in use.
function Field({ id, label, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2.5 block text-sm font-semibold text-ink/80">
        {label}
      </label>
      <div className="relative focus-within:[&>svg:first-child]:scale-110 focus-within:[&>svg:first-child]:text-copper [&>svg:first-child]:transition">
        {children}
      </div>
    </div>
  );
}

export default function LoginForm({ redirectTo }) {
  const [state, formAction, pending] = useActionState(login, {});
  const [show, setShow] = useState(false);

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_50px_100px_-40px_rgba(110,60,20,0.55)] ring-1 ring-black/5">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2a2019] to-night px-7 py-9 text-white sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-copper/40 blur-3xl" />
        <div className="relative">
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Welcome <span className="text-copper-light">back</span>
          </h1>
          <p className="mt-3 text-base text-white/75">Log in to your partner account.</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-[#fbf7f0] p-7 sm:p-10">
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <ErrorToast error={state.error} trigger={state} />

          <Field id="login-email" label="Email address">
            <Mail className={iconClass} />
            <input
              required
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={input}
            />
          </Field>

          <Field id="login-password" label="Password">
            <Lock className={iconClass} />
            <input
              required
              id="login-password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              className={`${input} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-copper/70 transition hover:text-copper"
            >
              {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </Field>

          <button
            type="submit"
            disabled={pending}
            className={`${submitClass} btn-shimmer group py-4 text-base`}
          >
            {pending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Logging in...
              </>
            ) : (
              <>
                Log in
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-ink/55">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Your login is secure
        </p>

        <div className="mt-6 border-t border-dashed border-black/10 pt-6 text-center text-base text-ink/70">
          New here?{" "}
          <a
            href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-copper transition hover:text-copper-dark"
          >
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
}
