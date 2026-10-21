import { ArrowRight, Building2, Handshake, PhoneCall, Wallet } from "lucide-react";
import Reveal from "@/components/Reveal";
import { getCurrentPartner, initials } from "@/lib/profile";

const quickActions = [
  {
    icon: Building2,
    title: "Browse Properties",
    text: "See the land and property you can share with buyers.",
    href: "/properties",
  },
  {
    icon: Handshake,
    title: "Partner Program",
    text: "Read how commission and rewards work.",
    href: "/opportunities",
  },
  {
    icon: PhoneCall,
    title: "Talk to Us",
    text: "Have a question? Our team will help you.",
    href: "/contact",
  },
];

export default async function DashboardOverview() {
  const partner = await getCurrentPartner();

  return (
    <div className="space-y-8">
      <div className="fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a2019] to-night p-7 text-white shadow-xl sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-copper/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-copper-light/15 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark font-display text-2xl font-bold text-white shadow-lg ring-4 ring-white/10 sm:h-20 sm:w-20 sm:text-3xl">
              {initials(partner.name)}
            </span>
            <div>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] ${
                  partner.active
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-rose-400/15 text-rose-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    partner.active ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                />
                {partner.active ? "Active partner" : "Inactive"}
              </span>
              <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                Hello, <span className="text-copper-light">{partner.firstName}</span>
              </h1>
              <p className="mt-1 text-sm text-white/70">
                Welcome to your Bhoomidar partner account.
              </p>
            </div>
          </div>

          <a
            href="/properties"
            className="group inline-flex w-fit items-center gap-3 rounded-lg bg-gradient-to-b from-copper-light to-copper-dark px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:-translate-y-0.5"
          >
            Browse Properties
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      <Reveal>
        <h2 className="font-display text-2xl font-bold text-ink">
          Quick <span className="text-copper">actions</span>
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {quickActions.map(({ icon: Icon, title, text, href }) => (
            <a
              key={title}
              href={href}
              className="group flex flex-col rounded-2xl bg-white p-5 shadow-[0_18px_40px_-20px_rgba(110,60,20,0.35)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_50px_-20px_rgba(110,60,20,0.45)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2a1f] to-[#17110c] text-copper-light shadow-lg ring-4 ring-copper-light/20 transition group-hover:scale-105">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-ink/60">
                {text}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-copper transition group-hover:gap-3">
                Open <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          ))}
        </div>
      </Reveal>

      <Reveal delay={100}>
        <a
          href="/dashboard/commission"
          className="flex items-center gap-5 rounded-2xl bg-white p-6 shadow-[0_18px_40px_-20px_rgba(110,60,20,0.35)] ring-1 ring-black/5 transition hover:-translate-y-1"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
            <Wallet className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-bold text-ink">Your commission</h3>
              <span className="rounded-full bg-copper/10 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-copper">
                Coming soon
              </span>
            </div>
            <p className="mt-1 text-sm text-ink/60">
              Your sales and commission details will show here soon.
            </p>
          </div>
          <ArrowRight className="hidden h-5 w-5 text-copper sm:block" />
        </a>
      </Reveal>
    </div>
  );
}
