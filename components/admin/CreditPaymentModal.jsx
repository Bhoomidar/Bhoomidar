"use client";

import { useState, useTransition } from "react";
import { Banknote, Check, Ellipsis, Info, Landmark, Smartphone, Wallet } from "lucide-react";
import { receiveCreditPayment } from "@/actions/admin/partners";
import { formatRupees } from "@/lib/partnerFee";
import Modal from "./Modal";
import { btnGhost, btnPrimary, inputCls, labelCls } from "./ui";

const PAY_MODES = [
  { name: "Cash", icon: Banknote },
  { name: "UPI", icon: Smartphone },
  { name: "Bank transfer", icon: Landmark },
  { name: "Other", icon: Ellipsis },
];

// The admin took a payment from a partner who is on credit: all of what is left, or a part of it.
// What the partner earns also pays the credit off, so a part payment now leaves the rest to be covered by earnings.
export default function CreditPaymentModal({ partner, onClose, onDone }) {
  const owed = Math.round(Number(partner.credit_owed ?? partner.credit_amount ?? 0));
  const [amount, setAmount] = useState(String(owed));
  const [mode, setMode] = useState("Cash");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const name = partner.full_name || partner.email;
  const typed = Math.round(Number(amount) || 0);
  const bad = typed <= 0 || typed > owed;
  const rest = Math.max(0, owed - typed);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const note = reference.trim() ? `${mode} · ${reference.trim()}` : mode;
      const res = await receiveCreditPayment(partner.id, amount, note);
      if (!res.success) return setError(res.error);
      onDone();
    });
  };

  return (
    <Modal compact fullOnPhone title="Receive payment" subtitle="The partner is paying back the credit" icon={Wallet} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3.5">
        <div className="rounded-2xl bg-[#fbf7f0] px-4 py-3 ring-1 ring-black/5">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1 leading-tight">
              <p className="[overflow-wrap:anywhere] text-[15px] font-bold text-ink">{name}</p>
              <p className="mt-0.5 text-[13px] text-ink/55">Still on credit</p>
            </div>
            <span className="shrink-0 text-xl font-extrabold tabular-nums text-rose-700">{formatRupees(owed)}</span>
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="credit-pay-amount">
            Amount received now
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-copper">₹</span>
            <input
              id="credit-pay-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              className={`${inputCls} !py-2.5 !pl-9 text-base font-bold tabular-nums`}
            />
          </div>
          <p className={`mt-2 text-[13px] font-semibold ${bad ? "text-rose-700" : "text-ink/65"}`}>
            {typed > owed
              ? `This is more than what is due (${formatRupees(owed)}).`
              : typed <= 0
                ? "Enter the amount in rupees."
                : rest > 0
                  ? `${formatRupees(rest)} stays on credit. What the partner earns pays it off, or you can take another payment.`
                  : "This clears the whole credit."}
          </p>
        </div>

        <div>
          <p className={labelCls}>How was it paid?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PAY_MODES.map(({ name: m, icon: Icon }) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  mode === m
                    ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                    : "bg-white text-ink/70 ring-1 ring-black/10 hover:ring-copper"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="credit-pay-ref">
            Reference or note <span className="font-normal text-ink/45">(optional)</span>
          </label>
          <input
            id="credit-pay-ref"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            maxLength={150}
            placeholder="UPI transaction ID, receipt no."
            className={`${inputCls} !py-2.5`}
          />
        </div>

        <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-[13px] leading-snug text-emerald-900 ring-1 ring-emerald-600/15">
          {rest > 0 ? <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} />}
          <span>
            {rest > 0
              ? "The balance of the partner goes up by this amount. The referrer's bonus is given when the whole credit is cleared."
              : "The balance of the partner goes back to zero, and the referrer's bonus is given."}
          </span>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2.5 max-sm:sticky max-sm:bottom-0 max-sm:-mx-5 max-sm:border-t max-sm:border-black/10 max-sm:bg-[#fffaf3]/95 max-sm:px-5 max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] max-sm:pt-3 max-sm:backdrop-blur sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={`${btnGhost} sm:min-w-28`}>
            Cancel
          </button>
          <button type="submit" disabled={pending || bad} className={`${btnPrimary} py-2.5 sm:min-w-56`}>
            {pending ? "Saving..." : `Receive ${formatRupees(typed > 0 ? typed : 0)}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
