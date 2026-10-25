import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  Gift,
  Headset,
  Landmark,
  Lock,
  Mail,
  Network,
  PhoneCall,
  Smartphone,
  UserPlus,
  Wallet,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import CopyField from "@/components/dashboard/CopyField";
import { getPayment } from "@/lib/payment";
import { phoneHref } from "@/lib/siteContent";

const locked = [
  { icon: Gift, title: "Referral code and link", text: "Invite people and grow your team" },
  { icon: Network, title: "Your network", text: "See everyone who joins under you" },
  { icon: Wallet, title: "Commission", text: "Track your sales and earnings" },
];

// Shown instead of the dashboard content until the admin activates the account.
// How much to pay, where to pay and who to call all come from the admin
// (Admin > Payment Details), so they can be changed at any time.
export default async function PendingNotice({ name = "", email = "" }) {
  const pay = await getPayment();
  const { contact, bank } = pay;

  const steps = [
    { icon: UserPlus, title: "You registered", note: "Done", state: "done" },
    { icon: Wallet, title: `Pay the joining fee of ${pay.amountText}`, note: "Use the details on the right", state: "now" },
    { icon: BadgeCheck, title: "Your account is activated", note: "Our team does it as soon as the payment is received", state: "next" },
  ];

  // "I have paid" opens WhatsApp with the message already written.
  const paidMessage = encodeURIComponent(
    `Hello, I am ${name || "a new partner"}${email ? ` (${email})` : ""}. I have paid the joining fee of ${pay.amountText}. Please activate my account.`,
  );
  const paidHref = contact.whatsapp ? `https://wa.me/${contact.whatsapp}?text=${paidMessage}` : "/contact";
  const hasPayDetails = pay.upi || pay.hasBank;
  const hasContact = contact.phone || contact.whatsapp || contact.email;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left: what to do, and who to talk to */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <section className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-9">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-300/25 blur-3xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-amber-800 ring-1 ring-amber-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                One step left
              </span>

              <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
                Your account is <span className="text-copper">almost ready</span>
              </h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-ink/65">
                Your registration is complete. Your partner account starts working after the
                joining payment is received and our team activates it.
              </p>

              <div className="mt-7 rounded-2xl bg-[#fbf7f0] p-4 ring-1 ring-black/5">
                <div className="flex items-center justify-between text-xs font-semibold text-ink/60">
                  <span>Activation progress</span>
                  <span className="text-copper">1 of 3 done</span>
                </div>
                <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-black/10">
                  <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-400 to-amber-400" />
                </div>
              </div>

              <ol className="mt-8 space-y-0">
                {steps.map(({ icon: Icon, title, note, state }, i) => (
                  <li key={title} className="relative flex gap-4 pb-7 last:pb-0">
                    {i < steps.length - 1 && (
                      <span
                        className={`absolute left-[23px] top-12 h-[calc(100%-2.5rem)] w-0.5 ${
                          state === "done" ? "bg-emerald-400" : "bg-black/10"
                        }`}
                      />
                    )}
                    <span className="relative">
                      {state === "now" && (
                        <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/40" />
                      )}
                      <span
                        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                          state === "done"
                            ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/40"
                            : state === "now"
                              ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-lg shadow-amber-400/50"
                              : "border-2 border-dashed border-black/15 bg-white text-ink/30"
                        }`}
                      >
                        {state === "done" ? <Check className="h-5 w-5" strokeWidth={3} /> : <Icon className="h-5 w-5" />}
                      </span>
                    </span>
                    <div className="pt-1.5">
                      <p className={`text-base font-bold ${state === "next" ? "text-ink/50" : "text-ink"}`}>{title}</p>
                      <p className="mt-0.5 text-sm text-ink/55">{note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Who to talk to */}
          <section className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-copper-light/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-[#25D366]/10 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30">
                    <Headset className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 leading-tight">
                    <h3 className="font-display text-2xl font-bold text-ink">
                      Talk to <span className="text-copper">our team</span>
                    </h3>
                    <p className="mt-1 text-sm text-ink/60">
                      {contact.name ? <b className="text-ink">{contact.name}</b> : "We will help you with the payment."}
                      {contact.name && " will help you with the payment."}
                    </p>
                  </div>
                </div>

                {contact.hours && (
                  <span className="inline-flex w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#fbf7f0] px-3.5 py-1.5 text-xs font-semibold text-ink/70 ring-1 ring-black/5">
                    <Clock className="h-3.5 w-3.5 text-copper" />
                    {contact.hours}
                  </span>
                )}
              </div>

              {hasContact ? (
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {contact.phone && (
                    <a
                      href={phoneHref(contact.phone)}
                      className="group flex items-center gap-3.5 rounded-2xl bg-[#fbf7f0] p-4 ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:ring-copper/30"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30 transition group-hover:scale-110">
                        <PhoneCall className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink/50">Call us</span>
                        <span className="mt-1 block text-base font-bold text-ink">{contact.phone}</span>
                      </span>
                    </a>
                  )}
                  {contact.whatsapp && (
                    <a
                      href={`https://wa.me/${contact.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3.5 rounded-2xl bg-gradient-to-br from-[#2bd96b] to-[#128c4a] p-4 shadow-lg shadow-[#25D366]/25 ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#25D366]/40"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#25D366] shadow-md transition group-hover:scale-110">
                        <FaWhatsapp className="h-6 w-6" />
                      </span>
                      <span className="min-w-0 leading-tight text-white">
                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/85">WhatsApp</span>
                        <span className="mt-1 flex items-center gap-1.5 text-base font-bold">
                          Chat now
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </span>
                      </span>
                    </a>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="group flex items-center gap-3.5 rounded-2xl bg-[#fbf7f0] p-4 ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:ring-copper/30 sm:col-span-2"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2a1f] to-[#17110c] text-copper-light shadow-lg transition group-hover:scale-110">
                        <Mail className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink/50">Email us</span>
                        <span className="mt-1 block break-all text-base font-bold text-ink">{contact.email}</span>
                      </span>
                    </a>
                  )}
                </div>
              ) : (
                <a
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5"
                >
                  <PhoneCall className="h-4 w-4" />
                  Contact us
                </a>
              )}
            </div>
          </section>
        </div>

        {/* Right: the payment */}
        <section className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-copper-light via-copper to-copper-dark p-6 text-white shadow-[0_30px_60px_-24px_rgba(140,72,33,0.7)] sm:p-9 lg:col-span-2">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/25 blur-3xl" />

          <div className="relative flex flex-1 flex-col">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
                <Clock className="h-4 w-4" />
                Joining payment
              </p>
              <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/30">
                One time
              </span>
            </div>
            <p className="mt-4 font-sans text-6xl font-extrabold tabular-nums tracking-tight drop-shadow-sm sm:text-7xl">
              {pay.amountText}
            </p>
            {pay.note && <p className="mt-3 text-sm leading-relaxed text-white/85">{pay.note}</p>}

            {/* Where to pay */}
            <div className="mt-6 space-y-4 rounded-2xl bg-black/15 p-5 ring-1 ring-white/15">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">Pay to</p>

              {hasPayDetails ? (
                <>
                  {pay.upi && (
                    <div>
                      <p className="mb-2.5 flex items-center gap-2 text-xs font-bold text-white/90">
                        <Smartphone className="h-4 w-4" />
                        UPI
                      </p>
                      <CopyField label="UPI ID" value={pay.upi} />
                    </div>
                  )}
                  {pay.upi && pay.hasBank && <div className="border-t border-dashed border-white/30" />}
                  {pay.hasBank && (
                    <div>
                      <p className="mb-3 flex items-center gap-2 text-xs font-bold text-white/90">
                        <Landmark className="h-4 w-4" />
                        Bank transfer
                      </p>
                      <div className="space-y-3.5">
                        {bank.holder && <CopyField label="Account holder" value={bank.holder} />}
                        {bank.name && <CopyField label="Bank" value={bank.name} />}
                        {bank.account && <CopyField label="Account number" value={bank.account} />}
                        {bank.ifsc && <CopyField label="IFSC code" value={bank.ifsc} />}
                        {bank.branch && <CopyField label="Branch" value={bank.branch} />}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm leading-relaxed text-white/85">
                  Please contact our team. They will share the payment details with you.
                </p>
              )}
            </div>

            <div className="mt-6 border-t-2 border-dashed border-white/35 pt-6 lg:mt-auto">
              <a
                href={paidHref}
                target={contact.whatsapp ? "_blank" : undefined}
                rel={contact.whatsapp ? "noopener noreferrer" : undefined}
                className="group btn-shimmer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-base font-bold text-copper-dark shadow-lg transition hover:-translate-y-0.5"
              >
                {contact.whatsapp ? (
                  <FaWhatsapp className="h-6 w-6 text-[#25D366]" />
                ) : (
                  <Check className="h-5 w-5" strokeWidth={3} />
                )}
                I have paid
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </a>
              <p className="mt-3 text-center text-xs text-white/80">
                {contact.whatsapp
                  ? "This opens WhatsApp. Our team will check and activate you."
                  : "Tell our team once you have paid."}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* What opens up */}
      <section>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="font-display text-2xl font-bold text-ink">
            Unlocked after <span className="text-copper">activation</span>
          </h3>
          <p className="text-sm text-ink/55">Pay the joining fee and all of this opens up.</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {locked.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-[#f8efe2] p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.5)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-26px_rgba(110,60,20,0.6)] hover:ring-copper/30"
            >
              <span className="pointer-events-none absolute right-5 top-4 select-none text-6xl font-extrabold leading-none text-copper/[0.08]">
                0{i + 1}
              </span>

              <div className="relative">
                <span className="relative inline-flex">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30">
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-night text-copper-light shadow-md ring-2 ring-white">
                    <Lock className="h-3 w-3" strokeWidth={2.4} />
                  </span>
                </span>

                <p className="mt-5 text-lg font-bold text-ink">{title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{text}</p>

                <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
                  <Clock className="h-3.5 w-3.5" />
                  Opens after activation
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
