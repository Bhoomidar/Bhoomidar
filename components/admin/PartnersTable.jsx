"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, MoreVertical, Power, RotateCcw, Search, UserRound, Wallet } from "lucide-react";
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
// below that the phone moves under the email, so the table never needs to scroll.
const wide = "hidden min-[1500px]:table-cell";

export default function PartnersTable({ partners, fee }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
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

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return partners.filter((p) => {
      if (status === "active" && !p.is_active) return false;
      if (status === "off" && p.is_active) return false;
      if (status === "pending" && (!p.is_active || p.activated_at)) return false;
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

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
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
          options={[
            { value: "all", label: "All partners" },
            { value: "active", label: "Active only" },
            { value: "off", label: "Switched off" },
            { value: "pending", label: "Payment pending" },
          ]}
        />
        <p className="text-sm text-ink/60 sm:ml-auto">
          Showing {shown.length} of {partners.length}
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-rose-500/25 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      {/* Scrolls sideways only on phones and small tablets. */}
      <div className="rounded-3xl bg-white shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 max-lg:overflow-x-auto lg:overflow-hidden">
        {shown.length === 0 ? (
          <p className="py-14 text-center text-sm text-ink/60">No partners found.</p>
        ) : (
          <table className="w-full text-left max-lg:min-w-[860px]">
            <thead>
              <tr className="border-b border-black/5 bg-gradient-to-b from-white to-[#fcf6ee]">
                <th className={`${th} pl-5`}>Partner</th>
                <th className={`${th} ${wide}`}>Phone</th>
                <th className={th}>Code</th>
                <th className={`${th} ${wide}`}>Referred by</th>
                <th className={`${th} ${wide}`}>Referrals</th>
                <th className={th}>Joined</th>
                <th className={th}>Joining payment</th>
                <th className={th}>Can log in</th>
                <th className={`${th} border-l border-black/5 pr-5 text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {shown.map((p) => (
                <tr key={p.id} className="transition hover:bg-[#fffaf3]">
                  <td className="py-5 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-base font-bold text-white shadow-md shadow-copper/30 ring-2 ring-white">
                        {p.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          (p.full_name || p.email)[0].toUpperCase()
                        )}
                      </span>
                      <span className="min-w-0 max-w-[210px] leading-tight">
                        <a
                          href={`/admin/partners/${p.id}`}
                          className="flex items-center gap-2 text-left text-[15px] font-bold text-ink transition hover:text-copper"
                          title="Open full profile"
                        >
                          {p.full_name || "—"}
                          {p.role === "admin" && (
                            <span className="rounded-full bg-copper/15 px-2 py-0.5 text-[10px] font-bold uppercase text-copper-dark">
                              Admin
                            </span>
                          )}
                        </a>
                        <span className="mt-1 block truncate text-[13px] text-ink/55" title={p.email}>
                          {p.email}
                        </span>
                        {p.phone && (
                          <span className="mt-0.5 block truncate text-[13px] text-ink/55 min-[1500px]:hidden">{p.phone}</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className={`${wide} whitespace-nowrap px-3 py-5 text-sm text-ink/80`}>{p.phone || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-5">
                    {p.referral_code ? (
                      <span className="rounded-full bg-[#f6ecdf] px-3 py-1.5 font-mono text-[13px] font-semibold text-ink/75 ring-1 ring-copper/10">
                        {p.referral_code}
                      </span>
                    ) : (
                      <span className="text-sm text-ink/55">—</span>
                    )}
                  </td>
                  <td className={`${wide} px-3 py-5 text-sm leading-snug text-ink/80`}>
                    {byId.get(p.referred_by)?.full_name || "—"}
                  </td>
                  <td className={`${wide} px-3 py-5 text-sm font-medium text-ink/80`}>{referralCounts[p.id] ?? 0}</td>
                  <td className="whitespace-nowrap px-3 py-5 text-sm text-ink/80">{date(p.created_at)}</td>
                  <td className="px-3 py-5">
                    {p.activated_at ? (
                      <div className="leading-tight">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-[13px] font-bold text-emerald-800 ring-1 ring-emerald-200">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          Paid {formatRupees(p.activation_amount ?? fee)}
                        </span>
                        <p className="mt-2 max-w-[190px] break-words text-xs leading-snug text-ink/55">
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
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-3.5 py-1.5 text-[13px] font-bold text-amber-800 ring-1 ring-amber-200">
                          Unpaid
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
                    )}
                  </td>
                  <td className="px-3 py-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                          p.is_active
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-rose-50 text-rose-700 ring-rose-200"
                        }`}
                      >
                        {p.is_active ? "Active" : "Off"}
                      </span>
                      <Switch
                        checked={p.is_active}
                        disabled={pending}
                        label={`Allow ${p.email} to log in`}
                        onChange={(v) => toggle(p, v)}
                      />
                    </div>
                  </td>
                  <td className="border-l border-black/5 px-3 py-5 text-center">
                    <button
                      type="button"
                      onClick={(e) => openMenu(e, p)}
                      aria-label={`More actions for ${p.full_name || p.email}`}
                      aria-haspopup="menu"
                      aria-expanded={menu?.partner.id === p.id}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-white shadow-sm transition hover:border-copper hover:text-copper ${
                        menu?.partner.id === p.id ? "border-copper text-copper" : "border-black/10 text-ink/70"
                      }`}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
