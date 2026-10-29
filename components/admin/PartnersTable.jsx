"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Clock,
  LayoutGrid,
  List,
  MoreVertical,
  Power,
  PowerOff,
  RotateCcw,
  Search,
  Table,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import {
  deactivatePartner,
  setPartnerActive,
} from "@/actions/admin/partners";
import { formatRupees } from "@/lib/partnerFee";
import ConfirmDialog from "../ConfirmDialog";
import Select from "../Select";
import MarkPaidModal from "./MarkPaidModal";
import Switch from "./Switch";

const date = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const field =
  "w-full rounded-2xl border border-black/10 bg-white text-sm text-ink shadow-[0_8px_20px_-14px_rgba(110,60,20,0.45)] outline-none transition placeholder:text-ink/45 focus:border-copper focus:ring-4 focus:ring-copper/15";

const th = "px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/55";

// Phone, Referred by and Referrals only get their own column on wide screens;
// below that they move under the name, so the table never needs to scroll.
const wide = "hidden min-[1500px]:table-cell";

// The filters, in the same order as the number tiles above the list.
const FILTERS = [
  { value: "all", label: "All partners" },
  { value: "pending", label: "Payment pending" },
  { value: "paid", label: "Paid and active" },
  { value: "off", label: "Switched off" },
];

// The three ways to look at the list. The table needs a wide screen; on a phone it shows the cards.
const VIEWS = [
  { value: "table", label: "Table", icon: Table },
  { value: "cards", label: "Cards", icon: LayoutGrid },
  { value: "list", label: "Compact", icon: List },
];

