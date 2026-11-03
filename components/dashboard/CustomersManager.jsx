"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  LayoutGrid,
  List,
  Lock,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Table,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import { addCustomer, findMyCustomerByAadhaar, revealMyCustomerAadhaar, sendCustomerCode } from "@/actions/customers";
import { formatAadhaar, maskAadhaar } from "@/lib/aadhaar";
import { keepDigits } from "@/lib/phone";
import ErrorToast from "@/components/auth/ErrorToast";
import Modal from "@/components/admin/Modal";
import { iconClass, inputClass, submitClass } from "@/components/auth/fields";

const card =
  "rounded-3xl bg-white p-5 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7";
const input = `${inputClass} !rounded-2xl !bg-white !py-3.5 !text-[15px] shadow-sm hover:border-copper/40`;

const dateText = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

const emailText = (e) => String(e).replace("@", "@\u200b");

const initialOf = (name) => (String(name || "?").trim()[0] || "?").toUpperCase();

const EMPTY = { name: "", phone: "", email: "", aadhaar: "" };

// The three ways to look at the list (the same as on the admin Partners page).
const VIEWS = [
  { value: "table", label: "Table", icon: Table },
  { value: "cards", label: "Cards", icon: LayoutGrid },
  { value: "list", label: "Compact", icon: List },
];

// A label above an input, with the icon of the field at the start of the input.
function Field({ id, label, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-ink/85">
        {label}
      </label>
      <div className="relative focus-within:[&>svg:first-child]:scale-110 focus-within:[&>svg:first-child]:text-copper [&>svg:first-child]:transition">
        {children}
      </div>
    </div>
  );
}

