"use client";

import { Fragment, useActionState, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Gift,
  Home,
  IdCard,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { register } from "@/actions/auth";
import { lookupReferral } from "@/actions/referral";
import { lookupPincode } from "@/actions/pincode";
import { PHONE_PATTERN, keepDigits } from "@/lib/phone";
import { AADHAAR_PATTERN, formatAadhaar } from "@/lib/aadhaar";
import { PINCODE_PATTERN } from "@/lib/india";
import DobPicker from "./DobPicker";
import StatePicker from "./StatePicker";
import ErrorToast from "./ErrorToast";
import { iconClass, inputClass, submitClass } from "./fields";

const input = `${inputClass} !bg-white !py-4 !text-base shadow-sm hover:border-copper/40 lg:!rounded-lg lg:!py-2.5 lg:!text-sm`;

const STEPS = ["Personal details", "Address", "Referral & password"];

// The three steps at the top on a big screen. The one being read is lit up.
function Stepper({ active, className = "mt-5 max-w-xl" }) {
  return (
    <ol className={`mx-auto flex items-start ${className}`}>
      {STEPS.map((label, i) => (
        <Fragment key={label}>
          <li className="relative w-10 shrink-0 text-center sm:w-32">
            <a href={`#step-${i + 1}`} aria-current={active === i + 1 ? "step" : undefined} className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ring-1 transition ${
                  active >= i + 1
                    ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30 ring-copper"
                    : "bg-white text-ink/70 ring-black/10"
                }`}
              >
                {active > i + 1 ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </span>
              <span className={`absolute left-1/2 top-11 -translate-x-1/2 whitespace-nowrap text-[11px] sm:static sm:translate-x-0 sm:whitespace-normal sm:text-xs ${active === i + 1 ? "font-semibold text-copper-dark" : "text-ink/55"}`}>{label}</span>
            </a>
          </li>
          {i < STEPS.length - 1 && (
            <li aria-hidden className={`mt-[18px] h-0.5 flex-1 rounded-full transition ${active > i + 1 ? "bg-copper" : "bg-black/10"}`} />
          )}
        </Fragment>
      ))}
    </ol>
  );
}

// One block of the form: a numbered heading and its fields.
function Panel({ n, icon: Icon, title, hint, delay = 0, flat = false, children }) {
  return (
    <section
      id={`step-${n}`}
      className={`fade-up relative scroll-mt-6 rounded-3xl focus-within:z-20 bg-gradient-to-b from-white to-[#fbf7f0] p-5 shadow-[0_20px_40px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-8 lg:rounded-2xl lg:from-white/90 lg:to-[#fffaf3]/90 lg:px-7 lg:py-5 lg:ring-black/[0.04] ${
        flat ? "lg:rounded-none lg:bg-none lg:shadow-none lg:ring-0" : ""
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30 lg:h-12 lg:w-12 lg:rounded-xl">
          <Icon className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper lg:text-[10px]">
            Step {n} of 3
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl lg:mt-0.5 lg:text-[1.6rem]">{title}</h2>
          {hint && <p className="mt-1 text-sm text-ink/60 lg:mt-0.5 lg:text-[13px]">{hint}</p>}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-6 sm:gap-x-5 lg:mt-3.5 lg:gap-x-6 lg:gap-y-3">{children}</div>
    </section>
  );
}

// A label above its input. `span` is the width on wide screens (out of 6 columns).
// The icon at the start of the field lights up while the field is in use.
function Field({ id, label, span = "col-span-2 sm:col-span-3", note, children }) {
  return (
    <div className={span}>
      <label htmlFor={id} className="mb-2.5 block text-sm font-semibold text-ink/80 lg:mb-1.5 lg:text-[13px]">
        {label}
      </label>
      <div className="relative transition focus-within:[&>svg:first-child]:text-copper focus-within:[&>svg:first-child]:scale-110 [&>svg:first-child]:transition">
        {children}
      </div>
      {note}
    </div>
  );
}

export default function RegisterForm({
  redirectTo,
  refCode = "",
  referrerName = "",
  maxDob,
}) {
  const [state, formAction, pending] = useActionState(register, {});
  const [show, setShow] = useState(false);

  // Which of the three blocks is being read, for the steps at the top.
  const [step, setStep] = useState(1);
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.4;
      let now = 1;
      [1, 2, 3].forEach((n) => {
        const el = document.getElementById(`step-${n}`);
        if (el && el.getBoundingClientRect().top <= line) now = n;
      });
      setStep(now);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const v = state.values ?? {};

  // Referral code: tick it and show the referrer's name as soon as it is a real code.
  const [ref, setRef] = useState(v.referral_code ?? refCode);
  const [refCheck, setRefCheck] = useState(
    refCode && !v.referral_code ? { status: "valid", name: referrerName } : { status: "idle" },
  );
  useEffect(() => {
    const code = ref.trim().toUpperCase();
    if (!code) return setRefCheck({ status: "idle" });
    if (!/^[A-Z]{2}-\d{4,}$/.test(code)) return setRefCheck({ status: "typing" });
    if (refCheck.status === "valid" && refCheck.code === code) return;
    if (code === refCode && referrerName) {
      return setRefCheck({ status: "valid", name: referrerName, code });
    }

    let cancelled = false;
    setRefCheck({ status: "checking" });
    const timer = setTimeout(async () => {
      const res = await lookupReferral(code);
      if (!cancelled) {
        setRefCheck(res.valid ? { status: "valid", name: res.name, code } : { status: "invalid" });
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  // Pincode: show the place it belongs to, and fill in the city and state.
  const [city, setCity] = useState(v.city ?? "");
  const [pin, setPin] = useState(v.pincode ?? "");
  const [pinInfo, setPinInfo] = useState(null);
  const [stateFill, setStateFill] = useState(null);
  const autoCity = useRef("");
  useEffect(() => {
    if (!/^[1-9]\d{5}$/.test(pin)) return setPinInfo(null);
    let cancelled = false;
    setPinInfo({ status: "checking" });
    const timer = setTimeout(async () => {
      const res = await lookupPincode(pin);
      if (cancelled) return;
      if (!res.found) return setPinInfo(res.error ? null : { status: "missing" });
      setPinInfo({ status: "found", ...res });
      // Never overwrite a city the partner typed themselves.
      const previous = autoCity.current;
      setCity((cur) => (!cur.trim() || cur === previous ? res.district : cur));
      autoCity.current = res.district;
      if (res.stateCode) setStateFill({ code: res.stateCode });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pin]);

  const refTone =
    refCheck.status === "valid"
      ? "!border-emerald-500 !bg-emerald-50 focus:!ring-emerald-500/20"
      : refCheck.status === "invalid"
        ? "!border-rose-400 !bg-rose-50"
        : "";

  return (
    <div className="relative w-full">
      {/* Header, big screens */}
      <div className="relative hidden pb-4 lg:block">
        <p className="absolute right-0 top-0 flex items-center gap-3 text-[13px] text-ink/55">
          Already have an account?
          <a
            href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
            className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-copper-dark shadow-sm ring-1 ring-copper/30 transition hover:bg-copper hover:text-white"
          >
            Log in
          </a>
        </p>
        <h1 className="text-center font-display text-[2.6rem] font-bold leading-tight text-ink">
          Become a <span className="text-copper">partner</span>
        </h1>
        <p className="mt-1 text-center text-base text-ink/65">Create your account and start earning commission.</p>
        <Stepper active={step} />
      </div>

      {/* The steps, on a phone */}
      <div className="mb-4 rounded-3xl bg-white/90 px-3 py-4 shadow-[0_20px_40px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 lg:hidden">
        <Stepper active={step} className="max-w-sm px-7 pb-6 sm:px-0 sm:pb-0" />
      </div>

      {/* Form */}
      <form
        action={formAction}
        className="space-y-5 lg:space-y-4"
      >
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <ErrorToast error={state.error} trigger={state} />

        <Panel n={1} icon={User} title="Personal details" hint="Exactly as on your Aadhaar card.">
          <Field id="full_name" label="Full name">
            <User className={iconClass} />
            <input
              required
              id="full_name"
              name="full_name"
              autoComplete="name"
              defaultValue={v.full_name}
              placeholder="Your full name"
              className={input}
            />
          </Field>

          <Field id="father_name" label="Father's name">
            <User className={iconClass} />
            <input
              required
              id="father_name"
              name="father_name"
              autoComplete="off"
              maxLength={100}
              defaultValue={v.father_name}
              placeholder="Your father's full name"
              className={input}
            />
          </Field>

          <Field id="nominee_name" label="Nominee's name">
            <User className={iconClass} />
            <input
              required
              id="nominee_name"
              name="nominee_name"
              autoComplete="off"
              maxLength={100}
              defaultValue={v.nominee_name}
              placeholder="Your nominee's full name"
              className={input}
            />
          </Field>

          <Field id="phone" label="Mobile number">
            <Phone className={iconClass} />
            <input
              required
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel-national"
              pattern={PHONE_PATTERN}
              title="Enter a 10-digit mobile number starting with 6, 7, 8 or 9"
              onInput={(e) => (e.currentTarget.value = keepDigits(e.currentTarget.value))}
              defaultValue={v.phone}
              placeholder="10-digit mobile number"
              className={`${input} !pl-[5.6rem]`}
            />
            <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 border-r border-black/10 pr-3 text-sm font-medium text-ink/70">
              +91
            </span>
          </Field>

          <Field id="email" label="Email address">
            <Mail className={iconClass} />
            <input
              required
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={v.email}
              placeholder="you@example.com"
              className={input}
            />
          </Field>

          <Field id="dob" label="Date of birth">
            <DobPicker
              id="dob"
              name="dob"
              min="1900-01-01"
              max={maxDob}
              defaultValue={v.dob ?? ""}
              className={input}
            />
          </Field>

          <Field
            id="aadhaar"
            label="Aadhaar number"
          >
            <IdCard className={iconClass} />
            <input
              required
              id="aadhaar"
              name="aadhaar"
              inputMode="numeric"
              maxLength={14}
              autoComplete="off"
              pattern={AADHAAR_PATTERN}
              title="Enter your 12-digit Aadhaar number"
              onInput={(e) => (e.currentTarget.value = formatAadhaar(e.currentTarget.value))}
              defaultValue={v.aadhaar}
              placeholder="1234 5678 9012"
              className={`${input} tracking-[0.18em]`}
            />
          </Field>

          <div className="col-span-2 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-[13px] leading-snug text-emerald-900 ring-1 ring-emerald-600/15 sm:col-span-3 sm:h-[72px] sm:self-end lg:h-[58px]">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>Stored in encrypted form. Only our verification team can view it.</span>
          </div>
        </Panel>

        <Panel n={2} icon={Home} title="Address" hint="Where you live right now." delay={120}>
          <Field id="address_line" label="House no., street, area" span="col-span-2 sm:col-span-6">
            <MapPin className={iconClass} />
            <input
              required
              id="address_line"
              name="address_line"
              autoComplete="street-address"
              defaultValue={v.address_line}
              placeholder="House no., street, area"
              className={input}
            />
          </Field>

          <Field id="city" label="City" span="col-span-1 sm:col-span-2">
            <Building2 className={iconClass} />
            <input
              required
              id="city"
              name="city"
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className={input}
            />
          </Field>

          <Field id="state" label="State" span="col-span-1 sm:col-span-2">
            <StatePicker
              id="state"
              name="state"
              defaultValue={v.state ?? ""}
              className={input}
              autofill={stateFill}
            />
          </Field>

          <Field id="pincode" label="Pincode" span="col-span-2 sm:col-span-2">
            <MapPin className={iconClass} />
            <input
              required
              id="pincode"
              name="pincode"
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              pattern={PINCODE_PATTERN}
              title="Enter a 6-digit pincode"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit pincode"
              className={input}
            />
          </Field>

          {pinInfo && (
            <div aria-live="polite" className="col-span-2 -mt-1 text-sm sm:col-span-6">
              {pinInfo.status === "checking" && (
                <p className="flex items-center gap-2 text-ink/60">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-copper border-t-transparent" />
                  Finding your area...
                </p>
              )}
              {pinInfo.status === "missing" && (
                <p className="flex items-center gap-2 font-medium text-amber-700">
                  <XCircle className="h-4 w-4" />
                  We could not find this pincode. Please check it.
                </p>
              )}
              {pinInfo.status === "found" && (
                <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-900 ring-1 ring-emerald-600/15">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div className="leading-snug">
                    <p className="font-semibold">
                      {pinInfo.district}, {pinInfo.state}
                    </p>
                    {pinInfo.areas.length > 0 && (
                      <p className="mt-0.5 text-xs text-emerald-800/80">
                        Areas: {pinInfo.areas.join(", ")}
                        {pinInfo.more > 0 ? ` and ${pinInfo.more} more` : ""}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Panel>

        <div className="space-y-5 lg:space-y-0 lg:rounded-2xl lg:bg-gradient-to-b lg:from-white/90 lg:to-[#fffaf3]/90 lg:shadow-[0_20px_40px_-28px_rgba(110,60,20,0.45)] lg:ring-1 lg:ring-black/[0.04]">
        <Panel
          flat
          n={3}
          icon={KeyRound}
          title="Referral and password"
          hint="Got a code from a friend? Add it here."
          delay={240}
        >
          <Field
            id="referral_code"
            label="Referral code (optional)"
            note={
              <p aria-live="polite" className="mt-2.5 min-h-5 text-sm font-medium lg:mt-1 lg:min-h-4 lg:text-xs">
                {refCheck.status === "valid" && (
                  <span className="text-emerald-700">Referred by {refCheck.name}</span>
                )}
                {refCheck.status === "invalid" && (
                  <span className="text-rose-600">This referral code is not valid.</span>
                )}
              </p>
            }
          >
            <Gift className={iconClass} />
            <input
              id="referral_code"
              name="referral_code"
              autoComplete="off"
              maxLength={12}
              value={ref}
              onChange={(e) => setRef(e.target.value.toUpperCase())}
              placeholder="e.g. UP-8101"
              className={`${input} pr-12 uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal ${refTone}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              {refCheck.status === "valid" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              {refCheck.status === "invalid" && <XCircle className="h-5 w-5 text-rose-500" />}
              {refCheck.status === "checking" && (
                <span className="block h-4 w-4 animate-spin rounded-full border-2 border-copper border-t-transparent" />
              )}
            </span>
          </Field>

          <Field id="password" label="Create password">
            <Lock className={iconClass} />
            <input
              required
              id="password"
              name="password"
              type={show ? "text" : "password"}
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className={`${input} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-copper/70 transition hover:text-copper"
            >
              {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </Field>
        </Panel>

        <div className="fade-up space-y-5 px-1 sm:px-2 lg:space-y-3 lg:px-7 lg:pb-4 lg:pt-0" style={{ animationDelay: "360ms" }}>
          <label className="flex cursor-pointer items-start gap-4 rounded-2xl bg-white p-5 text-sm leading-relaxed text-ink/75 shadow-sm ring-1 ring-black/5 transition hover:ring-copper/40 lg:gap-3 lg:rounded-none lg:bg-transparent lg:p-0 lg:text-[13px] lg:leading-snug lg:shadow-none lg:ring-0 lg:hover:ring-0">
            <input
              required
              type="checkbox"
              name="consent"
              defaultChecked={false}
              className="mt-0.5 h-5 w-5 shrink-0 accent-copper lg:h-4 lg:w-4"
            />
            I confirm these details are correct and I agree that Bhoomidar may use them to verify
            me. My Aadhaar number is stored in encrypted form.
          </label>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={pending}
              className={`${submitClass} btn-shimmer group py-5 text-lg sm:w-auto sm:min-w-[320px] sm:max-w-md sm:px-14 lg:min-w-[300px] lg:max-w-[340px] lg:px-10 lg:py-3 lg:text-base`}
            >
              {pending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account...
                </>
              ) : (
                <>
                  Create my account
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-ink/60 lg:gap-y-1 lg:text-xs">
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Encrypted Aadhaar
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Lock className="h-5 w-5 text-emerald-600" />
              Your data stays private
            </li>
          </ul>

          <p className="text-center text-base text-ink/70 lg:hidden">
            Already have an account?{" "}
            <a
              href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
              className="font-semibold text-copper transition hover:text-copper-dark"
            >
              Log in
            </a>
          </p>
        </div>
        </div>
      </form>
    </div>
  );
}
