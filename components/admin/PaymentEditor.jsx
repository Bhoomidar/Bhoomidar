"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Headset,
  Landmark,
  Mail,
  PhoneCall,
  Smartphone,
  Wallet,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { formatRupees, ACTIVATION_FEE } from "@/lib/partnerFee";
import { PAYMENT_TABS } from "@/lib/siteContent";
import { CoinPileArt } from "@/components/dashboard/StatArt";
import SettingsEditor from "./SettingsEditor";

const text = (v) => String(v ?? "").trim();

// The same working-out the partner's dashboard does (lib/payment.js), but on
// the values being typed, before they are saved.
function read(form) {
  const amount = Math.round(Number(text(form.pay_amount).replace(/[^0-9.]/g, ""))) || ACTIVATION_FEE;
  const bank = {
    holder: text(form.pay_bank_holder),
    name: text(form.pay_bank_name),
    account: text(form.pay_bank_account),
    ifsc: text(form.pay_bank_ifsc),
    branch: text(form.pay_bank_branch),
  };
  return {
    amount,
    amountText: formatRupees(amount),
    note: text(form.pay_note),
    upi: text(form.pay_upi_id),
    bank,
    hasBank: !!(bank.account || bank.ifsc || bank.name || bank.holder),
    contact: {
      name: text(form.pay_contact_name),
      phone: text(form.pay_contact_phone || form.contact_phone),
      whatsapp: text(form.pay_contact_whatsapp || form.pay_contact_phone || form.contact_phone),
      email: text(form.pay_contact_email || form.contact_email),
      hours: text(form.pay_contact_hours),
    },
  };
}

