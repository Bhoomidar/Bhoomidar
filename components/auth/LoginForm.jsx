"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Lock, ShieldCheck, UserRound } from "lucide-react";
import { login, loginWithCode, sendLoginCode } from "@/actions/auth";
import Logo from "../Logo";
import ErrorToast from "./ErrorToast";
import { iconClass, inputClass, submitClass } from "./fields";

const input = `${inputClass} !rounded-2xl !bg-white !py-4 !text-base shadow-sm hover:border-copper/40`;

// A label above its input. The icon at the start lights up while the field is in use.
function Field({ id, label, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2.5 block text-sm font-bold text-ink/85">
        {label}
      </label>
      <div className="relative focus-within:[&>svg:first-child]:scale-110 focus-within:[&>svg:first-child]:text-copper [&>svg:first-child]:transition">
        {children}
      </div>
    </div>
  );
}

const tabClass = (on) =>
  `flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
    on ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30" : "text-ink/65 hover:text-copper-dark"
  }`;

// Log in with a 6-digit code sent to the partner's email, instead of the password.
function CodeLogin({ redirectTo }) {
  const [state, formAction, pending] = useActionState(loginWithCode, {});
  const [who, setWho] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState({ text: "", n: 0 });
  const [wait, setWait] = useState(0);

  // the "send again" button opens again after a little while
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function send() {
    if (!who.trim()) return setProblem((p) => ({ text: "Please enter your email or referral code.", n: p.n + 1 }));
    setSending(true);
    const res = await sendLoginCode(who);
    setSending(false);
    if (res.error) return setProblem((p) => ({ text: res.error, n: p.n + 1 }));
    setSent(true);
    setWait(45);
  }

  return (
    <form action={formAction} className="mt-6 space-y-5 [@media(max-height:820px)]:space-y-4">
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <ErrorToast error={problem.text} trigger={problem} />
      <ErrorToast error={state.error} trigger={state} />

      <Field id="login-who" label="Email or referral code">
        <UserRound className={iconClass} />
        <input
          required
          id="login-who"
          name="email"
          type="text"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={who}
          onChange={(e) => {
            setWho(e.target.value);
            setSent(false);
          }}
          placeholder="you@example.com or UP810011"
          className={input}
        />
      </Field>

      {!sent ? (
        <button type="button" onClick={send} disabled={sending} className={`${submitClass} btn-shimmer !rounded-2xl py-4 text-base`}>
          {sending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Sending code...
            </>
          ) : (
            "Send code to my email"
          )}
        </button>
      ) : (
        <>
          <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-[13px] leading-snug text-emerald-900 ring-1 ring-emerald-600/15">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            If this account exists, we have sent a 6-digit code to its email. It works for 10 minutes.
          </p>

          <Field id="login-code" label="6-digit code">
            <KeyRound className={iconClass} />
            <input
              required
              id="login-code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="\d{6}"
              title="Enter the 6-digit code"
              onInput={(e) => (e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""))}
              placeholder="123456"
              className={`${input} tracking-[0.4em]`}
            />
          </Field>

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

          <div className="text-center">
            <button
              type="button"
              onClick={send}
              disabled={sending || wait > 0}
              className="text-sm font-semibold text-copper transition hover:text-copper-dark disabled:pointer-events-none disabled:text-ink/40"
            >
              {wait > 0 ? `Send the code again in ${wait}s` : "Send the code again"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}

export default function LoginForm({ redirectTo, notice = "" }) {
  const [state, formAction, pending] = useActionState(login, {});
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState("password");

  return (
    <div className="space-y-4">
      {/* The picture and the line above the form */}
      <div className="relative h-[150px] overflow-hidden rounded-3xl bg-[#0c0806] shadow-[0_24px_50px_-24px_rgba(20,10,5,0.7)] ring-1 ring-black/10 sm:h-[180px] lg:hidden">
        {/* the house sits on the right, the dark left is kept for the words */}
        <div
          className="absolute inset-y-0 right-0 w-[80%]"
          style={{
            maskImage: "linear-gradient(to right, transparent, #000 38%)",
            WebkitMaskImage: "linear-gradient(to right, transparent, #000 38%)",
          }}
        >
          <Image
            src="/images/loginmobileimg.png"
            alt=""
            fill
            priority
            sizes="360px"
            className="object-cover"
            style={{ objectPosition: "85% 72%" }}
          />
        </div>
        <div className="relative flex h-full flex-col justify-center px-6 sm:px-7">
          <p className="font-display text-[1.6rem] font-bold leading-[1.12] text-white sm:text-[1.9rem]">
            Trusted land
            <span className="block text-copper-light">Brighter</span>
            <span className="block text-copper-light">tomorrow</span>
          </p>
          <span className="mt-3 block h-0.5 w-10 rounded-full bg-copper-light/80" />
        </div>
      </div>

      {/* The form */}
      <div className="rounded-3xl bg-gradient-to-b from-white to-[#fffaf3] p-6 shadow-[0_40px_80px_-36px_rgba(110,60,20,0.55)] ring-1 ring-black/5 sm:p-8 lg:rounded-[2rem] lg:px-11 lg:py-11 [@media(max-height:820px)]:lg:py-7">
        <div className="mb-7 hidden justify-center lg:flex [@media(max-height:820px)]:mb-4 [@media(max-height:820px)]:[&_img]:h-12">
          <Logo dark size="h-[72px]" />
        </div>

        <div className="text-center">
          <h1 className="font-display text-[2rem] font-bold leading-tight text-ink sm:text-4xl lg:text-[2.7rem]">
            Welcome <span className="text-copper">back</span>
          </h1>
          <p className="mt-2 text-[15px] text-ink/60">Log in to your partner account.</p>
        </div>

        {notice && (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm font-medium leading-snug text-emerald-900 ring-1 ring-emerald-600/15">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            {notice}
          </p>
        )}

        <div role="tablist" aria-label="How to log in" className="mt-6 flex gap-1.5 rounded-2xl bg-[#f4ece0] p-1.5">
          <button type="button" role="tab" aria-selected={mode === "password"} onClick={() => setMode("password")} className={tabClass(mode === "password")}>
            Password
          </button>
          <button type="button" role="tab" aria-selected={mode === "code"} onClick={() => setMode("code")} className={tabClass(mode === "code")}>
            Email code (OTP)
          </button>
        </div>

        {mode === "code" && <CodeLogin redirectTo={redirectTo} />}

        <form action={formAction} hidden={mode !== "password"} className="mt-6 space-y-5 [@media(max-height:820px)]:space-y-4">
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <ErrorToast error={state.error} trigger={state} />

          <Field id="login-email" label="Email or referral code">
            <UserRound className={iconClass} />
            <input
              required
              id="login-email"
              name="email"
              type="text"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@example.com or UP810011"
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
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-copper/75 transition hover:text-copper"
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </Field>

          <div className="-mt-1 text-right">
            <a href="/forgot-password" className="text-sm font-semibold text-copper transition hover:text-copper-dark">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={pending}
            className={`${submitClass} btn-shimmer group !rounded-2xl py-4 text-base`}
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
          <ShieldCheck className="h-[18px] w-[18px] text-emerald-600" />
          Your login is secure
        </p>

        <div className="mt-5 border-t border-black/10 pt-5 text-center text-[15px] text-ink/70">
          New here?{" "}
          <a
            href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-bold text-copper transition hover:text-copper-dark"
          >
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
}
