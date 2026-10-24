import Image from "next/image";
import {
  BadgeCheck,
  Cake,
  Check,
  CheckCircle2,
  ChevronRight,
  IdCard,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UserPlus,
  UserRound,
  Wallet,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import AvatarEditor from "@/components/dashboard/AvatarEditor";
import ProfileActions, { ProfileOpenButton } from "@/components/dashboard/ProfileActions";
import { HeroCodeCard, ReferralStrip } from "@/components/dashboard/ReferralBits";
import { getCurrentPartner, getNetwork, initials } from "@/lib/profile";
import { referralLink } from "@/lib/referral";
import { maskAadhaar } from "@/lib/aadhaar";
import { getPayment } from "@/lib/payment";

export const metadata = { title: "My Profile | Bhoomidar" };

const card =
  "rounded-3xl bg-white p-5 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7";

const editBtn =
  "inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink/80 shadow-sm ring-1 ring-black/10 transition hover:text-copper hover:ring-copper";

// One line of a details card: icon, label, value, and what you can do about it.
function InfoRow({ icon: Icon, label, children, action }) {
  return (
    <li className="flex items-center gap-3.5 py-3.5 sm:gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
        <span className="block text-sm text-ink/55 sm:w-36 sm:shrink-0">{label}</span>
        <span className="mt-0.5 block min-w-0 break-words text-[15px] font-bold text-ink sm:mt-0">{children}</span>
      </span>
      {action}
    </li>
  );
}

// "Add >" in copper; opens the edit window, or goes to the page you give it.
function AddLink({ href, children = "Add" }) {
  const cls =
    "inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-copper transition hover:text-copper-dark";
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
        <ChevronRight className="h-4 w-4" />
      </a>
    );
  }
  return (
    <ProfileOpenButton what="edit" className={cls}>
      {children}
      <ChevronRight className="h-4 w-4" />
    </ProfileOpenButton>
  );
}

const Verified = () => (
  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
    Verified
  </span>
);

function SectionHeader({ icon: Icon, title, note, right }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
          <Icon className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-ink/55">{note}</p>
        </div>
      </div>
      {right}
    </div>
  );
}

