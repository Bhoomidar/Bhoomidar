"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  AtSign,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Hash,
  KeyRound,
  Landmark,
  Lock,
  MapPin,
  Pencil,
  Phone,
  User,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { changePassword, updateBank, updateProfile } from "@/actions/profile";
import { lookupIfsc } from "@/actions/ifsc";
import { lookupPincode } from "@/actions/pincode";
import Modal from "@/components/admin/Modal";
import StatePicker from "@/components/auth/StatePicker";
import { errorClass, iconClass, inputClass } from "@/components/auth/fields";
import { PHONE_PATTERN, keepDigits } from "@/lib/phone";
import { PINCODE_PATTERN } from "@/lib/india";
import { accountDigits, cleanIfsc, IFSC_PATTERN } from "@/lib/bank";

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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

// Bank details: where our team pays the partner's points. The account number is typed twice, and
// when one is already saved it can be left empty to keep it.
function BankModal({ initial, onClose, onSaved }) {
  const [holder, setHolder] = useState(initial.holder);
  const [ifsc, setIfsc] = useState(initial.ifsc);
  const [bankName, setBankName] = useState(initial.name);
  const [branch, setBranch] = useState(initial.branch);
  const [upi, setUpi] = useState(initial.upi);
  const [account, setAccount] = useState("");
  const [again, setAgain] = useState("");
  const [ifscInfo, setIfscInfo] = useState(null);
  const [error, setError] = useState("");
  const [saving, start] = useTransition();
  const auto = useRef({ bank: "", branch: "" });

  // IFSC: show the bank and branch it belongs to, and fill them in (never over what the partner typed).
  useEffect(() => {
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return setIfscInfo(null);
    let cancelled = false;
    const timer = setTimeout(async () => {
      const res = await lookupIfsc(ifsc);
      if (cancelled) return;
      if (!res.found) return setIfscInfo(res.error ? null : { missing: true });
      setIfscInfo(res);
      setBankName((cur) => (!cur.trim() || cur === auto.current.bank ? res.bank : cur));
      setBranch((cur) => (!cur.trim() || cur === auto.current.branch ? res.branch : cur));
      auto.current = { bank: res.bank, branch: res.branch };
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ifsc]);

  const matches = account.length > 0 && account === again;
  const hasSaved = !!initial.last4;

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (account && account !== again) return setError("The two account numbers do not match.");
    start(async () => {
      const res = await updateBank({ holder, bank_name: bankName, branch, ifsc, account, account_again: again, upi });
      if (!res.success) return setError(res.error);
      onSaved("Your bank details are saved.");
    });
  };

  return (
    <Modal title={hasSaved ? "Edit bank details" : "Add bank details"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <p className="flex items-start gap-3 rounded-2xl bg-[#fbf7f0] p-4 text-sm text-ink/70 ring-1 ring-black/5">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
          Our team pays your points to this account. Only you and our team can see it, and the account number is stored encrypted.
        </p>

        {error && (
          <div className={errorClass} role="alert">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
            {error}
          </div>
        )}

        <Field id="bank-holder" label="Name on the account">
          <User className={iconClass} />
          <input
            required
            id="bank-holder"
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
            maxLength={80}
            autoComplete="off"
            className={input}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            id="bank-ifsc"
            label="IFSC code"
            note={
              ifscInfo && (
                <p
                  aria-live="polite"
                  className={`mt-2 flex items-start gap-1.5 text-xs font-semibold ${ifscInfo.missing ? "text-amber-700" : "text-emerald-700"}`}
                >
                  {ifscInfo.missing ? <XCircle className="mt-px h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-px h-4 w-4 shrink-0" />}
                  {ifscInfo.missing ? "We could not find this IFSC code. Please check it." : `${ifscInfo.bank}, ${ifscInfo.branch}`}
                </p>
              )
            }
          >
            <Hash className={iconClass} />
            <input
              required
              id="bank-ifsc"
              value={ifsc}
              onChange={(e) => setIfsc(cleanIfsc(e.target.value))}
              maxLength={11}
              pattern={IFSC_PATTERN}
              title="11 characters, like HDFC0000123"
              placeholder="HDFC0000123"
              autoComplete="off"
              className={`${input} uppercase tracking-wider`}
            />
          </Field>
          <Field id="bank-name" label="Bank name">
            <Landmark className={iconClass} />
            <input
              required
              id="bank-name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              maxLength={80}
              autoComplete="off"
              className={input}
            />
          </Field>
        </div>

        <Field id="bank-branch" label="Branch (optional)">
          <Building2 className={iconClass} />
          <input id="bank-branch" value={branch} onChange={(e) => setBranch(e.target.value)} maxLength={100} autoComplete="off" className={input} />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="bank-account" label="Account number">
            <CreditCard className={iconClass} />
            <input
              required={!hasSaved}
              id="bank-account"
              inputMode="numeric"
              maxLength={18}
              value={account}
              onChange={(e) => setAccount(accountDigits(e.target.value))}
              placeholder={hasSaved ? `Leave empty to keep XXXXXX${initial.last4}` : "Account number"}
              autoComplete="off"
              className={input}
            />
          </Field>
          <Field
            id="bank-account-again"
            label="Account number again"
            note={
              again && (
                <p aria-live="polite" className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${matches ? "text-emerald-700" : "text-rose-600"}`}>
                  {matches ? <Check className="h-4 w-4" strokeWidth={3} /> : <XCircle className="h-4 w-4" />}
                  {matches ? "Numbers match" : "Numbers do not match yet"}
                </p>
              )
            }
          >
            <CreditCard className={iconClass} />
            <input
              required={account.length > 0}
              id="bank-account-again"
              inputMode="numeric"
              maxLength={18}
              value={again}
              onChange={(e) => setAgain(accountDigits(e.target.value))}
              autoComplete="off"
              className={input}
            />
          </Field>
        </div>

        <Field id="bank-upi" label="UPI id (optional)">
          <AtSign className={iconClass} />
          <input
            id="bank-upi"
            value={upi}
            onChange={(e) => setUpi(e.target.value.trim())}
            maxLength={60}
            placeholder="name@bank"
            autoComplete="off"
            className={input}
          />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={ghost}>
            Cancel
          </button>
          <button type="submit" disabled={saving || (account.length > 0 && !matches)} className={primary}>
            {saving ? "Saving..." : "Save bank details"}
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

// A button that opens the edit-profile (or change-password) window of <ProfileActions>.
export function ProfileOpenButton({ what = "edit", className = "", children }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("profile:open", { detail: what }))}
      className={className}
    >
      {children}
    </button>
  );
}

// "Edit profile" and "Change password" buttons for the profile page.
export default function ProfileActions({ initial, bank }) {
  const router = useRouter();
  const [open, setOpen] = useState(null); // "edit" | "password" | "bank" | null
  const [toast, setToast] = useState("");

  // Buttons elsewhere on the page ("Edit" on a card) ask for a window like this.
  useEffect(() => {
    const onOpen = (e) => setOpen(e.detail === "password" ? "password" : e.detail === "bank" ? "bank" : "edit");
    window.addEventListener("profile:open", onOpen);
    return () => window.removeEventListener("profile:open", onOpen);
  }, []);

  const saved = (message) => {
    setOpen(null);
    setToast(message);
    router.refresh();
    setTimeout(() => setToast(""), 5000);
  };

  return (
    <>
      <div className="flex gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setOpen("edit")}
          className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-3.5 py-2.5 text-[13px] font-semibold sm:gap-2 sm:px-5 sm:text-sm text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5"
        >
          <Pencil className="h-4 w-4" />
          Edit profile
        </button>
        <button
          type="button"
          onClick={() => setOpen("password")}
          className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-white px-3.5 py-2.5 text-[13px] font-semibold sm:gap-2 sm:px-5 sm:text-sm text-ink/80 shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:text-copper hover:ring-copper"
        >
          <Lock className="h-4 w-4 text-copper" />
          Change password
        </button>
      </div>

      {open === "edit" && (
        <EditModal initial={initial} onClose={() => setOpen(null)} onSaved={saved} />
      )}
      {open === "password" && <PasswordModal onClose={() => setOpen(null)} onSaved={saved} />}
      {open === "bank" && bank && <BankModal initial={bank} onClose={() => setOpen(null)} onSaved={saved} />}

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
