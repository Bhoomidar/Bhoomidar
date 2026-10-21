"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { adminLogin } from "@/actions/admin/auth";
import { errorClass, iconClass, inputClass, submitClass } from "../auth/fields";

export default function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLogin, {});
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="mt-8 space-y-4">
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
          autoComplete="username"
          placeholder="Admin email"
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
  );
}
