import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Cake,
  CalendarDays,
  Check,
  Clock,
  ExternalLink,
  Fingerprint,
  Gift,
  IdCard,
  Layers,
  LogIn,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import AadhaarReveal from "@/components/admin/AadhaarReveal";
import PartnerControls from "@/components/admin/PartnerControls";
import { card } from "@/components/admin/ui";
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
  paid: { text: "Paid", chip: "bg-emerald-100 text-emerald-800" },
  unpaid: { text: "Unpaid", chip: "bg-amber-100 text-amber-800" },
  off: { text: "Off", chip: "bg-rose-100 text-rose-700" },
};

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

function Section({ icon: Icon, title, children }) {
  return (
    <section className={`${card} !p-6 sm:!p-7`}>
      <h2 className="flex items-center gap-3 font-display text-xl font-bold text-ink">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        {title}
      </h2>
      <dl className="mt-4 divide-y divide-black/5">{children}</dl>
    </section>
  );
}

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-ink/55">{label}</dt>
        <dd className="mt-1 break-words text-[15px] font-semibold text-ink">
          {children || <span className="font-normal text-ink/40">Not added</span>}
        </dd>
      </div>
    </div>
  );
}

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

  return (
    <div className="space-y-8">
      <a
        href="/admin/partners"
        className="inline-flex items-center gap-2 text-sm font-semibold text-copper transition hover:text-copper-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        All partners
      </a>

      {/* Hero */}
      <div className="fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a2019] via-[#1d1712] to-night p-7 text-white shadow-xl sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-copper/35 blur-3xl" />

        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-5 sm:gap-6">
            <Avatar
              url={p.avatar_url}
              name={name}
              className="h-24 w-24 text-3xl shadow-xl ring-4 ring-white/10 sm:h-28 sm:w-28 sm:text-4xl"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
                    p.is_active ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${p.is_active ? "bg-emerald-400" : "bg-rose-400"}`} />
                  Account {p.is_active ? "on" : "off"}
                </span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
                    paid ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"
                  }`}
                >
                  {paid ? <Check className="h-3 w-3" strokeWidth={3} /> : <Clock className="h-3 w-3" />}
                  {paid ? `Paid ${paidText}` : "Payment pending"}
                </span>
                {p.role === "admin" && (
                  <span className="rounded-full bg-copper/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-copper-light">
                    Admin
                  </span>
                )}
              </div>
              <h1 className="mt-3 break-words font-display text-3xl font-bold leading-tight sm:text-5xl">
                {name}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {p.email}
                </span>
                {p.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {p.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <Gift className="h-4 w-4" />
                  {p.referral_code}
                </span>
              </p>
            </div>
          </div>

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

      {/* Numbers */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: Users, label: "Referred directly", value: direct },
          { icon: Layers, label: "Whole team", value: team.length },
          { icon: Check, label: "Paid in team", value: paidInTeam },
          { icon: Layers, label: "Levels deep", value: levels },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className={`${card} flex items-center gap-4 !p-5`}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2a1f] to-[#17110c] text-copper-light ring-4 ring-copper-light/20">
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div className="leading-tight">
              <p className="font-sans text-3xl font-extrabold tabular-nums text-ink">{value}</p>
              <p className="mt-1 text-sm text-ink/55">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section icon={UserRound} title="Personal details">
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

        <Section icon={MapPin} title="Address">
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
            <div className="py-3.5">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-copper transition hover:text-copper-dark"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Google Maps
              </a>
            </div>
          )}
        </Section>

        <Section icon={Wallet} title="Payment and account">
          <Row icon={Wallet} label="Joining payment">
            {paid ? (
              <span className="inline-flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                  Paid {paidText}
                </span>
                {day(p.activated_at)}
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
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

        <Section icon={Gift} title="Referral">
          <Row icon={Gift} label="Referral code">
            <span className="font-mono">{p.referral_code}</span>
          </Row>
          <Row icon={UserCheck} label="Referred by">
            {referrer ? (
              <a
                href={`/admin/partners/${referrer.id}`}
                className="inline-flex items-center gap-3 transition hover:text-copper"
              >
                <Avatar url={referrer.avatar_url} name={referrer.full_name || referrer.email} className="h-9 w-9 text-xs" />
                <span className="leading-tight">
                  {referrer.full_name || referrer.email}
                  <span className="ml-2 rounded-full bg-copper/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-copper-dark">
                    {referrer.referral_code}
                  </span>
                </span>
              </a>
            ) : (
              <span className="font-normal text-ink/60">No one, joined directly</span>
            )}
          </Row>
          <Row icon={Users} label="People referred">
            {`${direct} directly, ${team.length} in the whole team`}
          </Row>
        </Section>
      </div>

      {/* Team */}
      <section className={`${card} !p-0 overflow-hidden`}>
        <div className="flex items-center justify-between gap-4 border-b border-black/5 px-6 py-5 sm:px-8">
          <h2 className="flex items-center gap-3 font-display text-xl font-bold text-ink">
            <Layers className="h-5 w-5 text-copper" />
            Team under {p.full_name?.split(" ")[0] || "this partner"}
          </h2>
          <span className="rounded-full bg-copper/10 px-3 py-1 text-sm font-bold text-copper-dark">
            {team.length}
          </span>
        </div>

        {team.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-ink/55">Nobody has joined under this partner yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wider text-ink/50">
                  <th className="px-6 py-3.5 font-semibold sm:px-8">Partner</th>
                  <th className="px-4 py-3.5 font-semibold">Level</th>
                  <th className="px-4 py-3.5 font-semibold">Code</th>
                  <th className="px-4 py-3.5 font-semibold">Place</th>
                  <th className="px-4 py-3.5 font-semibold">Joined</th>
                  <th className="px-6 py-3.5 font-semibold sm:px-8">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {team.map((m) => {
                  const st = STATUS[statusOf(m)];
                  return (
                    <tr key={m.id} className="transition hover:bg-[#fbf7f0]">
                      <td className="px-6 py-3.5 sm:px-8">
                        <a href={`/admin/partners/${m.id}`} className="flex items-center gap-3 hover:text-copper">
                          <Avatar url={m.avatar_url} name={m.full_name || m.email} className="h-10 w-10 text-sm" />
                          <span className="min-w-0 leading-tight">
                            <span className="block font-semibold text-ink">{m.full_name || "—"}</span>
                            <span className="block truncate text-xs text-ink/55">
                              {[m.email, m.phone].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                        </a>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-ink/75">Level {m.level}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-sm text-ink/75">
                        {m.referral_code}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-ink/75">
                        {[m.city, m.state].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-ink/75">
                        {new Date(m.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-3.5 sm:px-8">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${st.chip}`}>
                          {st.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
