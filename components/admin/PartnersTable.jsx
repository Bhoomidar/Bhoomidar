"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Search, Wallet } from "lucide-react";
import {
  deactivatePartner,
  setPartnerActive,
} from "@/actions/admin/partners";
import { formatRupees } from "@/lib/partnerFee";
import MarkPaidModal from "./MarkPaidModal";
import Switch from "./Switch";
import { card, inputCls } from "./ui";

const date = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function PartnersTable({ partners, fee }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [activating, setActivating] = useState(null);

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

  const toggle = (p, value) =>
    start(async () => {
      setError("");
      const res = await setPartnerActive(p.id, value);
      if (!res.success) setError(res.error);
      router.refresh();
    });

  const markUnpaid = (p) =>
    start(async () => {
      if (!window.confirm(`Mark ${p.full_name || p.email} as unpaid? Their dashboard will lock until you mark it paid again.`)) {
        return;
      }
      setError("");
      const res = await deactivatePartner(p.id);
      if (!res.success) setError(res.error);
      router.refresh();
    });

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-copper/70" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone or code"
            className={`${inputCls} !py-2.5 pl-10`}
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`${inputCls} !py-2.5 sm:w-44`}
        >
          <option value="all">All partners</option>
          <option value="active">Active only</option>
          <option value="off">Switched off</option>
          <option value="pending">Payment pending</option>
        </select>
        <p className="text-sm text-ink/55 sm:ml-auto">
          Showing {shown.length} of {partners.length}
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-rose-500/25 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      <div className={`${card} overflow-x-auto !p-0`}>
        {shown.length === 0 ? (
          <p className="py-14 text-center text-sm text-ink/60">No partners found.</p>
        ) : (
          <table className="w-full min-w-[1020px] text-left">
            <thead>
              <tr className="border-b border-black/5 text-xs uppercase tracking-wider text-ink/50">
                <th className="px-6 py-4 font-semibold">Partner</th>
                <th className="px-4 py-4 font-semibold">Phone</th>
                <th className="px-4 py-4 font-semibold">Code</th>
                <th className="px-4 py-4 font-semibold">Referred by</th>
                <th className="px-4 py-4 font-semibold">Referrals</th>
                <th className="px-4 py-4 font-semibold">Joined</th>
                <th className="px-4 py-4 font-semibold">Joining payment</th>
                <th className="px-6 py-4 text-right font-semibold">Can log in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {shown.map((p) => (
                <tr key={p.id} className="transition hover:bg-[#fbf7f0]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white">
                        {p.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (p.full_name || p.email)[0].toUpperCase()
              )}
                      </span>
                      <span className="min-w-0 leading-tight">
                        <a
                          href={`/admin/partners/${p.id}`}
                          className="flex items-center gap-2 text-left font-semibold text-ink hover:text-copper"
                          title="Open full profile"
                        >
                          {p.full_name || "—"}
                          {p.role === "admin" && (
                            <span className="rounded-full bg-copper/15 px-2 py-0.5 text-[10px] font-bold uppercase text-copper-dark">
                              Admin
                            </span>
                          )}
                        </a>
                        <span className="block truncate text-sm text-ink/55">{p.email}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-ink/75">{p.phone || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-sm text-ink/75">{p.referral_code || "—"}</td>
                  <td className="px-4 py-4 text-sm text-ink/75">
                    {byId.get(p.referred_by)?.full_name || "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-ink/75">{referralCounts[p.id] ?? 0}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-ink/75">{date(p.created_at)}</td>
                  <td className="px-4 py-4">
                    {p.activated_at ? (
                      <div className="leading-tight">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          Paid {formatRupees(p.activation_amount ?? fee)}
                        </span>
                        <p className="mt-1.5 whitespace-nowrap text-xs text-ink/55">
                          {date(p.activated_at)}
                          {p.activation_note ? ` · ${p.activation_note}` : ""}
                        </p>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => markUnpaid(p)}
                          className="mt-1 text-xs text-ink/50 underline-offset-2 hover:text-rose-700 hover:underline disabled:opacity-50"
                        >
                          Mark as unpaid
                        </button>
                      </div>
                    ) : (
                      <div className="leading-tight">
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                          Unpaid
                        </span>
                        <button
                          type="button"
                          onClick={() => setActivating(p)}
                          className="mt-2 flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-gradient-to-b from-copper-light to-copper-dark px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-copper/30 transition hover:-translate-y-0.5"
                        >
                          <Wallet className="h-3.5 w-3.5" />
                          Mark as paid
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`text-xs font-medium ${p.is_active ? "text-emerald-700" : "text-rose-700"}`}
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
