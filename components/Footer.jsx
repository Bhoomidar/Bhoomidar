import { ArrowRight, Globe, Mail, MapPin, Phone } from "lucide-react";
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
  { icon: FaFacebookF, label: "Facebook", key: "social_facebook", bg: "bg-[#1877f2]" },
  {
    icon: FaInstagram,
    label: "Instagram",
    key: "social_instagram",
    bg: "bg-gradient-to-tr from-[#f9a03f] via-[#e1306c] to-[#833ab4]",
  },
  { icon: FaYoutube, label: "YouTube", key: "social_youtube", bg: "bg-[#ff0000]" },
  { icon: FaLinkedinIn, label: "LinkedIn", key: "social_linkedin", bg: "bg-[#0a66c2]" },
];

const legal = ["Terms & Conditions", "Privacy Policy", "Refund Policy"];

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
    <footer className="bg-[#0a0807] text-white">
      <div className="container-x grid pt-12 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.7fr_1.05fr_1fr] lg:pt-14">
        <div className="pb-10 pr-8">
          <Logo size="h-16" />
          <p className="mt-5 max-w-[280px] text-sm leading-relaxed text-white/70">
            {c.footer_text}
          </p>
          <div className="mt-6 flex gap-3">
            {socials.map(({ icon: Icon, label, key, bg }) => (
              <a
                key={label}
                href={c[key] || "#"}
                target={c[key] && c[key] !== "#" ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={label}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:scale-105 ${bg}`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>

        <div className="pb-10 sm:border-l sm:border-white/10 sm:pl-8 lg:pl-10">
          <h4 className="text-base font-semibold">Quick Links</h4>
          <ul className="mt-5 space-y-2.5">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-sm text-white/80 transition hover:text-copper-light"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="pb-10 lg:border-l lg:border-white/10 lg:pl-10">
          <h4 className="text-base font-semibold">Contact Us</h4>
          <ul className="mt-5 space-y-3.5">
            {contacts.map(({ icon: Icon, text, href }) => (
              <li
                key={text}
                className="flex items-center gap-3.5 text-sm text-white/85"
              >
                <Icon className="h-4 w-4 shrink-0 text-white" />
                {href ? (
                  <a href={href} className="transition hover:text-copper-light">
                    {text}
                  </a>
                ) : (
                  text
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="pb-10 sm:border-l sm:border-white/10 sm:pl-8 lg:pl-10">
          <h4 className="text-base font-semibold">Newsletter</h4>
          <p className="mt-5 max-w-[270px] text-sm leading-relaxed text-white/75">
            {c.footer_newsletter}
          </p>
          <form className="mt-5 flex h-12 max-w-sm overflow-hidden rounded-lg bg-[#2a2522] ring-1 ring-white/10">
            <input
              type="email"
              placeholder="Enter your email"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/50"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="flex w-14 items-center justify-center bg-gradient-to-b from-copper-light to-copper-dark transition hover:brightness-110"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-sm text-white/70 sm:flex-row">
          <p>{c.footer_copyright}</p>
          <p className="flex flex-wrap items-center justify-center">
            {legal.map((item, i) => (
              <span key={item} className="flex items-center">
                {i > 0 && <span className="mx-5 h-4 w-px bg-white/20" />}
                <a href="#" className="transition hover:text-white">
                  {item}
                </a>
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