function Avatar({ p, size = "h-12 w-12 text-base" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark font-bold text-white shadow-md shadow-copper/30 ring-2 ring-white ${size}`}
    >
      {p.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
      ) : (
        (p.full_name || p.email)[0].toUpperCase()
      )}
    </span>
  );
}

// A partner's own code only works once the joining payment is in, so before that it is shown dimmed.
function CodeChip({ p }) {
  if (!p.referral_code) return <span className="text-sm text-ink/55">—</span>;
  if (p.activated_at) {
    return (
      <span className="rounded-full bg-[#f6ecdf] px-3 py-1.5 font-mono text-[13px] font-semibold text-ink/75 ring-1 ring-copper/10">
        {p.referral_code}
      </span>
    );
  }
  return (
    <span className="inline-block leading-tight">
      <span className="rounded-full bg-black/5 px-3 py-1.5 font-mono text-[13px] font-semibold text-ink/40 line-through ring-1 ring-black/5">
        {p.referral_code}
      </span>
      <span className="mt-1.5 block text-[11px] font-medium text-amber-700">Works after payment</span>
    </span>
  );
}

export default function PartnersTable({ partners, fee }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [view, setViewState] = useState("table");
  // The view the admin chose last time. Until they choose one: the table on a wide screen, the cards on a phone.
  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem("partners-view");
    } catch {}
    if (VIEWS.some((v) => v.value === saved)) return setViewState(saved);
    if (!window.matchMedia("(min-width: 1024px)").matches) setViewState("cards");
  }, []);
  const setView = (v) => {
    setViewState(v);
    try {
      localStorage.setItem("partners-view", v);
    } catch {}
  };
  const mode = view; // on a phone the table scrolls sideways
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [activating, setActivating] = useState(null);
  const [confirming, setConfirming] = useState(null);
  // The open row menu: which partner, and where the button sits on screen.
  const [menu, setMenu] = useState(null);

  // Who referred whom, worked out from the list itself.
  const byId = useMemo(() => new Map(partners.map((p) => [p.id, p])), [partners]);
  const referralCounts = useMemo(() => {
    const counts = {};
    for (const p of partners) if (p.referred_by) counts[p.referred_by] = (counts[p.referred_by] ?? 0) + 1;
    return counts;
  }, [partners]);

  const isPending = (p) => p.is_active && !p.activated_at;
  const isPaid = (p) => p.is_active && !!p.activated_at;

  const counts = useMemo(
    () => ({
      all: partners.length,
      pending: partners.filter(isPending).length,
      paid: partners.filter(isPaid).length,
      off: partners.filter((p) => !p.is_active).length,
    }),
    [partners],
  );

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return partners.filter((p) => {
      if (status === "paid" && !isPaid(p)) return false;
      if (status === "off" && p.is_active) return false;
      if (status === "pending" && !isPending(p)) return false;
      if (!term) return true;
      return [p.full_name, p.email, p.phone, p.referral_code].join(" ").toLowerCase().includes(term);
    });
  }, [partners, search, status]);

  // The menu is drawn with fixed positioning (the table scrolls sideways and
  // would clip it), so close it whenever the page moves.
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const toggle = (p, value) =>
    start(async () => {
      setError("");
      const res = await setPartnerActive(p.id, value);
      if (!res.success) setError(res.error);
      router.refresh();
    });

  // Asks first (see the dialog at the bottom), then runs.
  const markUnpaid = (p) => setConfirming(p);

  const confirmUnpaid = () =>
    start(async () => {
      const p = confirming;
      setError("");
      const res = await deactivatePartner(p.id);
      if (!res.success) setError(res.error);
      setConfirming(null);
      router.refresh();
    });

  const openMenu = (e, p) => {
    if (menu?.partner.id === p.id) return setMenu(null);
    const r = e.currentTarget.getBoundingClientRect();
    setMenu({ partner: p, top: r.bottom + 8, right: window.innerWidth - r.right });
  };

  const menuItem =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink transition hover:bg-[#fbeedd] hover:text-copper-dark";

  // The number tiles double as filters.
  const tiles = [
    { value: "all", label: "Total partners", note: "everyone who signed up", icon: Users, tone: "bg-[#f9d6b8] text-copper", ring: "ring-copper/40" },
    { value: "pending", label: "Payment pending", note: "waiting to be activated", icon: Clock, tone: "bg-amber-200/80 text-amber-700", ring: "ring-amber-400/60" },
    { value: "paid", label: "Paid and active", note: "can earn and invite", icon: Check, tone: "bg-emerald-200/80 text-emerald-700", ring: "ring-emerald-400/60" },
    { value: "off", label: "Switched off", note: "cannot log in", icon: PowerOff, tone: "bg-rose-200/80 text-rose-700", ring: "ring-rose-400/60" },
  ];

  const nameLine = (p) => (
    <a
      href={`/admin/partners/${p.id}`}
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-left text-[15px] font-bold text-ink transition hover:text-copper"
      title="Open full profile"
    >
      {p.full_name || "—"}
      {p.role === "admin" && (
        <span className="rounded-full bg-copper/15 px-2 py-0.5 text-[10px] font-bold uppercase text-copper-dark">Admin</span>
      )}
    </a>
  );

  const referredBy = (p) => byId.get(p.referred_by)?.full_name || "";
  // The name of who referred this partner, as a link to that partner's full profile.
  const referrerLink = (p, className = "") => {
    const r = byId.get(p.referred_by);
    if (!r) return "—";
    return (
      <a
        href={`/admin/partners/${r.id}`}
        title={`Open ${r.full_name || r.email}'s profile`}
        className={`font-semibold underline decoration-copper/30 underline-offset-2 transition hover:text-copper hover:decoration-copper ${className}`}
      >
        {r.full_name || r.email}
      </a>
    );
  };

  // The joining payment: paid with its details, or unpaid with the button to mark it.
  const payBlock = (p) =>
    p.activated_at ? (
      <div className="leading-tight">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-[13px] font-bold text-emerald-800 ring-1 ring-emerald-200">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          Paid {formatRupees(p.activation_amount ?? fee)}
        </span>
        <p className="mt-2 max-w-[220px] break-words text-xs leading-snug text-ink/55">
          {date(p.activated_at)}
          {p.activation_note ? ` · ${p.activation_note}` : ""}
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => markUnpaid(p)}
          className="mt-1 text-xs font-medium text-copper underline underline-offset-2 transition hover:text-rose-700 disabled:opacity-50"
        >
          Mark as unpaid
        </button>
      </div>
    ) : (
      <div className="leading-tight">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1.5 text-[13px] font-bold text-amber-800 ring-1 ring-amber-200">
          <Clock className="h-3.5 w-3.5" />
          Payment pending
        </span>
        <button
          type="button"
          onClick={() => setActivating(p)}
          className="mt-2 flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5"
        >
          <Wallet className="h-4 w-4" />
          Mark as paid
        </button>
      </div>
    );

  const menuButton = (p) => (
    <button
      type="button"
      onClick={(e) => openMenu(e, p)}
      aria-label={`More actions for ${p.full_name || p.email}`}
      aria-haspopup="menu"
      aria-expanded={menu?.partner.id === p.id}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white shadow-sm transition hover:border-copper hover:text-copper ${
        menu?.partner.id === p.id ? "border-copper text-copper" : "border-black/10 text-ink/70"
      }`}
    >
      <MoreVertical className="h-5 w-5" />
    </button>
  );

  return (
    <div>
      {/* Numbers; tap one to filter the list */}
      <div className="fade-up mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {tiles.map(({ value, label, note, icon: Icon, tone, ring }) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(status === value ? "all" : value)}
            aria-pressed={status === value}
            className={`flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-[0_18px_36px_-26px_rgba(110,60,20,0.5)] ring-1 transition hover:-translate-y-0.5 sm:gap-4 sm:p-5 ${
              status === value ? `${ring} ring-2` : "ring-black/5"
            }`}
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-2xl font-extrabold tabular-nums text-ink sm:text-3xl">{counts[value]}</span>
              <span className="mt-1 block text-xs font-bold text-ink/80 sm:text-[13px]">{label}</span>
              <span className="mt-0.5 hidden text-[11px] text-ink/50 sm:block">{note}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="my-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-[340px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-copper" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone or code..."
            className={`${field} py-3.5 pl-11 pr-4`}
          />
        </div>
        <Select
          wrapperClassName="sm:w-[190px]"
          variant="toolbar"
          value={status}
          onChange={setStatus}
          ariaLabel="Filter partners"
          menuMinWidth={210}
          options={FILTERS}
        />
        <div className="flex items-center justify-between gap-3 sm:ml-auto">
          <p className="text-sm text-ink/60">
            Showing {shown.length} of {partners.length}
          </p>
          <div role="group" aria-label="Change view" className="inline-flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-black/10">
            {VIEWS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                aria-pressed={mode === value}
                title={label}
                className={`items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition inline-flex ${
                  mode === value
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

      {error && (
        <p className="mb-4 rounded-xl border border-rose-500/25 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      {shown.length === 0 ? (
        <div className="rounded-3xl bg-white py-14 text-center text-sm text-ink/60 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5">
          No partners found.
        </div>
      ) : (
        <>
          {/* Cards: one for each partner */}
          {mode === "cards" && (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 2xl:grid-cols-3">
            {shown.map((p) => (
              <li
                key={p.id}
                className={`rounded-3xl bg-white p-4 shadow-[0_18px_36px_-26px_rgba(110,60,20,0.5)] ring-1 ${
                  isPending(p) ? "ring-amber-300/70" : "ring-black/5"
                } ${p.is_active ? "" : "opacity-80"}`}
              >
                <div className="flex items-start gap-3">
                  <Avatar p={p} />
                  <div className="min-w-0 flex-1 leading-tight">
                    {nameLine(p)}
                    <span className="mt-1 block [overflow-wrap:anywhere] text-[13px] text-ink/55">{p.email}</span>
                    {p.phone && <span className="mt-0.5 block text-[13px] text-ink/55">{p.phone}</span>}
                  </div>
                  {menuButton(p)}
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-black/5 pt-4 text-sm">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/50">Code</dt>
                    <dd className="mt-1.5">
                      <CodeChip p={p} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/50">Joined</dt>
                    <dd className="mt-1.5 text-ink/80">{date(p.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/50">Referred by</dt>
                    <dd className="mt-1.5 [overflow-wrap:anywhere] text-ink/80">{referrerLink(p)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/50">Referrals</dt>
                    <dd className="mt-1.5 font-medium text-ink/80">{referralCounts[p.id] ?? 0}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-black/5 pt-4">
                  {payBlock(p)}
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                        p.is_active ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200"
                      }`}
                    >
                      {p.is_active ? "Can log in" : "Switched off"}
                    </span>
                    <Switch
                      checked={p.is_active}
                      disabled={pending}
                      label={`Allow ${p.email} to log in`}
                      onChange={(v) => toggle(p, v)}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          )}

          {/* Compact: a short row for each partner (two lines on a phone, one line on a wide screen) */}
          {mode === "list" && (
            <ul className="divide-y divide-black/5 overflow-hidden rounded-3xl bg-white shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5">
              {shown.map((p) => (
                <li
                  key={p.id}
                  className={`px-4 py-3.5 sm:px-5 md:flex md:items-center md:gap-4 ${isPending(p) ? "bg-amber-50/60" : ""} ${
                    p.is_active ? "" : "opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-3 md:min-w-0 md:flex-1">
                    <Avatar p={p} size="h-11 w-11 text-sm" />
                    <div className="min-w-0 flex-1 leading-tight">
                      {nameLine(p)}
                      <span className="mt-1 block [overflow-wrap:anywhere] text-xs text-ink/50">{p.email}</span>
                    </div>
                    <div className="md:hidden">{menuButton(p)}</div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 md:mt-0 md:justify-end md:gap-4">
                    <div className="hidden md:block">
                      <CodeChip p={p} />
                    </div>
                    <span className="hidden whitespace-nowrap text-xs text-ink/55 xl:block">{date(p.created_at)}</span>
                    {p.activated_at ? (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                        <Check className="h-3 w-3" strokeWidth={3} />
                        Paid {formatRupees(p.activation_amount ?? fee)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActivating(p)}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5"
                      >
                        <Wallet className="h-3.5 w-3.5" />
                        Mark as paid
                      </button>
                    )}
                    <span className="flex items-center gap-2">
                      <Switch
                        checked={p.is_active}
                        disabled={pending}
                        label={`Allow ${p.email} to log in`}
                        onChange={(v) => toggle(p, v)}
                      />
                      <span className={`w-6 text-xs font-bold ${p.is_active ? "text-emerald-700" : "text-rose-600"}`}>
                        {p.is_active ? "On" : "Off"}
                      </span>
                    </span>
                    <div className="hidden md:block">{menuButton(p)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Table (the default view; scrolls sideways on a phone) */}
          {mode === "table" && (
          <div className="overflow-x-auto rounded-3xl bg-white shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 lg:overflow-hidden">
            <table className="w-full min-w-[860px] text-left lg:min-w-0">
              <thead>
                <tr className="border-b border-black/5 bg-gradient-to-b from-white to-[#fcf6ee]">
                  <th className={`${th} pl-5`}>Partner</th>
                  <th className={`${th} ${wide}`}>Phone</th>
                  <th className={th}>Code</th>
                  <th className={`${th} ${wide}`}>Referred by</th>
                  <th className={`${th} ${wide}`}>Referrals</th>
                  <th className={th}>Joined</th>
                  <th className={th}>Joining payment</th>
                  <th className={th}>Login access</th>
                  <th className={`${th} border-l border-black/5 pr-5 text-center`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {shown.map((p) => (
                  <tr key={p.id} className={`transition hover:bg-[#fffaf3] ${p.is_active ? "" : "bg-black/[0.02] opacity-80"}`}>
                    <td className={`py-5 pl-5 pr-3 ${isPending(p) ? "shadow-[inset_4px_0_0_#fbbf24]" : ""}`}>
                      <div className="flex items-center gap-3">
                        <Avatar p={p} />
                        <span className="min-w-0 max-w-[280px] leading-tight">
                          {nameLine(p)}
                          <span className="mt-1 block break-all text-[13px] text-ink/55" title={p.email}>
                            {p.email}
                          </span>
                          {p.phone && (
                            <span className="mt-0.5 block text-[13px] text-ink/55 min-[1500px]:hidden">{p.phone}</span>
                          )}
                          {referredBy(p) && (
                            <span className="mt-1 block text-xs text-ink/45 min-[1500px]:hidden">
                              Referred by {referrerLink(p, "text-ink/65")}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className={`${wide} whitespace-nowrap px-3 py-5 text-sm text-ink/80`}>{p.phone || "—"}</td>
                    <td className="whitespace-nowrap px-3 py-5">
                      <CodeChip p={p} />
                    </td>
                    <td className={`${wide} px-3 py-5 text-sm leading-snug text-ink/80`}>{referrerLink(p)}</td>
                    <td className={`${wide} px-3 py-5 text-sm font-medium text-ink/80`}>{referralCounts[p.id] ?? 0}</td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-ink/80">{date(p.created_at)}</td>
                    <td className="px-3 py-5">{payBlock(p)}</td>
                    <td className="px-3 py-5">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={p.is_active}
                          disabled={pending}
                          label={`Allow ${p.email} to log in`}
                          onChange={(v) => toggle(p, v)}
                        />
                        <span className={`text-xs font-bold ${p.is_active ? "text-emerald-700" : "text-rose-600"}`}>
                          {p.is_active ? "On" : "Off"}
                        </span>
                      </div>
                    </td>
                    <td className="border-l border-black/5 px-3 py-5 text-center">{menuButton(p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </>
      )}

      {menu && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenu(null)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            style={{ top: menu.top, right: menu.right }}
            className="fade-up fixed z-50 w-64 rounded-2xl bg-white p-2 shadow-[0_30px_60px_-20px_rgba(60,30,10,0.55)] ring-1 ring-copper/20"
          >
            <a href={`/admin/partners/${menu.partner.id}`} role="menuitem" className={menuItem}>
              <UserRound className="h-[18px] w-[18px] text-copper" />
              Open full profile
            </a>
            {menu.partner.activated_at ? (
              <button
                type="button"
                role="menuitem"
                className={menuItem}
                onClick={() => {
                  const p = menu.partner;
                  setMenu(null);
                  markUnpaid(p);
                }}
              >
                <RotateCcw className="h-[18px] w-[18px] text-copper" />
                Mark as unpaid
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                className={menuItem}
                onClick={() => {
                  setActivating(menu.partner);
                  setMenu(null);
                }}
              >
                <Wallet className="h-[18px] w-[18px] text-copper" />
                Mark as paid
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              className={`${menuItem} ${menu.partner.is_active ? "hover:!bg-rose-50 hover:!text-rose-700" : ""}`}
              onClick={() => {
                const p = menu.partner;
                setMenu(null);
                toggle(p, !p.is_active);
              }}
            >
              <Power className={`h-[18px] w-[18px] ${menu.partner.is_active ? "text-rose-500" : "text-emerald-600"}`} />
              {menu.partner.is_active ? "Switch off account" : "Switch on account"}
            </button>
          </div>
        </>
      )}

      {confirming && (
        <ConfirmDialog
          tone="warn"
          icon={RotateCcw}
          title="Mark as unpaid?"
          text={
            <>
              <b className="text-ink">{confirming.full_name || confirming.email}</b>&apos;s dashboard will lock until you
              mark the payment as paid again.
            </>
          }
          confirmText="Yes, mark unpaid"
          busy={pending}
          onConfirm={confirmUnpaid}
          onCancel={() => setConfirming(null)}
        />
      )}

      {activating && (
        <MarkPaidModal
          partner={activating}
          fee={fee}
          onClose={() => setActivating(null)}
          onDone={() => {
            setActivating(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