// The two steps of adding a customer: details, then the code from the customer's email.
function Steps({ step }) {
  // [full name, short name for a phone]
  const items = [
    ["Customer details", "Details"],
    ["Verify email", "Verify"],
  ];
  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label="Steps">
      {items.map(([label, short], i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-2 sm:gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                      : "bg-black/[0.07] text-ink/45"
                }`}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : n}
              </span>
              <span className={`whitespace-nowrap text-sm font-semibold ${active || done ? "text-ink" : "text-ink/45"}`}>
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </span>
            </span>
            {i < items.length - 1 && <span className={`h-px w-5 sm:w-12 ${done ? "bg-emerald-400" : "bg-black/15"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

// The partner's customers: a form to add one (the customer's email is checked with a code), and the list.
// customers: [{ id, name, phone, email, last4, at }]
export default function CustomersManager({ customers, heading, stats }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false); // the code was mailed: ask for it
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const [problem, setProblem] = useState({ text: "", n: 0 });
  const [done, setDone] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false); // the form is a popup, opened by "New registration"
  const [view, setViewState] = useState("table");
  const [shown, setShown] = useState({}); // id -> full Aadhaar, after the partner pressed the eye
  const [looking, setLooking] = useState("");

  // The full number is fetched only when asked for, and can be hidden again.
  async function toggleAadhaar(id) {
    if (shown[id]) return setShown((m) => ({ ...m, [id]: "" }));
    setLooking(id);
    const res = await revealMyCustomerAadhaar(id);
    setLooking("");
    if (!res.success) return fail(res.error);
    setShown((m) => ({ ...m, [id]: res.aadhaar }));
  }
  const aadhaarText = (c) => shown[c.id] || maskAadhaar(c.last4);
  const eye = (c) => (
    <button
      type="button"
      onClick={() => toggleAadhaar(c.id)}
      disabled={looking === c.id}
      aria-label={shown[c.id] ? "Hide Aadhaar number" : "Show Aadhaar number"}
      title={shown[c.id] ? "Hide Aadhaar" : "Show Aadhaar"}
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-copper transition hover:bg-copper/10 disabled:opacity-50"
    >
      {shown[c.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem("customers-view");
    } catch {}
    const phone = !window.matchMedia("(min-width: 640px)").matches;
    if (VIEWS.some((v) => v.value === saved)) return setViewState(phone && saved === "table" ? "cards" : saved);
    if (!window.matchMedia("(min-width: 1024px)").matches) setViewState("cards");
  }, []);
  const setView = (v) => {
    setViewState(v);
    try {
      localStorage.setItem("customers-view", v);
    } catch {}
  };

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const closeForm = () => {
    setOpen(false);
    setForm(EMPTY);
    setCode("");
    setSent(false);
    setWait(0);
  };
  const openForm = () => {
    setDone("");
    setOpen(true);
  };

  const fail = (text) => setProblem((p) => ({ text, n: p.n + 1 }));
  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSent(false); // the details changed: a new code is needed
    setCode("");
  };

  async function send() {
    setDone("");
    setBusy(true);
    const res = await sendCustomerCode(form);
    setBusy(false);
    if (res.error) return fail(res.error);
    setSent(true);
    setWait(45);
  }

  async function save(e) {
    e.preventDefault();
    if (!sent) return send();
    setBusy(true);
    const res = await addCustomer({ ...form, code });
    setBusy(false);
    if (res.error) return fail(res.error);
    setDone(`${form.name} is now registered under you.`);
    closeForm();
    router.refresh();
  }

  // A whole Aadhaar number typed in the search box: the server finds the customer who has it.
  const typedDigits = query.replace(/\D/g, "");
  const [aadhaarHit, setAadhaarHit] = useState({ digits: "", id: null });
  useEffect(() => {
    if (typedDigits.length !== 12 || aadhaarHit.digits === typedDigits) return;
    let cancelled = false;
    findMyCustomerByAadhaar(typedDigits).then((res) => {
      if (!cancelled) setAadhaarHit({ digits: typedDigits, id: res.id });
    });
    return () => {
      cancelled = true;
    };
  }, [typedDigits, aadhaarHit.digits]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    const hitId = typedDigits.length === 12 && aadhaarHit.digits === typedDigits ? aadhaarHit.id : null;
    return customers.filter(
      (c) =>
        [c.name, c.phone, c.email].some((x) => String(x).toLowerCase().includes(q)) ||
        // up to 4 digits: the last 4 digits of the Aadhaar
        (typedDigits.length > 0 && typedDigits.length <= 4 && String(c.last4).includes(typedDigits)) ||
        c.id === hitId,
    );
  }, [customers, query, typedDigits, aadhaarHit]);

  return (
    <div className="space-y-8">
      <ErrorToast error={problem.text} trigger={problem} />

      {/* Heading, and the button that opens the form */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        {heading}
        <button
          type="button"
          onClick={openForm}
          className="btn-shimmer inline-flex shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-b from-copper-light to-copper-dark px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-copper/35 transition hover:-translate-y-0.5"
        >
          <UserPlus className="h-5 w-5" />
          New registration
        </button>
      </div>

      {stats}

      {done && (
        <p className="flex items-start gap-3 rounded-2xl bg-emerald-50 px-4 py-3.5 text-[15px] font-semibold leading-snug text-emerald-900 ring-1 ring-emerald-600/15">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          {done}
        </p>
      )}

      {/* Add a customer: a popup (the wrapper keeps it out of the column spacing) */}
      <div className="contents">
      {open && (
      <Modal
        compact
        fullOnPhone
        icon={UserPlus}
        title="New registration"
        subtitle="Add a customer. They will be locked to you."
        onClose={closeForm}
      >
        <Steps step={sent ? 2 : 1} />

        <p className="mt-4 flex items-start gap-3 rounded-2xl bg-[#fbf4e8] px-4 py-3.5 text-[15px] leading-relaxed text-ink/75 ring-1 ring-copper/15">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-copper" />
          <span>
            A customer you register is <b className="text-ink">locked to you</b>. Even if they come to Bhoomidar months later, you
            and our team can see they were registered under you first.
          </span>
        </p>

        <form onSubmit={save} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <Field id="c-name" label="Customer name">
            <UserRound className={iconClass} />
            <input
              id="c-name"
              required
              maxLength={100}
              autoComplete="off"
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              placeholder="Full name"
              className={input}
            />
          </Field>
          <Field id="c-phone" label="Phone number">
            <Phone className={iconClass} />
            <input
              id="c-phone"
              required
              inputMode="numeric"
              autoComplete="off"
              maxLength={10}
              value={form.phone}
              onChange={(e) => set("phone")(keepDigits(e.target.value))}
              placeholder="10-digit mobile number"
              className={input}
            />
          </Field>
          <Field id="c-aadhaar" label="Aadhaar number">
            <Fingerprint className={iconClass} />
            <input
              id="c-aadhaar"
              required
              inputMode="numeric"
              autoComplete="off"
              maxLength={14}
              value={form.aadhaar}
              onChange={(e) => set("aadhaar")(formatAadhaar(e.target.value))}
              placeholder="1234 5678 9012"
              className={`${input} tracking-wider`}
            />
          </Field>
          <Field id="c-email" label="Email address">
            <Mail className={iconClass} />
            <input
              id="c-email"
              required
              type="email"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
              placeholder="customer@example.com"
              className={input}
            />
          </Field>

          {sent && (
            <div className="rounded-2xl bg-emerald-50/70 p-4 ring-1 ring-emerald-600/15 sm:col-span-2 sm:p-5">
              <p className="flex items-start gap-3 text-[15px] leading-snug text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span className="min-w-0">
                  We have sent a 6-digit code to <b className="[overflow-wrap:anywhere]">{form.email}</b>. Ask the customer for it.
                  It works for 10 minutes.
                </span>
              </p>
              <div className="mt-4 sm:max-w-sm">
                <Field id="c-code" label="6-digit code">
                  <KeyRound className={iconClass} />
                  <input
                    id="c-code"
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className={`${input} tracking-[0.4em]`}
                  />
                </Field>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={busy || (sent && code.length !== 6)}
              className={`${submitClass} btn-shimmer !w-full !rounded-2xl !py-4 !text-base sm:!w-auto sm:min-w-72`}
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Please wait...
                </>
              ) : sent ? (
                "Register customer"
              ) : (
                "Send code to customer's email"
              )}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-2xl px-5 py-3 text-[15px] font-semibold text-ink/60 ring-1 ring-black/10 transition hover:text-rose-600 hover:ring-rose-300 sm:order-last"
            >
              Cancel
            </button>
            {sent && (
              <button
                type="button"
                onClick={send}
                disabled={busy || wait > 0}
                className="rounded-xl px-2 py-2 text-[15px] font-semibold text-copper transition hover:text-copper-dark disabled:pointer-events-none disabled:text-ink/40"
              >
                {wait > 0 ? `Send the code again in ${wait}s` : "Send the code again"}
              </button>
            )}
          </div>
        </form>
      </Modal>
      )}
      </div>

      {/* The customers */}
      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="flex items-center gap-3 font-display text-xl font-bold text-ink min-[400px]:text-2xl sm:gap-3.5 sm:text-3xl">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f9d6b8] text-copper sm:h-12 sm:w-12">
              <Users className="h-6 w-6" />
            </span>
            <span>
              Your customers
              <span className="ml-2.5 rounded-full bg-copper/10 px-3 py-0.5 align-middle font-sans text-base font-bold text-copper">
                {customers.length}
              </span>
            </span>
          </h2>
          {customers.length > 0 && (
            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
              <div className="relative min-w-[14rem] flex-1 sm:w-80 sm:min-w-0 sm:flex-none">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-copper/70" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name, phone or Aadhaar"
                  className={`${input} !py-3`}
                />
              </div>
              <div role="group" aria-label="Change view" className="inline-flex shrink-0 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-black/10">
                {VIEWS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setView(value)}
                    aria-pressed={view === value}
                    title={label}
                    className={`items-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition ${
                      value === "table" ? "hidden sm:inline-flex" : "inline-flex"
                    } ${
                      view === value
                        ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                        : "text-ink/60 hover:text-copper"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="max-sm:sr-only">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {customers.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-[#fbf7f0] px-5 py-12 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30 ring-8 ring-copper/10">
              <Users className="h-7 w-7" />
            </span>
            <p className="mt-5 text-lg font-bold text-ink">No customers yet</p>
            <p className="mx-auto mt-1.5 max-w-sm text-[15px] leading-relaxed text-ink/60">
              Add your first customer above. They will show up here, locked to you.
            </p>
          </div>
        ) : list.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-[#fbf7f0] px-5 py-10 text-center text-[15px] text-ink/60">No customer matches your search.</p>
        ) : (
          <>
            {/* Table: one row for each customer (scrolls sideways on a phone) */}
            {view === "table" && (
              <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-black/5">
                <table className="w-full min-w-[760px] text-left text-[15px]">
                  <thead className="bg-[#fbf4e8] text-xs font-bold uppercase tracking-wide text-ink/60">
                    <tr>
                      <th className="px-4 py-3.5">Customer</th>
                      <th className="px-4 py-3.5">Phone</th>
                      <th className="px-4 py-3.5">Email</th>
                      <th className="px-4 py-3.5">Aadhaar</th>
                      <th className="px-4 py-3.5">Registered</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 bg-white">
                    {list.map((c) => (
                      <tr key={c.id} className="transition hover:bg-[#fffaf3]">
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-base font-bold text-white shadow-sm">
                              {initialOf(c.name)}
                            </span>
                            <span className="whitespace-nowrap font-bold text-ink">{c.name}</span>
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-ink/75">{c.phone}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-ink/75">{c.email}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-ink/75">
                          <span className="inline-flex items-center gap-2">
                            {aadhaarText(c)}
                            {eye(c)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-ink/75">{dateText(c.at)}</td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-1 text-xs sm:px-3 sm:text-[13px] font-bold text-emerald-800 ring-1 ring-emerald-200">
                            <Lock className="h-3.5 w-3.5" />
                            Locked to you
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Cards: a card for each customer */}
            {view === "cards" && (
              <ul className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {list.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-2xl bg-gradient-to-br from-white to-[#fffaf3] p-3.5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md min-[400px]:p-4 sm:p-5"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-lg font-bold text-white shadow-md shadow-copper/25">
                        {initialOf(c.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="[overflow-wrap:anywhere] text-lg font-bold leading-snug text-ink">{c.name}</p>
                        <p className="mt-1 flex items-start gap-2 text-[14px] text-ink/65 sm:text-[15px]">
                          <Phone className="mt-1 h-4 w-4 shrink-0 text-copper/70" />
                          <span className="tabular-nums">{c.phone}</span>
                        </p>
                        <p className="mt-1 flex items-start gap-2 text-[14px] text-ink/65 sm:text-[15px]">
                          <Mail className="mt-1 h-4 w-4 shrink-0 text-copper/70" />
                          <span className="break-words">{emailText(c.email)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/5 pt-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4ece0] px-2.5 py-1 text-xs sm:px-3 sm:text-[13px] font-semibold tabular-nums text-ink/70">
                        <Fingerprint className="h-3.5 w-3.5 text-copper" />
                        {aadhaarText(c)}
                        {eye(c)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4ece0] px-2.5 py-1 text-xs sm:px-3 sm:text-[13px] font-semibold text-ink/70">
                        <Calendar className="h-3.5 w-3.5 text-copper" />
                        {dateText(c.at)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs sm:px-3 sm:text-[13px] font-bold text-emerald-800 ring-1 ring-emerald-200">
                        <Lock className="h-3.5 w-3.5" />
                        Locked to you
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Compact: a short row for each customer (two lines on a phone, one line on a wide screen) */}
            {view === "list" && (
              <ul className="mt-6 divide-y divide-black/5 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
                {list.map((c) => (
                  <li key={c.id} className="flex flex-col gap-1.5 px-4 py-3 transition hover:bg-[#fffaf3] sm:flex-row sm:items-center sm:gap-5">
                    <span className="flex min-w-0 items-center gap-3 sm:w-[28%]">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white shadow-sm">
                        {initialOf(c.name)}
                      </span>
                      <span className="[overflow-wrap:anywhere] font-bold text-ink">{c.name}</span>
                    </span>
                    <span className="min-w-0 flex-1 break-words text-[14px] text-ink/65 sm:text-[15px]">
                      <span className="tabular-nums">{c.phone}</span>
                      <span className="mx-1.5 text-ink/30">·</span>
                      {emailText(c.email)}
                    </span>
                    <span className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-semibold text-ink/55">
                      <span className="inline-flex items-center gap-1.5 tabular-nums">
                        {aadhaarText(c)}
                        {eye(c)}
                      </span>
                      <span>{dateText(c.at)}</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <Lock className="h-3.5 w-3.5" />
                        Locked
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
