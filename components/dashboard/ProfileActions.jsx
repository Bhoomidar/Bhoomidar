"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  MapPin,
  Pencil,
  Phone,
  User,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { changePassword, updateProfile } from "@/actions/profile";
import { lookupPincode } from "@/actions/pincode";
import Modal from "@/components/admin/Modal";
import StatePicker from "@/components/auth/StatePicker";
import { errorClass, iconClass, inputClass } from "@/components/auth/fields";
import { PHONE_PATTERN, keepDigits } from "@/lib/phone";
import { PINCODE_PATTERN } from "@/lib/india";

const input = `${inputClass} !bg-white !py-3.5 !text-base`;
const labelClass = "mb-2 block text-sm font-semibold text-ink/80";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60";
const ghost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink/80 transition hover:border-copper hover:text-copper";

function Field({ id, label, children, note }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">{children}</div>
      {note}
    </div>
  );
}

// Mobile number and address. Name, date of birth, Aadhaar and email stay locked.
function EditModal({ initial, onClose, onSaved }) {
  const [fatherName, setFatherName] = useState(initial.father_name);
  const [nomineeName, setNomineeName] = useState(initial.nominee_name);
  const [phone, setPhone] = useState(initial.phone);
  const [addressLine, setAddressLine] = useState(initial.address_line);
  const [city, setCity] = useState(initial.city);
  const [pin, setPin] = useState(initial.pincode);
  const [stateCode, setStateCode] = useState(initial.state);
  const [stateFill, setStateFill] = useState(null);
  const [pinInfo, setPinInfo] = useState(null);
  const [error, setError] = useState("");
  const [saving, start] = useTransition();
  const autoCity = useRef("");

  // Pincode: show the place, and fill in city and state when the pincode is changed.
  useEffect(() => {
    if (!/^[1-9]\d{5}$/.test(pin)) return setPinInfo(null);
    let cancelled = false;
    const changed = pin !== initial.pincode;
    const timer = setTimeout(async () => {
      const res = await lookupPincode(pin);
      if (cancelled) return;
      if (!res.found) return setPinInfo(res.error ? null : { missing: true });
      setPinInfo(res);
      if (!changed) return;
      const previous = autoCity.current;
      setCity((cur) => (!cur.trim() || cur === previous ? res.district : cur));
      autoCity.current = res.district;
      if (res.stateCode) {
        setStateCode(res.stateCode);
        setStateFill({ code: res.stateCode });
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pin, initial.pincode]);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await updateProfile({
        father_name: fatherName,
        nominee_name: nomineeName,
        phone,
        address_line: addressLine,
        city,
        state: stateCode,
        pincode: pin,
      });
      if (!res.success) return setError(res.error);
      onSaved("Your details are saved.");
    });
  };

  return (
    <Modal title="Edit profile" onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <p className="flex items-start gap-3 rounded-2xl bg-[#fbf7f0] p-4 text-sm text-ink/70 ring-1 ring-black/5">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
          Your full name, date of birth, Aadhaar and email are locked. If one is wrong, please
          contact us.
        </p>

        {error && (
          <div className={errorClass} role="alert">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="edit-father" label="Father's name">
            <User className={iconClass} />
            <input
              required
              id="edit-father"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              maxLength={100}
              className={input}
            />
          </Field>
          <Field id="edit-nominee" label="Nominee's name">
            <User className={iconClass} />
            <input
              required
              id="edit-nominee"
              value={nomineeName}
              onChange={(e) => setNomineeName(e.target.value)}
              maxLength={100}
              className={input}
            />
          </Field>
        </div>

        <Field id="edit-phone" label="Mobile number">
          <Phone className={iconClass} />
          <input
            required
            id="edit-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            pattern={PHONE_PATTERN}
            title="Enter a 10-digit mobile number starting with 6, 7, 8 or 9"
            value={phone}
            onChange={(e) => setPhone(keepDigits(e.target.value))}
            className={input}
          />
        </Field>

        <Field id="edit-address" label="House no., street, area">
          <MapPin className={iconClass} />
          <input
            required
            id="edit-address"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            maxLength={200}
            className={input}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="edit-pin" label="Pincode">
            <MapPin className={iconClass} />
            <input
              required
              id="edit-pin"
              inputMode="numeric"
              maxLength={6}
              pattern={PINCODE_PATTERN}
              title="Enter a 6-digit pincode"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={input}
            />
          </Field>
          <Field id="edit-city" label="City">
            <Building2 className={iconClass} />
            <input
              required
              id="edit-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              maxLength={100}
              className={input}
            />
          </Field>
        </div>

        {pinInfo && (
          <p
            className={`flex items-center gap-2 text-sm font-medium ${
              pinInfo.missing ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {pinInfo.missing ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {pinInfo.missing
              ? "We could not find this pincode. Please check it."
              : `${pinInfo.district}, ${pinInfo.state}`}
          </p>
        )}

        <Field id="state" label="State">
          <StatePicker
            id="state"
            name="state"
            defaultValue={initial.state}
            className={input}
            autofill={stateFill}
            onChange={setStateCode}
          />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={ghost}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={primary}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// How strong a new password is: 0 (too short) to 4.
function strength(pw) {
  if (pw.length < 6) return 0;
  let score = 1;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}
const LEVELS = [
  { text: "Too short", bar: "bg-rose-500", label: "text-rose-600" },
  { text: "Weak", bar: "bg-rose-500", label: "text-rose-600" },
  { text: "Okay", bar: "bg-amber-500", label: "text-amber-600" },
  { text: "Good", bar: "bg-lime-500", label: "text-lime-700" },
  { text: "Strong", bar: "bg-emerald-500", label: "text-emerald-700" },
];

// A password box with its own show/hide eye.
function PasswordField({ id, label, value, onChange, autoComplete, placeholder, icon: Icon = Lock, note }) {
  const [show, setShow] = useState(false);
  return (
    <Field id={id} label={label} note={note}>
      <Icon className={iconClass} />
      <input
        required
        id={id}
        type={show ? "text" : "password"}
        minLength={6}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  );
}

function PasswordModal({ onClose, onSaved }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState("");
  const [saving, start] = useTransition();

  const level = strength(next);
  const matches = again.length > 0 && again === next;

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (next !== again) return setError("The two new passwords do not match.");
    start(async () => {
      const res = await changePassword(current, next);
      if (!res.success) return setError(res.error);
      onSaved("Your password is changed.");
    });
  };

  return (
    <Modal title="Change password" onClose={onClose}>
      <form onSubmit={submit} className="space-y-6">
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#2a2019] to-night p-5 text-white">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark shadow-lg shadow-copper/30">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <p className="text-sm leading-relaxed text-white/80">
            Choose a strong password that you do not use anywhere else.
          </p>
        </div>

        {error && (
          <div className={errorClass} role="alert">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
            {error}
          </div>
        )}

        <PasswordField
          id="pw-current"
          label="Current password"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
        />

        <div className="border-t border-dashed border-black/10" />

        <PasswordField
          id="pw-new"
          label="New password"
          value={next}
          onChange={setNext}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          icon={KeyRound}
          note={
            next && (
              <div className="mt-3" aria-live="polite">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((n) => (
                    <span
                      key={n}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        level >= n ? LEVELS[level].bar : "bg-black/10"
                      }`}
                    />
                  ))}
                </div>
                <p className={`mt-1.5 text-xs font-semibold ${LEVELS[level].label}`}>
                  {LEVELS[level].text}
                  {level < 3 && (
                    <span className="font-normal text-ink/55"> · use 8+ letters, numbers and symbols</span>
                  )}
                </p>
              </div>
            )
          }
        />

        <PasswordField
          id="pw-again"
          label="New password again"
          value={again}
          onChange={setAgain}
          autoComplete="new-password"
          icon={KeyRound}
          note={
            again && (
              <p
                aria-live="polite"
                className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${
                  matches ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {matches ? <Check className="h-4 w-4" strokeWidth={3} /> : <XCircle className="h-4 w-4" />}
                {matches ? "Passwords match" : "Passwords do not match yet"}
              </p>
            )
          }
        />

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} className={ghost}>
            Cancel
          </button>
          <button type="submit" disabled={saving || !matches || level === 0} className={primary}>
            {saving ? "Changing..." : "Change password"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// "Edit profile" and "Change password" buttons for the profile page.
export default function ProfileActions({ initial }) {
  const router = useRouter();
  const [open, setOpen] = useState(null); // "edit" | "password" | null
  const [toast, setToast] = useState("");

  const saved = (message) => {
    setOpen(null);
    setToast(message);
    router.refresh();
    setTimeout(() => setToast(""), 5000);
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => setOpen("edit")} className={primary}>
          <Pencil className="h-4 w-4" />
          Edit profile
        </button>
        <button type="button" onClick={() => setOpen("password")} className={ghost}>
          <KeyRound className="h-4 w-4" />
          Change password
        </button>
      </div>

      {open === "edit" && (
        <EditModal initial={initial} onClose={() => setOpen(null)} onSaved={saved} />
      )}
      {open === "password" && <PasswordModal onClose={() => setOpen(null)} onSaved={saved} />}

      {toast &&
        createPortal(
        <div
          role="status"
          className="fade-up fixed right-4 top-20 z-[70] flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-semibold text-white shadow-2xl lg:top-6"
        >
          <CheckCircle2 className="h-5 w-5" />
          {toast}
        </div>,
        document.body,
        )}
    </>
  );
}
