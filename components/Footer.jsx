import {
  ArrowRight,
  ArrowUp,
  ChevronRight,
  Globe,
  Handshake,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShieldHalf,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import Logo from "./Logo";
import { quickLinks } from "@/lib/data";
import { getContent } from "@/lib/content";
import { phoneHref } from "@/lib/siteContent";

const socials = [
  { icon: FaFacebookF, label: "Facebook", key: "social_facebook", bg: "bg-[#1b1613] ring-1 ring-white/15" },
  {
    icon: FaInstagram,
    label: "Instagram",
    key: "social_instagram",
    bg: "bg-gradient-to-tr from-[#f9a03f] via-[#e1306c] to-[#833ab4]",
  },
  { icon: FaYoutube, label: "YouTube", key: "social_youtube", bg: "bg-[#ff0000]" },
  { icon: FaLinkedinIn, label: "LinkedIn", key: "social_linkedin", bg: "bg-[#0a66c2]" },
];

const services = [
  { label: "Residential Plots", href: "/properties" },
  { label: "Commercial Properties", href: "/properties" },
  { label: "Farm Land", href: "/properties" },
  { label: "Villas & Luxury", href: "/properties" },
  { label: "Property Consultation", href: "/contact" },
];

const trust = [
  { icon: ShieldCheck, title: "Verified Listings", text: "Clear & genuine properties" },
  { icon: Users, title: "Expert Guidance", text: "Personalized support" },
  { icon: Handshake, title: "Trusted Deals", text: "Fair and transparent" },
  { icon: TrendingUp, title: "Better Investments", text: "For a brighter future" },
];

const legal = ["Terms & Conditions", "Privacy Policy", "Refund Policy"];

// Column heading: serif title with a short copper line under it.
function Heading({ children }) {
  return (
    <div>
      <h4 className="whitespace-nowrap font-display text-xl font-bold text-white xl:text-2xl">{children}</h4>
      <span className="mt-3 block h-0.5 w-9 rounded-full bg-copper" />
    </div>
  );
}

export default async function Footer() {
  const c = await getContent();

  const contacts = [
    { icon: Phone, text: c.contact_phone, href: phoneHref(c.contact_phone) },
    { icon: Mail, text: c.contact_email, href: `mailto:${c.contact_email}` },
    {
      icon: Globe,
      text: c.contact_website,
      href: /^https?:/.test(c.contact_website) ? c.contact_website : `https://${c.contact_website}`,
    },
    { icon: MapPin, text: c.contact_address },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#0b0908] text-white">
      {/* a faint copper glow in the corners */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-copper/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-copper/15 blur-3xl" />

      <div className="relative">
        <div className="container-x lg:!max-w-none lg:!px-[4.2vw] grid gap-y-2 pt-14 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.2fr)] xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)_minmax(0,1.05fr)_minmax(0,1.25fr)_minmax(0,1.1fr)] lg:gap-y-0 lg:pt-16">
          {/* the company */}
          <div className="pb-10 sm:col-span-2 lg:col-span-1 lg:pr-6 xl:pr-10">
            <Logo size="h-14" />
            <p className="mt-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              <span className="h-px w-8 bg-copper" />
              Building a brighter tomorrow
            </p>
            <p className="mt-4 font-display text-4xl font-bold leading-[1.1] text-white lg:text-[clamp(2rem,2.1vw,2.6rem)]">
              Trusted Land
              <span className="block text-copper-light min-[1500px]:whitespace-nowrap">Brighter Tomorrow</span>
            </p>
            <p className="mt-5 max-w-[22rem] text-[15px] leading-relaxed text-white/65">{c.footer_text}</p>
            <div className="mt-7 flex gap-3">
              {socials.map(({ icon: Icon, label, key, bg }) => (
                <a
                  key={label}
                  href={c[key] || "#"}
                  target={c[key] && c[key] !== "#" ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-label={label}
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg shadow-black/40 transition hover:-translate-y-0.5 hover:brightness-110 ${bg}`}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* quick links */}
          <div className="pb-10 lg:border-l lg:border-white/10 lg:px-6 xl:px-9">
            <Heading>Quick Links</Heading>
            <ul className="mt-6 space-y-1">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="group flex items-center justify-between gap-3 py-2 text-sm text-white/80 transition hover:text-copper-light xl:text-[15px]"
                  >
                    {l.label}
                    <ChevronRight className="h-4 w-4 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-copper-light" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* services */}
          <div className="pb-10 lg:border-l lg:border-white/10 lg:px-6 xl:px-9">
            <Heading>Our Services</Heading>
            <ul className="mt-6 space-y-1">
              {services.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="group flex items-center justify-between gap-3 py-2 text-sm text-white/80 transition hover:text-copper-light xl:text-[15px]"
                  >
                    {s.label}
                    <ChevronRight className="h-4 w-4 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-copper-light" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div className="pb-10 lg:border-l lg:border-white/10 lg:px-6 xl:px-9">
            <Heading>Contact Us</Heading>
            <ul className="mt-6 space-y-3">
              {contacts.map(({ icon: Icon, text, href }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-white/85 xl:gap-4 xl:text-[15px]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-copper-light ring-1 ring-copper/30 xl:h-11 xl:w-11">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  {href ? (
                    <a href={href} className="min-w-0 break-words transition hover:text-copper-light">
                      {text}
                    </a>
                  ) : (
                    <span className="min-w-0 break-words">{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* newsletter */}
          <div className="pb-10 sm:col-span-2 lg:col-span-1 lg:border-l lg:border-white/10 lg:pl-6 xl:pl-9">
            <Heading>Newsletter</Heading>
            <p className="mt-6 max-w-[17rem] text-[15px] leading-relaxed text-white/70">{c.footer_newsletter}</p>
            <form className="mt-5 flex h-14 max-w-sm overflow-hidden rounded-xl bg-white/[0.05] ring-1 ring-white/15 focus-within:ring-copper/60">
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-transparent px-5 text-[15px] text-white outline-none placeholder:text-white/45"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="m-1 flex w-12 items-center justify-center rounded-lg bg-gradient-to-b from-copper-light to-copper-dark shadow-lg shadow-copper/30 transition hover:brightness-110"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
            <p className="mt-5 flex items-center gap-2.5 text-sm text-white/55">
              <ShieldHalf className="h-4 w-4 text-white/60" />
              We respect your privacy.
            </p>
          </div>
        </div>
      </div>

      {/* four promises */}
      <div className="container-x lg:!max-w-none lg:!px-[4.2vw] relative pb-9 pt-2">
        <ul className="grid grid-cols-1 gap-6 rounded-3xl bg-white/[0.025] px-6 py-6 ring-1 ring-white/[0.06] sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:px-4 lg:py-7">
          {trust.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-4 lg:justify-center lg:border-l lg:border-white/10 lg:first:border-l-0">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1c120c] text-copper-light ring-1 ring-copper/50">
                <Icon className="h-6 w-6" strokeWidth={1.6} />
              </span>
              <span className="leading-tight">
                <span className="block text-base font-semibold text-white">{title}</span>
                <span className="mt-1.5 block text-sm text-white/55">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* the very bottom */}
      <div className="relative border-t border-copper/25">
        <div className="container-x lg:!max-w-none lg:!px-[4.2vw] flex flex-col items-center justify-between gap-4 py-6 text-sm text-white/65 sm:flex-row">
          <p>{c.footer_copyright}</p>
          <div className="flex flex-wrap items-center justify-center gap-y-3">
            {legal.map((item, i) => (
              <span key={item} className="flex items-center">
                {i > 0 && <span className="mx-5 h-4 w-px bg-white/20" />}
                <a href="#" className="transition hover:text-white">
                  {item}
                </a>
              </span>
            ))}
            <a
              href="#"
              aria-label="Back to top"
              className="ml-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-white ring-1 ring-white/20 transition hover:bg-copper hover:ring-copper"
            >
              <ArrowUp className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