function Tile({ icon: Icon, label, ok, detail }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.4)] ring-1 ${
        ok ? "from-[#dff5e8] to-[#f5fcf8] ring-emerald-300/30" : "from-[#fff1cf] to-[#fffaf0] ring-amber-300/30"
      }`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-sm ${
            ok ? "bg-emerald-200/80 text-emerald-700" : "bg-amber-200/80 text-amber-700"
          }`}
        >
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-medium text-ink/70">{label}</p>
          <p
            className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
              ok ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : "bg-amber-100 text-amber-800 ring-amber-200"
            }`}
          >
            {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            {ok ? "Ready" : "Not added"}
          </p>
        </div>
      </div>
      <p className="mt-3 truncate text-xs text-ink/55">{detail}</p>
    </div>
  );
}

function Line({ label, value }) {
  return (
    <div className="rounded-xl bg-white/15 px-3.5 py-2.5 ring-1 ring-white/15">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">{label}</p>
      <p className="mt-0.5 break-all text-sm font-bold">{value}</p>
    </div>
  );
}

// What the partner will see, built from what is typed in the form.
function Preview({ form }) {
  const pay = read(form);
  const { bank, contact } = pay;
  const hasContact = contact.phone || contact.whatsapp || contact.email;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <Eye className="h-5 w-5 text-copper" />
          What partners <span className="text-copper">see</span>
        </p>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-200">
          Live
        </span>
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-copper-light via-copper to-copper-dark p-6 text-white shadow-[0_30px_60px_-24px_rgba(140,72,33,0.7)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/25 blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
              <Clock className="h-4 w-4" />
              Joining payment
            </p>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/30">
              One time
            </span>
          </div>
          <p className="mt-3 font-sans text-6xl font-extrabold tabular-nums tracking-tight drop-shadow-sm">
            {pay.amountText}
          </p>
          {pay.note && <p className="mt-3 text-sm leading-relaxed text-white/85">{pay.note}</p>}

          <div className="mt-5 space-y-3 rounded-2xl bg-black/15 p-4 ring-1 ring-white/15">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">Pay to</p>

            {pay.upi || pay.hasBank ? (
              <>
                {pay.upi && (
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-xs font-bold text-white/90">
                      <Smartphone className="h-4 w-4" />
                      UPI
                    </p>
                    <Line label="UPI ID" value={pay.upi} />
                  </div>
                )}
                {pay.upi && pay.hasBank && <div className="border-t border-dashed border-white/30" />}
                {pay.hasBank && (
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-xs font-bold text-white/90">
                      <Landmark className="h-4 w-4" />
                      Bank transfer
                    </p>
                    {bank.holder && <Line label="Account holder" value={bank.holder} />}
                    {bank.name && <Line label="Bank" value={bank.name} />}
                    {bank.account && <Line label="Account number" value={bank.account} />}
                    {bank.ifsc && <Line label="IFSC code" value={bank.ifsc} />}
                    {bank.branch && <Line label="Branch" value={bank.branch} />}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm leading-relaxed text-white/85">
                Please contact our team. They will share the payment details with you.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-5 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30">
            <Headset className="h-5 w-5" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="font-display text-xl font-bold text-ink">
              Talk to <span className="text-copper">our team</span>
            </p>
            <p className="mt-1 text-xs text-ink/60">
              {contact.name ? (
                <>
                  <b className="text-ink">{contact.name}</b> will help you with the payment.
                </>
              ) : (
                "We will help you with the payment."
              )}
            </p>
          </div>
        </div>

        {contact.hours && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink/70 ring-1 ring-black/10">
            <Clock className="h-3.5 w-3.5 text-copper" />
            {contact.hours}
          </p>
        )}

        {hasContact ? (
          <ul className="mt-4 space-y-2">
            {contact.phone && (
              <li className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-black/5">
                <PhoneCall className="h-4 w-4 shrink-0 text-copper" />
                <span className="truncate text-sm font-bold text-ink">{contact.phone}</span>
              </li>
            )}
            {contact.whatsapp && (
              <li className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#2bd96b] to-[#128c4a] px-3.5 py-2.5 text-white">
                <FaWhatsapp className="h-4 w-4 shrink-0" />
                <span className="text-sm font-bold">WhatsApp · Chat now</span>
              </li>
            )}
            {contact.email && (
              <li className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-black/5">
                <Mail className="h-4 w-4 shrink-0 text-copper" />
                <span className="truncate text-sm font-bold text-ink">{contact.email}</span>
              </li>
            )}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-copper ring-1 ring-black/5">
            Contact us (link to the Contact page)
          </p>
        )}
      </section>

      <p className="px-1 text-xs text-ink/50">
        This is a preview of the payment box on a new partner&apos;s dashboard. It updates as you type; partners see it
        only after you press Save.
      </p>
    </div>
  );
}

export default function PaymentEditor({ initial }) {
  return (
    <SettingsEditor
      tabs={PAYMENT_TABS}
      initial={initial}
      nav="tabs"
      top={(form) => {
        const pay = read(form);
        const { contact } = pay;
        return (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fdebdc] to-[#fff6ec] p-5 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.4)] ring-1 ring-copper/10">
              <CoinPileArt className="pointer-events-none absolute bottom-2 right-3 h-20 w-28 origin-bottom-right transition duration-500 group-hover:scale-110" />
              <div className="relative flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f9d6b8] text-copper shadow-sm">
                  <Wallet className="h-6 w-6" />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-sm font-medium text-ink/70">Joining payment</p>
                  <p className="mt-1 text-3xl font-extrabold tabular-nums text-ink">{pay.amountText}</p>
                </div>
              </div>
              <p className="relative mt-3 max-w-[60%] text-xs text-ink/55">what a new partner pays</p>
            </div>

            <Tile icon={Smartphone} label="UPI" ok={!!pay.upi} detail={pay.upi || "Partners will be asked to contact you"} />
            <Tile
              icon={Landmark}
              label="Bank account"
              ok={pay.hasBank && !!pay.bank.account && !!pay.bank.ifsc}
              detail={
                pay.hasBank
                  ? [pay.bank.name, pay.bank.account && `A/c ${pay.bank.account}`].filter(Boolean).join(" · ") || "Details incomplete"
                  : "No bank details shown"
              }
            />
            <Tile
              icon={Headset}
              label="Team contact"
              ok={!!(contact.phone || contact.email)}
              detail={[contact.name, contact.phone, contact.email].filter(Boolean).join(" · ") || "No phone or email set"}
            />
          </div>
        );
      }}
      aside={(form) => <Preview form={form} />}
    />
  );
}
