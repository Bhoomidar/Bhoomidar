"use client";

import { Eye, Globe, Mail, MapPin, PhoneCall } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { CONTACT_TABS } from "@/lib/siteContent";
import SettingsEditor from "./SettingsEditor";

const text = (v) => String(v ?? "").trim();

const SOCIALS = [
  { key: "social_facebook", icon: FaFacebookF, label: "Facebook", color: "bg-[#1877f2]" },
  { key: "social_instagram", icon: FaInstagram, label: "Instagram", color: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]" },
  { key: "social_youtube", icon: FaYoutube, label: "YouTube", color: "bg-[#ff0000]" },
  { key: "social_linkedin", icon: FaLinkedinIn, label: "LinkedIn", color: "bg-[#0a66c2]" },
];

// A link only counts when it is a real address ("#" means empty).
const hasLink = (v) => text(v) !== "" && text(v) !== "#";

// How the contact details look on the website, built from what is typed.
function Preview({ form }) {
  const rows = [
    { icon: PhoneCall, label: "Phone", value: text(form.contact_phone) },
    { icon: Mail, label: "Email", value: text(form.contact_email) },
    { icon: MapPin, label: "Address", value: text(form.contact_address) },
    { icon: Globe, label: "Website", value: text(form.contact_website) },
  ];
  const socials = SOCIALS.filter((s) => hasLink(form[s.key]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <Eye className="h-5 w-5 text-copper" />
          How it <span className="text-copper">looks</span>
        </p>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-200">
          Live
        </span>
      </div>

      <section className="rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-5 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5">
        <ul className="space-y-3">
          {rows.map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink/50">{label}</span>
                <span className={`mt-0.5 block break-words text-sm font-bold ${value ? "text-ink" : "font-medium text-ink/35"}`}>
                  {value || "Not added"}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-black/10 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/50">Follow us</p>
          {socials.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2.5">
              {socials.map(({ key, icon: Icon, label, color }) => (
                <span
                  key={key}
                  title={label}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md ${color}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink/45">No social links yet. Add a link under Social Links.</p>
          )}
        </div>
      </section>

      <p className="px-1 text-xs text-ink/50">
        The same details show on the Contact page and in the footer. They update as you type; the website changes after
        you press Save.
      </p>
    </div>
  );
}

export default function ContactEditor({ initial }) {
  return (
    <SettingsEditor
      tabs={CONTACT_TABS}
      initial={initial}
      siteHref="/contact"
      siteLabel="Open the Contact page"
      aside={(form) => <Preview form={form} />}
    />
  );
}
