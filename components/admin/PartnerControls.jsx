"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Power, RotateCcw, Wallet } from "lucide-react";
import { deactivatePartner, setPartnerActive } from "@/actions/admin/partners";
import ConfirmDialog from "../ConfirmDialog";
import MarkPaidModal from "./MarkPaidModal";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60";

// What the admin can do to one partner: mark the joining payment paid (which
// activates the account) or unpaid, and switch the whole account on or off.
export default function PartnerControls({ partner, fee }) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  // Which question is on screen: "unpaid", "off", or none.
  const [ask, setAsk] = useState(null);

  const run = (fn) =>
    start(async () => {
      setError("");
      const res = await fn();
      if (!res.success) setError(res.error);
      setAsk(null);
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
            onClick={() => setAsk("unpaid")}
            className={`${base} bg-white text-ink/80 shadow-sm ring-1 ring-black/10 hover:text-copper hover:ring-copper`}
          >
            <RotateCcw className="h-4 w-4" />
            Mark as unpaid
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setPaying(true)}
            className={`${base} bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-lg shadow-copper/35`}
          >
            <Wallet className="h-4 w-4" />
            Mark as paid
          </button>
        )}

        <button
          type="button"
          disabled={pending}
          onClick={() => (partner.is_active ? setAsk("off") : run(() => setPartnerActive(partner.id, true)))}
          className={`${base} ${
            partner.is_active
              ? "bg-white text-rose-700 shadow-sm ring-1 ring-rose-200 hover:bg-rose-50 hover:ring-rose-300"
              : "bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-600/30"
          }`}
        >
          <Power className="h-4 w-4" />
          {partner.is_active ? "Switch off account" : "Switch on account"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-rose-700">{error}</p>}

      {ask === "unpaid" && (
        <ConfirmDialog
          tone="warn"
          icon={RotateCcw}
          title="Mark as unpaid?"
          text={
            <>
              <b className="text-ink">{label}</b>&apos;s dashboard will lock until you mark the payment as paid again.
            </>
          }
          confirmText="Yes, mark unpaid"
          busy={pending}
          onConfirm={() => run(() => deactivatePartner(partner.id))}
          onCancel={() => setAsk(null)}
        />
      )}

      {ask === "off" && (
        <ConfirmDialog
          tone="danger"
          icon={Power}
          title="Switch off account?"
          text={
            <>
              <b className="text-ink">{label}</b> will not be able to log in until you switch the account back on.
            </>
          }
          confirmText="Yes, switch off"
          busy={pending}
          onConfirm={() => run(() => setPartnerActive(partner.id, false))}
          onCancel={() => setAsk(null)}
        />
      )}

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
