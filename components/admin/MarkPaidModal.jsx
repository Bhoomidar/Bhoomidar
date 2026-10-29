"use client";

import { useState, useTransition } from "react";
import { Banknote, Check, Clock, Ellipsis, Info, Landmark, Smartphone, Wallet } from "lucide-react";
import { activatePartner } from "@/actions/admin/partners";
import { formatRupees } from "@/lib/partnerFee";
import Modal from "./Modal";
import { btnGhost, btnPrimary, inputCls, labelCls } from "./ui";

const PAY_MODES = [
  { name: "Cash", icon: Banknote },
  { name: "UPI", icon: Smartphone },
  { name: "Bank transfer", icon: Landmark },
  { name: "Other", icon: Ellipsis },
];

const joinedOn = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })
    : "";

// The admin confirms the joining payment was received. This marks it as paid
// and switches the partner's account on in one step.
export default function MarkPaidModal({ partner, fee, onClose, onDone }) {
  const ACTIVATION_FEE_TEXT = formatRupees(fee);
  const [mode, setMode] = useState("UPI");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState(String(fee ?? ""));
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const name = partner.full_name || partner.email;
  const typed = Number(amount);
  const differs = typed > 0 && Number(fee) > 0 && typed !== Number(fee);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const note = reference.trim() ? `${mode} · ${reference.trim()}` : mode;
      const res = await activatePartner(partner.id, note, amount);
      if (!res.success) return setError(res.error);
      onDone();
    });
  };

  return (
    <Modal title="Mark payment as paid" subtitle="Confirm that the joining fee has been received" icon={Wallet} onClose={onClose}>
      <form onSubmit={submit} className="space-y-6">
        {/* Who is being activated, and what the fee is */}
        <div className="rounded-2xl bg-[#fbf7f0] p-4 ring-1 ring-black/5 sm:p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-base font-bold text-white shadow-md">
              {partner.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partner.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (name || "?")[0].toUpperCase()
              )}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="[overflow-wrap:anywhere] text-base font-bold text-ink">{name}</p>
              <p className="mt-1 [overflow-wrap:anywhere] text-sm text-ink/55">{partner.email}</p>
              {partner.phone && <p className="mt-0.5 text-sm text-ink/55">{partner.phone}</p>}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-black/10 pt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
              <Clock className="h-3.5 w-3.5" />
              Payment pending{partner.created_at ? ` · joined ${joinedOn(partner.created_at)}` : ""}
            </span>
            <span className="text-sm text-ink/60">
              Joining fee <b className="ml-1 text-xl font-extrabold tabular-nums text-copper">{ACTIVATION_FEE_TEXT}</b>
            </span>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className={labelCls} htmlFor="payment-amount">
            Amount received
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-copper">₹</span>
            <input
              id="payment-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              placeholder={String(fee ?? "")}
              className={`${inputCls} !py-3.5 !pl-10 text-lg font-bold tabular-nums`}
            />
          </div>
          {differs ? (
            <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 ring-1 ring-amber-200">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              This is different from the joining fee of {ACTIVATION_FEE_TEXT}. The amount you enter is saved with the partner.
            </p>
          ) : (
            <p className="mt-2 text-xs text-ink/50">The joining fee is filled in. Change it only if the partner paid a different amount.</p>
          )}
        </div>

        {/* How it was paid */}
        <div>
          <p className={labelCls}>How was it paid?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PAY_MODES.map(({ name: m, icon: Icon }) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
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

        {/* Reference */}
        <div>
          <label className={labelCls} htmlFor="payment-ref">
            Reference or note <span className="font-normal text-ink/45">(optional)</span>
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

        {/* What happens next */}
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-snug text-emerald-900 ring-1 ring-emerald-600/15">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} />
          <span>
            The account is activated right away and the partner&apos;s referral code starts working. You can mark it unpaid
            again at any time.
          </span>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={`${btnGhost} sm:min-w-28`}>
            Cancel
          </button>
          <button type="submit" disabled={pending} className={`${btnPrimary} py-3 sm:min-w-56`}>
            {pending ? "Saving..." : `Mark ${typed > 0 ? formatRupees(typed) : ACTIVATION_FEE_TEXT} as paid`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
