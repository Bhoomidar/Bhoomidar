import { CalendarDays, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import Reveal from "@/components/Reveal";
import { getCurrentPartner, initials } from "@/lib/profile";

export const metadata = { title: "My Profile | Bhoomidar" };

export default async function ProfilePage() {
  const partner = await getCurrentPartner();

  const details = [
    { icon: UserRound, label: "Full name", value: partner.name },
    { icon: Mail, label: "Email", value: partner.email },
    { icon: Phone, label: "Phone", value: partner.phone || "Not added" },
    { icon: CalendarDays, label: "Member since", value: partner.joined },
    {
      icon: ShieldCheck,
      label: "Account status",
      value: partner.active ? "Active" : "Inactive",
    },
  ];

  return (
    <div>
      <div className="fade-up">
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
          <span className="h-px w-8 bg-copper" />
          My Account
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
          My <span className="text-copper">Profile</span>
        </h1>
      </div>

      <Reveal className="mt-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_24px_50px_-24px_rgba(110,60,20,0.4)] ring-1 ring-black/5">
          <div className="relative bg-gradient-to-br from-[#2a2019] to-night px-7 py-8 sm:px-10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-copper/30 blur-3xl" />
            <div className="relative flex items-center gap-5">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark font-display text-3xl font-bold text-white shadow-lg ring-4 ring-white/10">
                {initials(partner.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-2xl font-bold text-white sm:text-3xl">
                  {partner.name}
                </p>
                <p className="mt-1 text-sm text-white/65">Bhoomidar Partner</p>
              </div>
            </div>
          </div>

          <ul className="grid gap-x-10 divide-y divide-black/5 p-7 sm:grid-cols-2 sm:divide-y-0 sm:p-10">
            {details.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center gap-4 py-4 sm:py-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-xs text-ink/55">{label}</span>
                  <span className="mt-1 block truncate text-base font-bold text-ink">
                    {value}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}
