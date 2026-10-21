"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { setPartnerActive } from "@/actions/admin/partners";
import Switch from "./Switch";
import { card, inputCls } from "./ui";

const date = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function PartnersTable({ partners }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return partners.filter((p) => {
      if (status === "active" && !p.is_active) return false;
      if (status === "off" && p.is_active) return false;
      if (!term) return true;
      return [p.full_name, p.email, p.phone].join(" ").toLowerCase().includes(term);
    });
  }, [partners, search, status]);

  const toggle = (p, value) =>
    start(async () => {
      setError("");
      const res = await setPartnerActive(p.id, value);
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
            placeholder="Search name, email or phone"
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
          <table className="w-full min-w-[680px] text-left">
            <thead>
              <tr className="border-b border-black/5 text-xs uppercase tracking-wider text-ink/50">
                <th className="px-6 py-4 font-semibold">Partner</th>
                <th className="px-4 py-4 font-semibold">Phone</th>
                <th className="px-4 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 text-right font-semibold">Can log in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {shown.map((p) => (
                <tr key={p.id} className="transition hover:bg-[#fbf7f0]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white">
                        {(p.full_name || p.email)[0].toUpperCase()}
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span className="flex items-center gap-2 font-semibold text-ink">
                          {p.full_name || "—"}
                          {p.role === "admin" && (
                            <span className="rounded-full bg-copper/15 px-2 py-0.5 text-[10px] font-bold uppercase text-copper-dark">
                              Admin
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-sm text-ink/55">{p.email}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-ink/75">{p.phone || "—"}</td>
                  <td className="px-4 py-4 text-sm text-ink/75">{date(p.created_at)}</td>
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
    </div>
  );
}