// A step of the account journey: done, happening now, or still to come.
function Step({ state, icon: Icon, title, note }) {
  return (
    <div className="flex w-24 shrink-0 flex-col items-center text-center sm:w-44">
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
        className={`mt-1.5 rounded-full px-3 py-1 text-xs font-medium sm:text-[13px] ${
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

// The line between two steps: full green, half way (the next step is happening), or empty.
const Line = ({ fill }) => (
  <span
    className={`mt-7 h-1 min-w-4 flex-1 rounded-full sm:mt-8 ${
      fill === "full"
        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
        : fill === "half"
          ? "bg-gradient-to-r from-emerald-400 via-emerald-300 to-black/10"
          : "bg-black/10"
    }`}
  />
);

export default async function ProfilePage() {
  const partner = await getCurrentPartner();
  const { referrer, referrals } = await getNetwork(partner.user.id, partner.referredBy);
  const ACTIVATION_FEE_TEXT = (await getPayment()).amountText;

  const status = !partner.active
    ? { text: "Inactive", dot: "bg-rose-500", pill: "bg-rose-50 text-rose-700 ring-rose-200" }
    : partner.pending
      ? { text: "Waiting for activation", dot: "bg-amber-500", pill: "bg-amber-50 text-amber-800 ring-amber-200" }
      : { text: "Active partner", dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-800 ring-emerald-200" };

  const canShowCode = partner.referralCode && !partner.pending && partner.active;
  const link = canShowCode ? await referralLink(partner.referralCode) : "";

  const monthOf = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).slice(0, 7);
  const thisMonth = monthOf(new Date());
  const joinedThisMonth = partner.pending
    ? null
    : referrals.filter((p) => p.joinedAt && monthOf(p.joinedAt) === thisMonth).length;

  const emailVerified = !!partner.user.email_confirmed_at;

  return (
    <div className="space-y-6">
      {/* Banner: avatar, name, the two buttons and the referral code */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-[#fff7ec] to-[#fbeedd] shadow-[0_28px_60px_-30px_rgba(110,60,20,0.5)] ring-1 ring-black/5">
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
              <AvatarEditor url={partner.avatarUrl} initials={initials(partner.name)} overlap={false} />
              <div className="min-w-0">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] ring-1 ${status.pill}`}
                >
                  <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                  {status.text}
                </span>
                <h1 className="mt-3 break-words font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
                  {partner.name}
                </h1>
                <p className="mt-1.5 flex items-center gap-2 text-sm text-ink/60">
                  <span className="h-4 w-0.5 rounded-full bg-copper/40" />
                  Member since {partner.joined}
                </p>
                <div className="mt-4">
                  <ProfileActions
                    initial={{
                      phone: partner.phone,
                      father_name: partner.fatherName,
                      nominee_name: partner.nomineeName,
                      ...partner.addressParts,
                    }}
                  />
                </div>
              </div>
            </div>

            {canShowCode ? (
              <HeroCodeCard code={partner.referralCode} link={link} />
            ) : (
              <div className="inline-flex items-center gap-3 rounded-2xl bg-white/90 px-5 py-4 text-sm text-ink/65 shadow-md ring-1 ring-black/5 lg:w-[290px]">
                <Lock className="h-5 w-5 shrink-0 text-copper" />
                Your referral code appears after activation
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Where the account stands */}
      {!partner.active ? (
        <Reveal>
          <div className="rounded-3xl bg-rose-50 p-6 ring-1 ring-rose-500/25 sm:p-7">
            <p className="text-lg font-bold text-rose-900">Your account is switched off</p>
            <p className="mt-1 text-sm text-rose-900/75">Please contact us to get it switched on again.</p>
          </div>
        </Reveal>
      ) : (
        <Reveal>
          <div className={`relative overflow-hidden ${card}`}>
            <div
              className={`pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl ${
                partner.pending ? "bg-amber-300/25" : "bg-emerald-300/20"
              }`}
            />

            <div className="relative">
              <SectionHeader
                icon={UserRound}
                title="Your journey"
                note="Track your progress as a Bhoomidar partner."
                right={
                  <span
                    className={`hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] ring-1 sm:inline-flex ${
                      partner.pending
                        ? "bg-amber-50 text-amber-800 ring-amber-200"
                        : "bg-emerald-50 text-emerald-800 ring-emerald-200"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {partner.pending ? "1 of 3 done" : "All 3 completed"}
                  </span>
                }
              />

              <div className="mt-8 flex items-start justify-center">
                <Step state="done" icon={UserPlus} title="Registered" note={partner.joined} />
                <Line fill={partner.pending ? "half" : "full"} />
                <Step
                  state={partner.pending ? "now" : "done"}
                  icon={Wallet}
                  title={`${ACTIVATION_FEE_TEXT} payment`}
                  note={partner.pending ? "Waiting" : "Received"}
                />
                <Line fill={partner.pending ? "none" : "full"} />
                <Step
                  state={partner.pending ? "next" : "done"}
                  icon={BadgeCheck}
                  title="Account active"
                  note={partner.activatedOn || "After payment"}
                />
              </div>

              {partner.pending && (
                <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-500/25 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-relaxed text-amber-900/85">
                    Your account starts working after the joining payment of <b>{ACTIVATION_FEE_TEXT}</b> is received and
                    our team activates it.
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5"
                  >
                    Contact us to pay
                  </a>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* Details */}
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <section className={card}>
            <SectionHeader
              icon={UserRound}
              title="Personal details"
              note="Your basic information and identity details."
              right={
                <ProfileOpenButton what="edit" className={editBtn}>
                  <Pencil className="h-4 w-4 text-copper" />
                  Edit
                </ProfileOpenButton>
              }
            />
            <ul className="mt-3 divide-y divide-black/5">
              <InfoRow icon={UserRound} label="Full name">
                {partner.name}
              </InfoRow>
              <InfoRow
                icon={UserRound}
                label="Father's name"
                action={!partner.fatherName && <AddLink />}
              >
                {partner.fatherName || <span className="font-medium text-ink/45">Not added</span>}
              </InfoRow>
              <InfoRow
                icon={UserRound}
                label="Nominee's name"
                action={!partner.nomineeName && <AddLink />}
              >
                {partner.nomineeName || <span className="font-medium text-ink/45">Not added</span>}
              </InfoRow>
              <InfoRow
                icon={Cake}
                label="Date of birth"
                action={!partner.dob && <AddLink href="/contact" />}
              >
                {partner.dob || <span className="font-medium text-ink/45">Not added</span>}
              </InfoRow>
              <InfoRow
                icon={IdCard}
                label="Aadhaar number"
                action={<AddLink href="/contact">Add / Update</AddLink>}
              >
                <span className="flex flex-wrap items-center gap-2.5">
                  <span className="tracking-wider">{maskAadhaar(partner.aadhaarLast4)}</span>
                  {partner.aadhaarLast4 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                      <ShieldCheck className="h-3 w-3" />
                      Encrypted
                    </span>
                  )}
                </span>
              </InfoRow>
            </ul>
            <p className="mt-3 flex items-start gap-2.5 rounded-xl bg-[#fbf7f0] px-3.5 py-3 text-xs text-ink/55 ring-1 ring-black/5">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-copper" />
              <span>
                Name, date of birth and Aadhaar can be changed only by our team.{" "}
                <a href="/contact" className="font-semibold text-copper hover:text-copper-dark">
                  Contact us
                </a>
              </span>
            </p>
          </section>

          <section className={card}>
            <SectionHeader
              icon={Mail}
              title="Contact and address"
              note="Your contact information and address."
              right={
                <ProfileOpenButton what="edit" className={editBtn}>
                  <Pencil className="h-4 w-4 text-copper" />
                  Edit
                </ProfileOpenButton>
              }
            />
            <ul className="mt-3 divide-y divide-black/5">
              <InfoRow icon={Mail} label="Email" action={emailVerified && <Verified />}>
                {partner.email}
              </InfoRow>
              <InfoRow icon={Phone} label="Mobile number" action={!partner.phone && <AddLink />}>
                {partner.phone || <span className="font-medium text-ink/45">Not added</span>}
              </InfoRow>
              <InfoRow icon={MapPin} label="Address" action={!partner.address && <AddLink />}>
                {partner.address || <span className="font-medium text-ink/45">Not added</span>}
              </InfoRow>
            </ul>
          </section>
        </div>
      </Reveal>

      {/* Referral */}
      <Reveal>
        <ReferralStrip
          code={partner.referralCode}
          link={link}
          locked={!canShowCode}
          referredCount={partner.pending ? 0 : referrals.length}
          joinedThisMonth={joinedThisMonth}
          referredBy={referrer ? referrer.name : "Direct signup"}
        />
      </Reveal>
    </div>
  );
}
