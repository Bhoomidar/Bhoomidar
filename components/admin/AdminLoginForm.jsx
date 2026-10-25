"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, TriangleAlert } from "lucide-react";
import { adminLogin } from "@/actions/admin/auth";
import { errorClass, iconClass, inputClass, submitClass } from "../auth/fields";

const input = `${inputClass} !rounded-2xl !bg-white !py-4 !text-base shadow-sm hover:border-copper/40`;

export default function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLogin, {});
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      {state.error && (
        <div role="alert" className={errorClass}>
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="admin-email" className="mb-2.5 block text-sm font-bold text-ink/85">
          Admin email
        </label>
        <div className="relative focus-within:[&>svg:first-child]:text-copper [&>svg:first-child]:transition">
          <Mail className={iconClass} />
          <input
            required
            autoFocus
            id="admin-email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="owner@example.com"
            className={input}
          />
        </div>
      </div>

      <div>
        <label htmlFor="admin-password" className="mb-2.5 block text-sm font-bold text-ink/85">
          Password
        </label>
        <div className="relative focus-within:[&>svg:first-child]:text-copper [&>svg:first-child]:transition">
          <Lock className={iconClass} />
          <input
            required
            id="admin-password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Your password"
            onKeyUp={(e) => setCaps(e.getModifierState?.("CapsLock") ?? false)}
            onBlur={() => setCaps(false)}
            className={`${input} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-copper/75 transition hover:text-copper"
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {caps && (
          <p role="status" className="mt-2.5 flex items-center gap-2 text-sm font-medium text-amber-700">
            <TriangleAlert className="h-4 w-4" />
            Caps Lock is on
          </p>
        )}
      </div>

      <button type="submit" disabled={pending} className={`${submitClass} btn-shimmer group !rounded-2xl py-4 text-base`}>
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

      <p className="flex items-center justify-center gap-2 text-sm text-ink/55">
        <ShieldCheck className="h-[18px] w-[18px] text-emerald-600" />
        Private page, not shown on Google
      </p>
    </form>
  );
}
