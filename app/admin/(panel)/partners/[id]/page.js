import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Cake,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Fingerprint,
  Gift,
  IdCard,
  Landmark,
  Layers,
  LogIn,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import AadhaarReveal from "@/components/admin/AadhaarReveal";
import BankReveal from "@/components/admin/BankReveal";
import PartnerControls from "@/components/admin/PartnerControls";
import TeamView from "@/components/admin/TeamView";
import { card } from "@/components/admin/ui";
import { AwardArt, BarsArt, OrgChartArt, PeopleArt } from "@/components/dashboard/StatArt";
import { getPartnerDetail } from "@/actions/admin/partners";
import { formatRupees } from "@/lib/partnerFee";
import { getPayment } from "@/lib/payment";

export const metadata = { title: "Partner" };

const day = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "";
const shortDay = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "";
const dayTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      })
    : "";
const ageOf = (dob) => {
  if (!dob) return "";
  const born = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) age--;
  return `${age} years`;
};
const initialsOf = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const statusOf = (p) => (p.is_active === false ? "off" : p.activated_at ? "paid" : "unpaid");
const STATUS = {
  paid: { text: "Paid", chip: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  unpaid: { text: "Unpaid", chip: "bg-amber-100 text-amber-800 ring-amber-200" },
  off: { text: "Off", chip: "bg-rose-100 text-rose-700 ring-rose-200" },
};

const th = "px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/55";

function Avatar({ url, name, className }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark font-bold text-white ${className}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}

function SectionHeader({ icon: Icon, title, note, right }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
          <Icon className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
          {note && <p className="mt-1 text-sm text-ink/55">{note}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

function Section({ icon, title, note, children }) {
  return (
    <section className={`${card} min-w-0`}>
      <SectionHeader icon={icon} title={title} note={note} />
      <ul className="mt-3 divide-y divide-black/5">{children}</ul>
    </section>
  );
}

// One line of a details card: icon, label, value.
function Row({ icon: Icon, label, children }) {
  return (
    <li className="flex items-center gap-3.5 py-3.5 sm:gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
        <span className="block text-sm text-ink/55 sm:w-36 sm:shrink-0">{label}</span>
        <span className="mt-0.5 block min-w-0 break-words text-[15px] font-bold text-ink sm:mt-0">
          {children || <span className="font-medium text-ink/45">Not added</span>}
        </span>
      </span>
    </li>
  );
}

// A step of the account journey: done, happening now, or still to come.
function Step({ state, icon: Icon, title, note }) {
  return (
    <div className="flex w-[84px] shrink-0 flex-col items-center text-center sm:w-44">
      <div className="relative">
        {state === "now" && <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/40" />}
        <span
          className={`relative flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16 ${
            state === "done"
              ? "bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-200"
              : state === "now"
                ? "bg-amber-50 text-amber-600 shadow-lg shadow-amber-400/30 ring-2 ring-amber-300"
                : "border-2 border-dashed border-black/15 bg-white text-ink/30"
          }`}
        >
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </span>
        {state === "done" && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow ring-2 ring-white">
            <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
          </span>
        )}
      </div>
      <p className={`mt-3.5 text-sm font-bold sm:text-base ${state === "next" ? "text-ink/45" : "text-ink"}`}>{title}</p>
      <p
        className={`mt-1.5 rounded-full px-2 py-1 text-[11px] font-medium sm:px-3 sm:text-[13px] ${
          state === "done"
            ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
            : state === "now"
              ? "bg-amber-50 text-amber-800 ring-1 ring-amber-100"
              : "bg-black/[0.04] text-ink/45"
        }`}
      >
        {note}
      </p>
    </div>
  );
}

// The line between two steps: full green, half way, or empty.
const Line = ({ fill }) => (
  <span
    className={`mt-7 h-1 min-w-2 flex-1 rounded-full sm:mt-8 ${
      fill === "full"
        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
        : fill === "half"
          ? "bg-gradient-to-r from-emerald-400 via-emerald-300 to-black/10"
          : "bg-black/10"
    }`}
  />
);

export default async function PartnerPage({ params }) {
  const { id } = await params;
  const detail = await getPartnerDetail(id);
  if (!detail) notFound();

  const { profile: p, referrer, team, signedUpAt, lastSignInAt } = detail;
  const pay = await getPayment();
  const feeText = pay.amountText;
  const paidText = formatRupees(p.activation_amount ?? pay.amount);
  const name = p.full_name || p.email;
  const address = [p.address_line, p.city, p.state, p.pincode].filter(Boolean).join(", ");
  const levels = team.reduce((max, n) => Math.max(max, n.level), 0);
  const direct = team.filter((n) => n.level === 1).length;
  const paidInTeam = team.filter((n) => statusOf(n) === "paid").length;
  const paid = !!p.activated_at;
  const joined = shortDay(signedUpAt ?? p.created_at);

  const stats = [
    {
      icon: Users,
      art: PeopleArt,
      label: "Referred directly",
      value: direct,
      note: "partners joined with this code",
      theme: { bg: "from-[#fdebdc] to-[#fff6ec]", ring: "ring-copper/10", chip: "bg-[#f9d6b8] text-copper", art: "text-copper" },
    },
    {
      icon: Layers,
      art: OrgChartArt,
      label: "Whole team",
      value: team.length,
      note: "everyone under this partner",
      theme: { bg: "from-[#ece4fb] to-[#f9f6ff]", ring: "ring-violet-300/30", chip: "bg-violet-200/80 text-violet-700", art: "text-violet-500" },
    },
    {
      icon: Check,
      art: BarsArt,
      label: "Paid in team",
      value: paidInTeam,
      note: "have paid the joining fee",
      theme: { bg: "from-[#dff5e8] to-[#f5fcf8]", ring: "ring-emerald-300/30", chip: "bg-emerald-200/80 text-emerald-700", art: "text-emerald-500" },
    },
    {
      icon: Layers,
      art: AwardArt,
      label: "Levels deep",
      value: levels,
      note: "how far the team goes",
      theme: { bg: "from-[#fff1cf] to-[#fffaf0]", ring: "ring-amber-300/30", chip: "bg-amber-200/80 text-amber-700", art: "text-amber-500" },
    },
  ];

  return (
    <div className="space-y-6">
      <a
        href="/admin/partners"
        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-copper shadow-sm ring-1 ring-black/10 transition hover:-translate-x-0.5 hover:ring-copper"
      >
        <ArrowLeft className="h-4 w-4" />
        All partners
      </a>

      {/* Banner: avatar, name, status, the controls and the referral code */}
      <div className="fade-up relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-[#fff7ec] to-[#fbeedd] shadow-[0_28px_60px_-30px_rgba(110,60,20,0.5)] ring-1 ring-black/5">
        <div
          className="pointer-events-none absolute right-0 top-0 hidden h-full w-[58%] lg:block"
          style={{
            maskImage: "linear-gradient(to right, transparent, #000 48%)",
            WebkitMaskImage: "linear-gradient(to right, transparent, #000 48%)",
          }}
          aria-hidden
        >
          <Image
            src="/images/villa.png"
            alt=""
            fill
            priority
            sizes="55vw"
            className="object-cover"
            style={{ objectPosition: "60% 40%", filter: "saturate(0.72) sepia(0.18) brightness(1.1) contrast(0.92)" }}
          />
          <div className="absolute inset-0 bg-[#fff3e3]/30" />
        </div>

        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
            <span className="relative shrink-0">
              <span className="absolute -inset-2.5 rounded-full bg-gradient-to-br from-copper-light/55 to-transparent blur-md" />
              <Avatar
                url={p.avatar_url}
                name={name}
                className="relative h-28 w-28 text-4xl shadow-xl ring-[6px] ring-white sm:h-32 sm:w-32 sm:text-5xl"
              />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] ring-1 ${
                    p.is_active
                      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                      : "bg-rose-50 text-rose-700 ring-rose-200"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${p.is_active ? "bg-emerald-500" : "bg-rose-500"}`} />
                  Account {p.is_active ? "on" : "off"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] ring-1 ${
                    paid
                      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                      : "bg-amber-50 text-amber-800 ring-amber-200"
                  }`}
                >
                  {paid ? <Check className="h-3 w-3" strokeWidth={3} /> : <Clock className="h-3 w-3" />}
                  {paid ? `Paid ${paidText}` : "Payment pending"}
                </span>
                {p.role === "admin" && (
                  <span className="rounded-full bg-copper/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-copper-dark ring-1 ring-copper/25">
                    Admin
                  </span>
                )}
              </div>

              <h1 className="mt-3 break-words font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
                {name}
              </h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink/60">
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-0.5 rounded-full bg-copper/40" />
                  Member since {joined}
                </span>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <Mail className="h-4 w-4 shrink-0 text-copper" />
                  <span className="break-all">{p.email}</span>
                </span>
                {p.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-copper" />
                    {p.phone}
                  </span>
                )}
              </p>

              <div className="mt-4">
                <PartnerControls
                  fee={pay.amount}
                  partner={{
                    id: p.id,
                    full_name: p.full_name,
                    email: p.email,
                    is_active: p.is_active,
                    activated_at: p.activated_at,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-black/5 backdrop-blur lg:w-[290px]">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/50">
              <Gift className="h-4 w-4 text-copper" />
              Referral code
            </p>
            <p className="mt-2 font-mono text-3xl font-extrabold tracking-wider text-copper-dark">
              {p.referral_code || "—"}
            </p>
            <p className="mt-2 border-t border-black/10 pt-2.5 text-xs text-ink/55">
              {referrer ? (
                <>
                  Joined through <b className="text-ink/75">{referrer.full_name || referrer.email}</b>
                </>
              ) : (
                "Joined directly, without a referral code."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Where the account stands */}
      {!p.is_active ? (
        <Reveal>
          <div className="rounded-3xl bg-rose-50 p-6 ring-1 ring-rose-500/25 sm:p-7">
            <p className="text-lg font-bold text-rose-900">This account is switched off</p>
            <p className="mt-1 text-sm text-rose-900/75">
              {name} cannot log in. Use the button at the top to switch it back on.
            </p>
          </div>
        </Reveal>
      ) : (
        <Reveal>
          <div className={`relative overflow-hidden ${card}`}>
            <div
              className={`pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl ${
                paid ? "bg-emerald-300/20" : "bg-amber-300/25"
              }`}
            />
            <div className="relative">
              <SectionHeader
                icon={UserRound}
                title="Account journey"
                note="How far this partner has come."
                right={
                  <span
                    className={`hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] ring-1 sm:inline-flex ${
                      paid
                        ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                        : "bg-amber-50 text-amber-800 ring-amber-200"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {paid ? "All 3 completed" : "1 of 3 done"}
                  </span>
                }
              />

              <div className="mt-8 flex items-start justify-center">
                <Step state="done" icon={UserPlus} title="Registered" note={joined} />
                <Line fill={paid ? "full" : "half"} />
                <Step
                  state={paid ? "done" : "now"}
                  icon={Wallet}
                  title={`${paid ? paidText : feeText} payment`}
                  note={paid ? "Received" : "Waiting"}
                />
                <Line fill={paid ? "full" : "none"} />
                <Step
                  state={paid ? "done" : "next"}
                  icon={BadgeCheck}
                  title="Account active"
                  note={paid ? shortDay(p.activated_at) : "After payment"}
                />
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* Numbers */}
      <Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ icon: Icon, art: Art, label, value, note, theme }) => (
            <div
              key={label}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} p-5 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.4)] ring-1 ${theme.ring} transition duration-300 hover:-translate-y-1`}
            >
              <Art
                className={`pointer-events-none absolute bottom-3 right-3 h-20 w-24 origin-bottom-right transition duration-500 group-hover:scale-110 ${theme.art}`}
              />
              <div className="relative flex items-center gap-4">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-sm ${theme.chip}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-sm font-medium text-ink/70">{label}</p>
                  <p className="mt-1 text-4xl font-extrabold tabular-nums text-ink">{value}</p>
                </div>
              </div>
              <p className="relative mt-3 max-w-[62%] text-xs text-ink/55">{note}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Details */}
      <Reveal>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section icon={UserRound} title="Personal details" note="Basic information and identity details.">
            <Row icon={UserRound} label="Full name">
              {p.full_name}
            </Row>
            <Row icon={UserRound} label="Father's name">
              {p.father_name}
            </Row>
            <Row icon={UserRound} label="Nominee's name">
              {p.nominee_name}
            </Row>
            <Row icon={Cake} label="Date of birth">
              {p.dob && `${day(p.dob)} (${ageOf(p.dob)})`}
            </Row>
            <Row icon={IdCard} label="Aadhaar number">
              {p.aadhaar_last4 ? <AadhaarReveal id={p.id} last4={p.aadhaar_last4} /> : ""}
            </Row>
            <Row icon={Mail} label="Email">
              {p.email}
            </Row>
            <Row icon={Phone} label="Mobile number">
              {p.phone}
            </Row>
          </Section>

          <Section icon={MapPin} title="Address" note="Where this partner lives.">
            <Row icon={MapPin} label="House no., street, area">
              {p.address_line}
            </Row>
            <Row icon={MapPin} label="City">
              {p.city}
            </Row>
            <Row icon={MapPin} label="State">
              {p.state}
            </Row>
            <Row icon={MapPin} label="Pincode">
              {p.pincode}
            </Row>
            {address && (
              <li className="py-3.5">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-copper shadow-sm ring-1 ring-black/10 transition hover:ring-copper"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Maps
                </a>
              </li>
            )}
          </Section>

          <Section
            icon={Landmark}
            title="Bank details"
            note={p.bank_updated_at ? `Added by the partner. Last saved ${day(p.bank_updated_at)}.` : "Where to pay this partner's points."}
          >
            <Row icon={UserRound} label="Account holder">
              {p.bank_holder}
            </Row>
            <Row icon={Landmark} label="Bank">
              {p.bank_name && `${p.bank_name}${p.bank_branch ? `, ${p.bank_branch}` : ""}`}
            </Row>
            <Row icon={IdCard} label="IFSC code">
              {p.bank_ifsc && <span className="font-mono tracking-wider">{p.bank_ifsc}</span>}
            </Row>
            <Row icon={Wallet} label="Account number">
              {p.bank_account_last4 ? <BankReveal id={p.id} last4={p.bank_account_last4} /> : ""}
            </Row>
            <Row icon={Mail} label="UPI id">
              {p.upi_id}
            </Row>
          </Section>

          <Section icon={Wallet} title="Payment and account" note="Joining payment and sign-in history.">
            <Row icon={Wallet} label="Joining payment">
              {paid ? (
                <span className="inline-flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                    Paid {paidText}
                  </span>
                  {day(p.activated_at)}
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
                  Not paid yet ({feeText})
                </span>
              )}
            </Row>
            <Row icon={ShieldCheck} label="Payment note">
              {paid ? p.activation_note : ""}
            </Row>
            <Row icon={ShieldCheck} label="Account">
              {p.is_active ? "Switched on" : "Switched off (cannot log in)"}
            </Row>
            <Row icon={CalendarDays} label="Signed up">
              {dayTime(signedUpAt)}
            </Row>
            <Row icon={LogIn} label="Last login">
              {lastSignInAt ? dayTime(lastSignInAt) : "Never logged in"}
            </Row>
            <Row icon={Fingerprint} label="User ID">
              <span className="break-all font-mono text-xs font-normal text-ink/70">{p.id}</span>
            </Row>
          </Section>

          <Section icon={Gift} title="Referral" note="Code, who referred them and their team.">
            <Row icon={Gift} label="Referral code">
              {p.referral_code && (
                <span className="rounded-full bg-[#f6ecdf] px-3 py-1 font-mono text-[13px] font-semibold text-ink/75 ring-1 ring-copper/10">
                  {p.referral_code}
                </span>
              )}
            </Row>
            <Row icon={UserCheck} label="Referred by">
              {referrer ? (
                <a
                  href={`/admin/partners/${referrer.id}`}
                  className="inline-flex flex-wrap items-center gap-3 transition hover:text-copper"
                >
                  <Avatar url={referrer.avatar_url} name={referrer.full_name || referrer.email} className="h-9 w-9 text-xs" />
                  <span className="leading-tight">
                    {referrer.full_name || referrer.email}
                    <span className="ml-2 rounded-full bg-[#f6ecdf] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-copper-dark">
                      {referrer.referral_code}
                    </span>
                  </span>
                </a>
              ) : (
                <span className="font-medium text-ink/60">No one, joined directly</span>
              )}
            </Row>
            <Row icon={Users} label="People referred">
              {`${direct} directly, ${team.length} in the whole team`}
            </Row>
          </Section>
        </div>
      </Reveal>

      {/* Team */}
      <Reveal>
        <section className="overflow-hidden rounded-3xl bg-white shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5">
          <div className="flex items-center justify-between gap-4 border-b border-black/5 bg-gradient-to-b from-white to-[#fcf6ee] px-6 py-5 sm:px-7">
            <h2 className="font-display text-2xl font-bold text-ink">
              Team under <span className="text-copper">{p.full_name?.split(" ")[0] || "this partner"}</span>
            </h2>
            <span className="rounded-full bg-copper/10 px-3.5 py-1.5 text-sm font-bold text-copper-dark ring-1 ring-copper/20">
              {team.length}
            </span>
          </div>

          {team.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-ink/55">Nobody has joined under this partner yet.</p>
          ) : (
            <TeamView
              team={team}
              rootId={p.id}
              list={
            <>
              {/* Phones: one card per partner, so nothing needs to scroll sideways */}
              <ul className="divide-y divide-black/5 md:hidden">
                {team.map((m) => {
                  const st = STATUS[statusOf(m)];
                  const place = [m.city, m.state].filter(Boolean).join(", ");
                  return (
                    <li key={m.id}>
                      <a href={`/admin/partners/${m.id}`} className="flex items-start gap-3.5 px-5 py-4 transition active:bg-[#fffaf3]">
                        <Avatar
                          url={m.avatar_url}
                          name={m.full_name || m.email}
                          className="h-12 w-12 text-base shadow-md shadow-copper/30 ring-2 ring-white"
                        />
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block [overflow-wrap:anywhere] text-[15px] font-bold text-ink">{m.full_name || "—"}</span>
                          <span className="mt-1 block [overflow-wrap:anywhere] text-[13px] text-ink/55">{m.email}</span>
                          {(m.phone || place) && (
                            <span className="mt-0.5 block [overflow-wrap:anywhere] text-[13px] text-ink/55">
                              {[m.phone, place].filter(Boolean).join(" · ")}
                            </span>
                          )}
                          <span className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${st.chip}`}>{st.text}</span>
                            <span className="rounded-full bg-copper/10 px-2.5 py-1 text-[11px] font-bold text-copper-dark ring-1 ring-copper/15">
                              Level {m.level}
                            </span>
                            <span className="rounded-full bg-[#f6ecdf] px-2.5 py-1 font-mono text-[11px] font-semibold text-ink/75 ring-1 ring-copper/10">
                              {m.referral_code}
                            </span>
                            <span className="text-[11px] text-ink/50">{shortDay(m.created_at)}</span>
                          </span>
                        </span>
                        <ChevronRight className="mt-3 h-5 w-5 shrink-0 text-copper/70" />
                      </a>
                    </li>
                  );
                })}
              </ul>

            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-black/5">
                  <th className={`${th} pl-6 sm:pl-7`}>Partner</th>
                  <th className={th}>Level</th>
                  <th className={th}>Code</th>
                  <th className={`${th} hidden xl:table-cell`}>Place</th>
                  <th className={th}>Joined</th>
                  <th className={`${th} pr-6 sm:pr-7`}>Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {team.map((m) => {
                  const st = STATUS[statusOf(m)];
                  const place = [m.city, m.state].filter(Boolean).join(", ");
                  return (
                    <tr key={m.id} className="transition hover:bg-[#fffaf3]">
                      <td className="py-4 pl-6 pr-3 sm:pl-7">
                        <a href={`/admin/partners/${m.id}`} className="flex items-center gap-3 transition hover:text-copper">
                          <Avatar
                            url={m.avatar_url}
                            name={m.full_name || m.email}
                            className="h-12 w-12 text-base shadow-md shadow-copper/30 ring-2 ring-white"
                          />
                          <span className="min-w-0 max-w-[230px] leading-tight">
                            <span className="block [overflow-wrap:anywhere] text-[15px] font-bold text-ink">{m.full_name || "—"}</span>
                            <span className="mt-1 block [overflow-wrap:anywhere] text-[13px] text-ink/55">
                              {[m.email, m.phone].filter(Boolean).join(" · ")}
                            </span>
                            {place && (
                              <span className="mt-0.5 block [overflow-wrap:anywhere] text-[13px] text-ink/55 xl:hidden">{place}</span>
                            )}
                          </span>
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span className="rounded-full bg-copper/10 px-3 py-1 text-xs font-bold text-copper-dark ring-1 ring-copper/15">
                          Level {m.level}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span className="rounded-full bg-[#f6ecdf] px-3 py-1.5 font-mono text-[13px] font-semibold text-ink/75 ring-1 ring-copper/10">
                          {m.referral_code}
                        </span>
                      </td>
                      <td className="hidden px-3 py-4 text-sm text-ink/80 xl:table-cell">{place || "—"}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-ink/80">{shortDay(m.created_at)}</td>
                      <td className="py-4 pl-3 pr-6 sm:pr-7">
                        <span className={`rounded-full px-3.5 py-1.5 text-xs font-bold ring-1 ${st.chip}`}>{st.text}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </>
              }
            />
          )}
        </section>
      </Reveal>
    </div>
  );
}
