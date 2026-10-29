"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { resetPassword } from "@/actions/auth";
import Logo from "../Logo";
import ErrorToast from "./ErrorToast";
import { iconClass, inputClass, submitClass } from "./fields";

const input = `${inputClass} !rounded-2xl !bg-white !py-4 !text-base shadow-sm hover:border-copper/40 pr-12`;

// The page the link in the "forgot password" email opens: choose a new password.
export default function ResetForm({ token }) {
  const [state, formAction, pending] = useActionState(resetPassword, {});
  const [show, setShow] = useState(false);

  return (
    <div className="rounded-3xl bg-gradient-to-b from-white to-[#fffaf3] p-6 shadow-[0_40px_80px_-36px_rgba(110,60,20,0.55)] ring-1 ring-black/5 sm:p-8 lg:rounded-[2rem] lg:px-11 lg:py-11">
      <div className="mb-6 hidden justify-center lg:flex">
        <Logo dark size="h-[72px]" />
      </div>

      <div className="text-center">
        <h1 className="font-display text-[2rem] font-bold leading-tight text-ink sm:text-4xl">
          New <span className="text-copper">password</span>
        </h1>
        <p className="mt-2 text-[15px] text-ink/60">Choose a password you will remember.</p>
      </div>

      <form action={formAction} className="mt-7 space-y-5">
        <input type="hidden" name="token" value={token} />
        <ErrorToast error={state.error} trigger={state} />

        {state.expired && (
          <p className="rounded-xl bg-amber-50 px-3.5 py-3 text-sm leading-snug text-amber-900 ring-1 ring-amber-200">
            This link cannot be used any more.{" "}
            <a href="/forgot-password" className="font-bold text-copper hover:text-copper-dark">
              Ask for a new link
            </a>
          </p>
        )}

        {[
          ["password", "New password", "At least 6 characters"],
          ["password2", "Type it again", "Same password again"],
        ].map(([name, label, placeholder]) => (
          <div key={name}>
            <label htmlFor={`reset-${name}`} className="mb-2.5 block text-sm font-bold text-ink/85">
              {label}
            </label>
            <div className="relative [&>svg:first-child]:transition focus-within:[&>svg:first-child]:text-copper">
              <Lock className={iconClass} />
              <input
                required
                id={`reset-${name}`}
                name={name}
                type={show ? "text" : "password"}
                minLength={6}
                autoComplete="new-password"
                placeholder={placeholder}
                className={input}
              />
              {name === "password" && (
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-copper/75 transition hover:text-copper"
                >
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              )}
            </div>
          </div>
        ))}

        <button type="submit" disabled={pending} className={`${submitClass} btn-shimmer group !rounded-2xl py-4 text-base`}>
          {pending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              Change password
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
