"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Power, RotateCcw, Wallet } from "lucide-react";
import { deactivatePartner, setPartnerActive } from "@/actions/admin/partners";
import MarkPaidModal from "./MarkPaidModal";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-60";

// What the admin can do to one partner: mark the joining payment paid (which
// activates the account) or unpaid, and switch the whole account on or off.
export default function PartnerControls({ partner, fee }) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const run = (fn) =>
    start(async () => {
      setError("");
      const res = await fn();
      if (!res.success) setError(res.error);
      router.refresh();
    });

  const paid = !!partner.activated_at;
  const label = partner.full_name || partner.email;

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {paid ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (window.confirm(`Mark ${label} as unpaid? Their dashboard will lock until you mark it paid again.`)) {
                run(() => deactivatePartner(partner.id));
              }
            }}
            className={`${base} border border-white/25 text-white hover:bg-white/10`}
          >
            <RotateCcw className="h-4 w-4" />
            Mark as unpaid
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setPaying(true)}
            className={`${base} bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-lg shadow-black/30 hover:-translate-y-0.5`}
          >
            <Wallet className="h-4 w-4" />
            Mark as paid
          </button>
        )}

        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (
              !partner.is_active ||
              window.confirm(`Switch off ${label}? They will not be able to log in.`)
            ) {
              run(() => setPartnerActive(partner.id, !partner.is_active));
            }
          }}
          className={`${base} ${
            partner.is_active
              ? "border border-rose-300/40 text-rose-200 hover:bg-rose-500/15"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          }`}
        >
          <Power className="h-4 w-4" />
          {partner.is_active ? "Switch off account" : "Switch on account"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}

      {paying && (
        <MarkPaidModal
          partner={partner}
          fee={fee}
          onClose={() => setPaying(false)}
          onDone={() => {
            setPaying(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
