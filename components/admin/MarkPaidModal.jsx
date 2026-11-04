"use client";

import { useState, useTransition } from "react";
import { Banknote, Check, Clock, Ellipsis, Info, Landmark, Smartphone, Wallet } from "lucide-react";
import { activatePartner, activatePartnerOnCredit } from "@/actions/admin/partners";
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
  const [credit, setCredit] = useState(false); // activate now, the joining amount is paid later
  const [mode, setMode] = useState("UPI");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState(String(fee ?? ""));
  const [deposit, setDeposit] = useState(""); // credit: what the partner pays now (empty = nothing)
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const name = partner.full_name || partner.email;
  const typed = Number(amount);
  const differs = typed > 0 && Number(fee) > 0 && typed !== Number(fee);
  // credit: the part paid now, and what stays on credit
  const paidNow = Math.max(0, Math.round(Number(deposit) || 0));
  const left = Number(fee) - paidNow;
  const depositBad = paidNow >= Number(fee) && Number(fee) > 0;

  const submit = (e) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const note = reference.trim() ? `${mode} · ${reference.trim()}` : mode;
      // with a deposit, the note says how it was paid
      const creditNote = paidNow > 0 ? note : reference.trim();
      const res = credit ? await activatePartnerOnCredit(partner.id, creditNote, deposit) : await activatePartner(partner.id, note, amount);
      if (!res.success) return setError(res.error);
      onDone();
    });
  };

  return (
    <Modal compact fullOnPhone title="Mark payment as paid" subtitle="Confirm that the joining fee has been received" icon={Wallet} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3.5">
        {/* Who is being activated, and what the fee is */}
        <div className="rounded-2xl bg-[#fbf7f0] px-4 py-3 ring-1 ring-black/5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-base font-bold text-white shadow-md">
              {partner.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partner.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (name || "?")[0].toUpperCase()
              )}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="[overflow-wrap:anywhere] text-[15px] font-bold text-ink">{name}</p>
              <p className="mt-0.5 text-[13px] text-ink/55">
                <span className="block [overflow-wrap:anywhere] sm:inline">{partner.email}</span>
                {partner.phone && (
                  <>
                    <span className="hidden sm:inline"> · </span>
                    <span className="block sm:inline">{partner.phone}</span>
                  </>
                )}
              </p>
            </div>
            <span className="shrink-0 text-right text-[11px] font-semibold uppercase tracking-wide text-ink/50">
              Joining fee
              <b className="block text-xl font-extrabold normal-case tabular-nums tracking-normal text-copper">{ACTIVATION_FEE_TEXT}</b>
            </span>
          </div>
          <div className="mt-2.5 border-t border-black/10 pt-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
              <Clock className="h-3.5 w-3.5" />
              Payment pending{partner.created_at ? ` · joined ${joinedOn(partner.created_at)}` : ""}
            </span>
          </div>
        </div>

        {/* Paid now, or activate on credit */}
        <div role="tablist" aria-label="Payment" className="flex gap-1.5 rounded-xl bg-[#f4ece0] p-1">
          {[
            [false, "Payment received"],
            [true, "Activate on credit"],
          ].map(([value, text]) => (
            <button
              key={text}
              type="button"
              role="tab"
              aria-selected={credit === value}
              onClick={() => setCredit(value)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition ${
                credit === value ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30" : "text-ink/65 hover:text-copper-dark"
              }`}
            >
              {text}
            </button>
          ))}
        </div>

        {credit && (
          <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[13px] leading-snug text-rose-900 ring-1 ring-rose-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <span>
              The account is activated now, but its balance starts at <b>−{formatRupees(left > 0 ? left : 0)}</b>. Everything the partner earns fills this up first.
              Until the balance is back to zero there is no Partnership bonus, no payout, and the referrer&apos;s bonus waits.
            </span>
          </div>
        )}

        {/* Credit: how much the partner deposits now */}
        {credit && (
          <div>
            <label className={labelCls} htmlFor="credit-deposit">
              Deposit now <span className="font-normal text-ink/45">(optional, leave empty if nothing is paid)</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-copper">₹</span>
              <input
                id="credit-deposit"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="0"
                className={`${inputCls} !py-2.5 !pl-9 text-base font-bold tabular-nums`}
              />
            </div>
            <p className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-semibold ${depositBad ? "text-rose-700" : "text-ink/65"}`}>
              {depositBad ? (
                <span>The deposit must be less than {ACTIVATION_FEE_TEXT}. For the full amount use Payment received.</span>
              ) : (
                <>
                  <span>Joining amount {ACTIVATION_FEE_TEXT}</span>
                  <span>− deposit {formatRupees(paidNow)}</span>
                  <span className="text-rose-700">= credit {formatRupees(left)}</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Amount and reference side by side */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div hidden={credit}>
            <label className={labelCls} htmlFor="payment-amount">
              Amount received
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-copper">₹</span>
              <input
                id="payment-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder={String(fee ?? "")}
                className={`${inputCls} !py-2.5 !pl-9 text-base font-bold tabular-nums`}
              />
            </div>
          </div>
          <div className={credit ? "sm:col-span-2" : ""}>
            <label className={labelCls} htmlFor="payment-ref">
              Reference or note <span className="font-normal text-ink/45">(optional)</span>
            </label>
            <input
              id="payment-ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              maxLength={150}
              placeholder="UPI transaction ID, receipt no."
              className={`${inputCls} !py-2.5`}
            />
          </div>
        </div>
        {differs && !credit && (
          <p className="flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 ring-1 ring-amber-200">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            This is different from the joining fee of {ACTIVATION_FEE_TEXT}. The amount you enter is saved with the partner.
          </p>
        )}

        {/* How it was paid */}
        <div hidden={credit && !(paidNow > 0)}>
          <p className={labelCls}>{credit ? "How was the deposit paid?" : "How was it paid?"}</p>
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

        {/* What happens next */}
        <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-[13px] leading-snug text-emerald-900 ring-1 ring-emerald-600/15">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} />
          <span>
            {credit
              ? "The account is activated right away and the referral code starts working. You can mark the credit as paid later."
              : "The account is activated right away and the referral code starts working. You can mark it unpaid again at any time."}
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
          <button type="submit" disabled={pending || (credit && depositBad)} className={`${btnPrimary} py-2.5 sm:min-w-56`}>
            {pending ? "Saving..." : credit ? `Activate on credit (−${formatRupees(left > 0 ? left : 0)})` : `Mark ${typed > 0 ? formatRupees(typed) : ACTIVATION_FEE_TEXT} as paid`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
