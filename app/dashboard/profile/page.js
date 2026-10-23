import {
  ArrowRight,
  BadgeCheck,
  Cake,
  Check,
  Clock,
  Gift,
  IdCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import AvatarEditor from "@/components/dashboard/AvatarEditor";
import CopyChip from "@/components/dashboard/CopyChip";
import ProfileActions from "@/components/dashboard/ProfileActions";
import { getCurrentPartner, getNetwork, initials } from "@/lib/profile";
import { maskAadhaar } from "@/lib/aadhaar";
import { getPayment } from "@/lib/payment";

export const metadata = { title: "My Profile | Bhoomidar" };

// One labelled value with a round icon.
function Row({ icon: Icon, label, children }) {
  return (
    <li className="flex items-start gap-4 py-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-sm text-ink/55">{label}</span>
        <span className="mt-1.5 block break-words text-lg font-bold text-ink">{children}</span>
      </span>
    </li>
  );
}

function Card({ icon: Icon, title, children }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-28px_rgba(110,60,20,0.55)] sm:p-8">
      <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-ink">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
          <Icon className="h-5 w-5" />
        </span>
        {title}
      </h2>
      <ul className="mt-3 divide-y divide-black/5">{children}</ul>
    </section>
  );
}

// A step of the account journey: done, happening now, or still to come.
function Step({ state, icon: Icon, title, note }) {
  return (
    <div className="flex w-24 shrink-0 flex-col items-center text-center sm:w-44">
      <div className="relative">
        {state === "now" && (
          <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/40" />
        )}
        <span
          className={`relative flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16 ${
            state === "done"
              ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/40"
              : state === "now"
                ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-lg shadow-amber-400/50"
                : "border-2 border-dashed border-black/15 bg-white text-ink/30"
          }`}
        >
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </span>
        {state === "done" && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-600 shadow ring-2 ring-emerald-100">
            <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
          </span>
        )}
      </div>
      <p className={`mt-4 text-sm font-bold sm:text-base ${state === "next" ? "text-ink/45" : "text-ink"}`}>
        {title}
      </p>
      <p
        className={`mt-1.5 rounded-full px-3 py-1 text-xs font-medium sm:text-[13px] ${
          state === "done"
            ? "bg-emerald-50 text-emerald-800"
            : state === "now"
              ? "bg-amber-50 text-amber-800"
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
    className={`mt-7 h-1.5 min-w-4 flex-1 rounded-full sm:mt-8 ${
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
    ? { text: "Inactive", dot: "bg-rose-400", pill: "bg-rose-50 text-rose-700 ring-rose-200" }
    : partner.pending
      ? { text: "Waiting for activation", dot: "bg-amber-400", pill: "bg-amber-50 text-amber-800 ring-amber-200" }
      : { text: "Active partner", dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-800 ring-emerald-200" };

  const canShowCode = partner.referralCode && !partner.pending && partner.active;

  return (
    <div className="space-y-8">
      <div className="fade-up">
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
          <span className="h-px w-8 bg-copper" />
          My Account
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
          My <span className="text-copper">Profile</span>
        </h1>
      </div>

      {/* Cover, avatar and name */}
      <Reveal>
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-30px_rgba(110,60,20,0.5)] ring-1 ring-black/5">
          <div className="relative h-36 bg-gradient-to-br from-[#2a2019] via-[#1d1712] to-night sm:h-44">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-copper/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-copper-light/20 blur-3xl" />
          </div>

          <div className="relative px-6 pb-8 sm:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                <AvatarEditor url={partner.avatarUrl} initials={initials(partner.name)} />
                <div className="min-w-0 pb-1">
                  <h2 className="break-words font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
                    {partner.name}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ring-1 ${status.pill}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                      {status.text}
                    </span>
                    <span className="text-sm text-ink/60">Member since {partner.joined}</span>
                  </div>
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
                <CopyChip value={partner.referralCode} label="Your referral code" />
              ) : (
                <div className="inline-flex items-center gap-3 rounded-2xl bg-[#fbf7f0] px-5 py-4 text-sm text-ink/65 ring-1 ring-black/5">
                  <Lock className="h-5 w-5 shrink-0 text-copper" />
                  Your referral code appears after activation
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Where the account stands */}
      {!partner.active ? (
        <Reveal>
          <div className="rounded-3xl bg-rose-50 p-6 ring-1 ring-rose-500/25 sm:p-7">
            <p className="text-lg font-bold text-rose-900">Your account is switched off</p>
            <p className="mt-1 text-sm text-rose-900/75">
              Please contact us to get it switched on again.
            </p>
          </div>
        </Reveal>
      ) : (
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-8">
            <div
              className={`pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl ${
                partner.pending ? "bg-amber-300/25" : "bg-emerald-300/25"
              }`}
            />

            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-ink">Your journey</h2>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.1em] ring-1 ${
                  partner.pending
                    ? "bg-amber-50 text-amber-800 ring-amber-200"
                    : "bg-emerald-50 text-emerald-800 ring-emerald-200"
                }`}
              >
                {partner.pending ? "1 of 3 done" : "All 3 done"}
              </span>
            </div>

            <div className="relative mt-8 flex items-start justify-center">
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

            {partner.pending ? (
              <div className="relative mt-8 flex flex-col gap-4 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-500/25 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-relaxed text-amber-900/85">
                  Your account starts working after the joining payment of{" "}
                  <b>{ACTIVATION_FEE_TEXT}</b> is received and our team activates it.
                </p>
                <a
                  href="/contact"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5"
                >
                  Contact us to pay
                </a>
              </div>
            ) : (
              <div className="relative mt-8 flex flex-col gap-4 rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-500/20 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-start gap-3 text-sm leading-relaxed text-emerald-900/85">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  You are an active Bhoomidar partner. Share your referral code and start building
                  your network.
                </p>
                <a
                  href="/dashboard/network"
                  className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:-translate-y-0.5"
                >
                  My network
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </a>
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* Details */}
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card icon={UserRound} title="Personal details">
            <Row icon={UserRound} label="Full name">
              {partner.name}
            </Row>
            <Row icon={UserRound} label="Father's name">
              {partner.fatherName || "Not added"}
            </Row>
            <Row icon={UserRound} label="Nominee's name">
              {partner.nomineeName || "Not added"}
            </Row>
            <Row icon={Cake} label="Date of birth">
              {partner.dob || "Not added"}
            </Row>
            <Row icon={IdCard} label="Aadhaar number">
              <span className="flex flex-wrap items-center gap-3">
                <span className="tracking-wider">{maskAadhaar(partner.aadhaarLast4)}</span>
                {partner.aadhaarLast4 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Stored encrypted
                  </span>
                )}
              </span>
            </Row>
            <li className="flex items-start gap-3 py-4 text-sm text-ink/55">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
              <span>
                Name, date of birth and Aadhaar can be changed only by our team.{" "}
                <a href="/contact" className="font-semibold text-copper hover:text-copper-dark">
                  Contact us
                </a>
              </span>
            </li>
          </Card>

          <Card icon={Mail} title="Contact and address">
            <Row icon={Mail} label="Email">
              {partner.email}
            </Row>
            <Row icon={Phone} label="Mobile number">
              {partner.phone || "Not added"}
            </Row>
            <Row icon={MapPin} label="Address">
              {partner.address || "Not added"}
            </Row>
          </Card>

          <div className="lg:col-span-2">
            <Card icon={Gift} title="Referral">
              <div className="grid sm:grid-cols-3 sm:divide-x sm:divide-black/5">
                <ul className="sm:pr-6">
                  <Row icon={Gift} label="Your referral code">
                    {canShowCode ? partner.referralCode : "After activation"}
                  </Row>
                </ul>
                <ul className="sm:px-6">
                  <Row icon={UserCheck} label="Referred by">
                    {referrer ? (
                      <>
                        {referrer.name}{" "}
                        <span className="ml-1 rounded-full bg-copper/10 px-2.5 py-0.5 align-middle text-xs font-semibold text-copper-dark">
                          {referrer.code}
                        </span>
                      </>
                    ) : (
                      "No one, joined directly"
                    )}
                  </Row>
                </ul>
                <ul className="sm:pl-6">
                  <Row icon={Users} label="People you referred">
                    {partner.pending ? "—" : referrals.length}
                  </Row>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
