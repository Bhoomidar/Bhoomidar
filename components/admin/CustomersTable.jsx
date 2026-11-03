"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Eye,
  EyeOff,
  Fingerprint,
  LayoutGrid,
  List,
  Lock,
  Mail,
  Phone,
  Search,
  Table,
  UserCheck,
} from "lucide-react";
import { findCustomerByAadhaar, revealCustomerAadhaar } from "@/actions/admin/customers";
import { maskAadhaar } from "@/lib/aadhaar";
import Select from "../Select";
import { card, inputCls } from "./ui";

const dateText = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

// An email may break only after the "@" (never in the middle of "gmail.com") when it is too long for a line.
const emailText = (e) => String(e).replace("@", "@​");
const initialOf = (name) => (String(name || "?").trim()[0] || "?").toUpperCase();

// The three ways to look at the list (the same as on the Partners page). A phone has no table: it shows the cards.
const VIEWS = [
  { value: "table", label: "Table", icon: Table },
  { value: "cards", label: "Cards", icon: LayoutGrid },
  { value: "list", label: "Compact", icon: List },
];

const avatar = (size) =>
  `flex ${size} shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark font-bold text-white shadow-sm`;

// Every customer that partners registered, and the partner each one is locked to.
// customers: [{ id, name, phone, email, last4, at, partnerId, partnerName, partnerCode }]
export default function CustomersTable({ customers }) {
  const [query, setQuery] = useState("");
  const [partner, setPartner] = useState("all");
  const [view, setViewState] = useState("table");
  const [shown, setShown] = useState({}); // id -> full Aadhaar, after the admin pressed the eye
  const [looking, setLooking] = useState("");
  const [error, setError] = useState("");

  // The view chosen last time. Until then: the table on a wide screen, the cards on a phone.
  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem("customers-admin-view");
    } catch {}
    const phone = !window.matchMedia("(min-width: 640px)").matches;
    if (VIEWS.some((v) => v.value === saved)) return setViewState(phone && saved === "table" ? "cards" : saved);
    if (!window.matchMedia("(min-width: 1024px)").matches) setViewState("cards");
  }, []);
  const setView = (v) => {
    setViewState(v);
    try {
      localStorage.setItem("customers-admin-view", v);
    } catch {}
  };

  // The partners that have customers, for the filter.
  const partners = useMemo(() => {
    const map = new Map();
    for (const c of customers) {
      const p = map.get(c.partnerId) ?? { id: c.partnerId, name: c.partnerName, code: c.partnerCode, n: 0 };
      p.n += 1;
      map.set(c.partnerId, p);
    }
    return [...map.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
  }, [customers]);

  // A whole Aadhaar number typed in the search box: the server finds the customer who has it.
  const typedDigits = query.replace(/\D/g, "");
  const [aadhaarHit, setAadhaarHit] = useState({ digits: "", id: null });
  useEffect(() => {
    if (typedDigits.length !== 12 || aadhaarHit.digits === typedDigits) return;
    let cancelled = false;
    findCustomerByAadhaar(typedDigits).then((res) => {
      if (!cancelled) setAadhaarHit({ digits: typedDigits, id: res.id });
    });
    return () => {
      cancelled = true;
    };
  }, [typedDigits, aadhaarHit.digits]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hitId = typedDigits.length === 12 && aadhaarHit.digits === typedDigits ? aadhaarHit.id : null;
    return customers.filter((c) => {
      if (partner !== "all" && c.partnerId !== partner) return false;
      if (!q) return true;
      return (
        [c.name, c.phone, c.email, c.partnerName, c.partnerCode].some((x) => String(x ?? "").toLowerCase().includes(q)) ||
        // up to 4 digits: the last 4 digits of the Aadhaar
        (typedDigits.length > 0 && typedDigits.length <= 4 && String(c.last4).includes(typedDigits)) ||
        c.id === hitId
      );
    });
  }, [customers, query, partner, typedDigits, aadhaarHit]);

  // The full number is fetched only when asked for, and can be hidden again.
  async function toggleAadhaar(id) {
    if (shown[id]) return setShown((m) => ({ ...m, [id]: "" }));
    setError("");
    setLooking(id);
    const res = await revealCustomerAadhaar(id);
    setLooking("");
    if (!res.success) return setError(res.error);
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

  // The partner a customer is locked to, as a link to the partner's profile.
  const partnerLink = (c, className = "") => (
    <a
      href={`/admin/partners/${c.partnerId}`}
      title={`Open ${c.partnerName}'s profile`}
      className={`font-bold text-ink underline decoration-copper/30 underline-offset-2 transition hover:text-copper hover:decoration-copper ${className}`}
    >
      {c.partnerName}
    </a>
  );
  const codeChip = (c) =>
    c.partnerCode ? (
      <span className="inline-flex rounded-md bg-[#f4ece0] px-2 py-0.5 text-xs font-bold tracking-wide text-ink/65">{c.partnerCode}</span>
    ) : null;

  return (
    <div className={`${card} !p-4 sm:!p-6`}>
      {/* Search, partner filter and the view switch */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[14rem] flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, phone, partner or Aadhaar"
            className={`${inputCls} !pl-10 !text-[15px]`}
          />
        </div>
        <Select
          wrapperClassName="max-sm:w-full sm:w-64"
          variant="toolbar"
          value={partner}
          onChange={setPartner}
          ariaLabel="Filter by partner"
          menuMinWidth={260}
          searchable
          options={[
            { value: "all", label: `All partners (${customers.length})` },
            ...partners.map((p) => ({ value: p.id, label: `${p.name} (${p.n})`, hint: p.code })),
          ]}
        />
        <div className="flex items-center justify-between gap-3 max-sm:w-full sm:ml-auto">
          <p className="text-[15px] text-ink/60">
            Showing {list.length} of {customers.length}
          </p>
          <div role="group" aria-label="Change view" className="inline-flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-black/10">
            {VIEWS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                aria-pressed={view === value}
                title={label}
                className={`items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-bold transition ${
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
      </div>

      {error && <p className="mt-3 text-sm font-medium text-rose-700">{error}</p>}

      {customers.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-[#fbf7f0] px-5 py-12 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30 ring-8 ring-copper/10">
            <UserCheck className="h-7 w-7" />
          </span>
          <p className="mt-5 text-lg font-bold text-ink">No customers yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[15px] leading-relaxed text-ink/60">
            When a partner registers a customer, it shows up here with the partner it is locked to.
          </p>
        </div>
      ) : list.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-[#fbf7f0] px-5 py-10 text-center text-[15px] text-ink/60">Nothing matches your search.</p>
      ) : (
        <>
          {/* Table */}
          {view === "table" && (
            <div className="mt-5 overflow-x-auto rounded-2xl ring-1 ring-black/5 max-sm:hidden">
              <table className="w-full min-w-[920px] text-left text-[15px]">
                <thead className="bg-[#fbf4e8] text-xs font-bold uppercase tracking-wide text-ink/60">
                  <tr>
                    <th className="px-4 py-3.5">Customer</th>
                    <th className="px-4 py-3.5">Phone</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Aadhaar</th>
                    <th className="px-4 py-3.5">Locked to partner</th>
                    <th className="px-4 py-3.5">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 bg-white">
                  {list.map((c) => (
                    <tr key={c.id} className="transition hover:bg-[#fffaf3]">
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-3">
                          <span className={avatar("h-10 w-10 text-base")}>{initialOf(c.name)}</span>
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
                      <td className="px-4 py-3.5">
                        <span className="flex flex-col items-start gap-1">
                          {partnerLink(c, "whitespace-nowrap")}
                          {codeChip(c)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-ink/75">{dateText(c.at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Cards (a phone shows these when the table was chosen) */}
          {(view === "cards" || view === "table") && (
            <ul className={`mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 ${view === "table" ? "sm:hidden" : ""}`}>
              {list.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col rounded-2xl bg-gradient-to-br from-white to-[#fffaf3] p-3.5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md min-[400px]:p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3.5">
                    <span className={avatar("h-12 w-12 text-lg shadow-md shadow-copper/25")}>{initialOf(c.name)}</span>
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
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4ece0] px-2.5 py-1 text-xs font-semibold tabular-nums text-ink/70 sm:px-3 sm:text-[13px]">
                      <Fingerprint className="h-3.5 w-3.5 text-copper" />
                      {aadhaarText(c)}
                      {eye(c)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4ece0] px-2.5 py-1 text-xs font-semibold text-ink/70 sm:px-3 sm:text-[13px]">
                      <Calendar className="h-3.5 w-3.5 text-copper" />
                      {dateText(c.at)}
                    </span>
                  </div>
                  <div className="mt-3.5 flex items-center gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-2.5 ring-1 ring-emerald-600/15">
                    <Lock className="h-4 w-4 shrink-0 text-emerald-700" />
                    <span className="min-w-0 text-[14px] leading-snug text-emerald-900 sm:text-[15px]">
                      Locked to {partnerLink(c, "[overflow-wrap:anywhere]")}
                      {c.partnerCode && <span className="ml-2 text-xs font-bold tracking-wide text-emerald-800/70">{c.partnerCode}</span>}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Compact (two lines on a phone, one line on a wide screen) */}
          {view === "list" && (
            <ul className="mt-5 divide-y divide-black/5 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
              {list.map((c) => (
                <li key={c.id} className="flex flex-col gap-1.5 px-4 py-3 transition hover:bg-[#fffaf3] lg:flex-row lg:items-center lg:gap-5">
                  <span className="flex min-w-0 items-center gap-3 lg:w-[22%]">
                    <span className={avatar("h-9 w-9 text-sm")}>{initialOf(c.name)}</span>
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
                  </span>
                  <span className="flex min-w-0 flex-wrap items-center gap-2 text-[14px] lg:w-[24%]">
                    <Lock className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                    {partnerLink(c, "[overflow-wrap:anywhere]")}
                    {codeChip(c)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
