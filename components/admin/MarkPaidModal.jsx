"use client";

import { useState, useTransition } from "react";
import { activatePartner } from "@/actions/admin/partners";
import { formatRupees } from "@/lib/partnerFee";
import Modal from "./Modal";
import { btnGhost, btnPrimary, inputCls, labelCls } from "./ui";

const PAY_MODES = ["Cash", "UPI", "Bank transfer", "Other"];

// The admin confirms the joining payment was received. This marks it as paid
// and switches the partner's account on in one step.
export default function MarkPaidModal({ partner, fee, onClose, onDone }) {
  const ACTIVATION_FEE_TEXT = formatRupees(fee);
  const [mode, setMode] = useState("UPI");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState(String(fee ?? ""));
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const submit = (e) => {
    e.preventDefault();
    start(async () => {
      const note = reference.trim() ? `${mode} · ${reference.trim()}` : mode;
      const res = await activatePartner(partner.id, note, amount);
      if (!res.success) return setError(res.error);
      onDone();
    });
  };

  return (
    <Modal title="Mark payment as paid" onClose={onClose}>
      <form onSubmit={submit} className="space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#fbf7f0] p-5 ring-1 ring-black/5">
          <div className="min-w-0 leading-tight">
            <p className="truncate font-semibold text-ink">{partner.full_name || partner.email}</p>
            <p className="mt-1 truncate text-sm text-ink/55">{partner.email}</p>
          </div>
          <div className="shrink-0 text-right leading-tight">
            <p className="text-xs text-ink/55">Joining payment</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-copper">{ACTIVATION_FEE_TEXT}</p>
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="payment-amount">
            Amount received (₹)
          </label>
          <input
            id="payment-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            placeholder={String(fee ?? "")}
            className={inputCls}
          />
          <p className="mt-1.5 text-xs text-ink/50">
            Change it if the partner paid a different amount. It is saved with the partner.
          </p>
        </div>

        <div>
          <p className={labelCls}>How was it paid?</p>
          <div className="flex flex-wrap gap-2">
            {PAY_MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === m
                    ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                    : "bg-white text-ink/70 ring-1 ring-black/10 hover:ring-copper"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="payment-ref">
            Reference or note (optional)
          </label>
          <input
            id="payment-ref"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            maxLength={150}
            placeholder="UPI transaction ID, receipt number..."
            className={inputCls}
          />
        </div>

        <p className="text-xs text-ink/55">
          The partner's account is activated right away. You can mark it unpaid again at any time.
        </p>
        {error && <p className="text-sm text-rose-700">{error}</p>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={pending} className={btnPrimary}>
            {pending ? "Saving..." : `Mark ${Number(amount) > 0 ? formatRupees(Number(amount)) : ACTIVATION_FEE_TEXT} as paid`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
