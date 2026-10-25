import { Fragment } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  CalendarCheck,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  MessageSquareText,
  PhoneCall,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp, FaYoutube } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/content";
import { phoneHref } from "@/lib/siteContent";

export const metadata = {
  title: "Contact Us | Bhoomidar",
  description:
    "Have a question about a property or a site visit? Send us a message or call us.",
};

const SOCIALS = [
  { key: "social_facebook", label: "Facebook", icon: FaFacebookF, color: "bg-[#1877f2]" },
  { key: "social_instagram", label: "Instagram", icon: FaInstagram, color: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]" },
  { key: "social_youtube", label: "YouTube", icon: FaYoutube, color: "bg-[#ff0000]" },
  { key: "social_linkedin", label: "LinkedIn", icon: FaLinkedinIn, color: "bg-[#0a66c2]" },
];

// A link only counts when it is a real address ("#" means "not set").
const realLink = (v) => {
  const t = String(v ?? "").trim();
  return t && t !== "#" ? t : "";
};

// WhatsApp wants the number with its country code. A plain 10 digit number is Indian.
const waNumber = (phone) => {
  const d = String(phone ?? "").replace(/\D/g, "");
  return d.length === 10 ? `91${d}` : d;
};

const steps = [
  { icon: MessageSquareText, title: "Send us a message", text: "Tell us what you are looking for, in a few words." },
  { icon: PhoneCall, title: "We get back to you", text: "Our team calls or writes to you and answers your questions." },
  { icon: CalendarCheck, title: "Plan a site visit", text: "See the land together, at a time that suits you." },
];

export default async function ContactPage() {
  const c = await getContent();

  const website = /^https?:/.test(c.contact_website)
    ? c.contact_website
    : `https://${c.contact_website}`;
  const wa = waNumber(c.contact_phone);
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.contact_address)}`;
  const socials = SOCIALS.map((s) => ({ ...s, href: realLink(c[s.key]) })).filter((s) => s.href);

  const contactInfo = [
    { icon: PhoneCall, title: "Call Us", value: c.contact_phone, href: phoneHref(c.contact_phone) },
    { icon: Mail, title: "Email Us", value: c.contact_email, href: `mailto:${c.contact_email}` },
    {
      icon: MapPin,
      title: "Visit Us",
      value: c.contact_address,
      href: mapsHref,
      external: true,
      note: "Open in Google Maps",
    },
    { icon: Globe, title: "Website", value: c.contact_website, href: website, external: true },
  ];

  const faqs = [1, 2, 3, 4]
    .map((n) => ({ q: c[`faq${n}_q`], a: c[`faq${n}_a`] }))
    .filter((f) => f.q && f.a)
    .map((f, i) => ({ id: `c${i}`, question: f.q, answer: f.a }));

  return (
    <main>
      <section className="relative overflow-hidden bg-night">
        <Image
          src={c.contact_image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060d18]/95 via-[#060d18]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/45" />

        <Navbar />

        <div className="fade-up container-x relative pb-32 pt-32 sm:pb-36 sm:pt-36 lg:!max-w-none lg:!px-[4.2vw] lg:pb-44 lg:pt-44">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-copper-light">
            <span className="h-px w-10 bg-copper-light" />
            {c.contact_label}
          </p>
          <h1 className="mt-4 font-display text-[38px] font-bold leading-[1.15] text-white sm:mt-5 sm:text-6xl lg:text-[72px]">
            {c.contact_title_1}
            <br />
            {c.contact_title_2}{" "}
            <span className="text-copper-light">{c.contact_title_accent}</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 lg:text-lg">
            {c.contact_text}
          </p>

          {/* The quickest ways to reach us */}
          <div className="mt-8 flex flex-wrap gap-3">
            {c.contact_phone && (
              <a
                href={phoneHref(c.contact_phone)}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-copper/40 transition hover:-translate-y-0.5"
              >
                <PhoneCall className="h-4 w-4" />
                Call now
              </a>
            )}
            {wa && (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-b from-[#2bd96b] to-[#128c4a] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/30 transition hover:-translate-y-0.5"
              >
                <FaWhatsapp className="h-[18px] w-[18px]" />
                WhatsApp
              </a>
            )}
            {c.contact_email && (
              <a
                href={`mailto:${c.contact_email}`}
                className="inline-flex items-center gap-2.5 rounded-xl bg-white/10 px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                <Mail className="h-4 w-4" />
                Email us
              </a>
            )}
          </div>
        </div>

        {/* a soft wave where the photo meets the page */}
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-12 w-full sm:h-16 lg:h-24"
        >
          <path d="M0 52C220 96 470 92 720 62S1180 4 1440 44V100H0Z" fill="#fdf3e4" />
        </svg>
      </section>

      <section className="relative z-10 -mt-[var(--pull)] overflow-x-clip bg-[linear-gradient(to_bottom,transparent_var(--pull),#fdf3e4_var(--pull))] pb-14 [--pull:3.5rem] sm:pb-20 sm:[--pull:5rem] lg:pb-24">
        <div className="pointer-events-none absolute -left-24 top-1/2 h-96 w-96 rounded-full bg-copper-light/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-amber-300/15 blur-3xl" />

        <div className="container-x relative lg:!max-w-none lg:!px-[4.2vw]">
          <div className="relative grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
            <div className="space-y-4">
              {contactInfo.map(({ icon: Icon, title, value, href, external, note }, i) => {
                const Tag = href ? "a" : "div";
                return (
                  <Reveal key={title} delay={i * 100}>
                    <Tag
                      {...(href ? { href } : {})}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-white to-[#fff6ea] p-4 shadow-[0_18px_40px_-20px_rgba(110,60,20,0.35)] ring-1 ring-copper/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-20px_rgba(110,60,20,0.45)] sm:gap-5 sm:p-5"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30 transition group-hover:scale-105 sm:h-14 sm:w-14">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-ink/50">{title}</span>
                        <span className="mt-1 block break-words text-base font-bold text-ink">
                          {value}
                        </span>
                        {note && (
                          <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-copper">
                            <ExternalLink className="h-3.5 w-3.5" />
                            {note}
                          </span>
                        )}
                      </span>
                      {href && (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-copper shadow-sm ring-1 ring-copper/25 transition group-hover:bg-copper group-hover:text-white">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      )}
                    </Tag>
                  </Reveal>
                );
              })}

              {wa && (
                <Reveal delay={400}>
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#2bd96b] to-[#128c4a] p-4 text-white shadow-[0_18px_40px_-20px_rgba(18,140,74,0.6)] transition duration-300 hover:-translate-y-1 sm:gap-5 sm:p-5"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#25D366] shadow-md transition group-hover:scale-105 sm:h-14 sm:w-14">
                      <FaWhatsapp className="h-6 w-6 sm:h-7 sm:w-7" />
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-white/85">WhatsApp</span>
                      <span className="mt-1 block text-base font-bold">Chat with our team</span>
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40 transition group-hover:bg-white group-hover:text-[#128c4a]">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </a>
                </Reveal>
              )}

              {socials.length > 0 && (
                <Reveal delay={500}>
                  <div className="rounded-2xl bg-white p-4 shadow-[0_18px_40px_-20px_rgba(110,60,20,0.3)] ring-1 ring-copper/10 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">Follow us</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {socials.map(({ key, label, icon: Icon, href, color }) => (
                        <a
                          key={key}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          title={label}
                          className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md transition hover:-translate-y-1 hover:shadow-lg ${color}`}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                        </a>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
            </div>

            <Reveal delay={150}>
              <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-b from-white to-[#fffaf3] p-5 shadow-[0_30px_60px_-24px_rgba(110,60,20,0.4)] ring-1 ring-black/5 sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-copper-light/20 blur-3xl" />
                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full bg-copper/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-copper-dark ring-1 ring-copper/20">
                    <Clock className="h-3.5 w-3.5" />
                    We will get back to you
                  </span>
                  <h2 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
                    {c.form_title_1} <span className="text-copper">{c.form_title_accent}</span>
                  </h2>
                  <p className="mb-8 mt-2 text-sm text-ink/60">{c.form_text}</p>
                  <ContactForm />
                </div>
              </div>
            </Reveal>
          </div>

          {/* What happens after you write to us */}
          <Reveal>
            <div className="mt-12 sm:mt-16">
              <div className="text-center">
                <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-copper-dark">
                  <span className="h-px w-8 bg-copper" />
                  What happens next
                  <span className="h-px w-8 bg-copper" />
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
                  Three <span className="text-copper">simple steps</span>
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm text-ink/60 sm:text-base">
                  From your message to a site visit, we make the process simple and hassle-free.
                </p>
              </div>

              <div className="mt-9 flex flex-col gap-5 md:flex-row md:items-center md:gap-0">
                {steps.map(({ icon: Icon, title, text }, i) => (
                  <Fragment key={title}>
                    <div className="relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-white to-[#fff8ee] p-5 pl-6 shadow-[0_20px_44px_-24px_rgba(110,60,20,0.45)] ring-1 ring-copper/10 transition duration-300 hover:-translate-y-1 sm:gap-5 sm:p-6 sm:pl-8">
                      <span className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-copper-light to-copper" />
                      <span className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-[13px] font-bold text-white shadow-md shadow-copper/30 ring-4 ring-white">
                        0{i + 1}
                      </span>
                      <span className="mt-3 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#fde8d6] text-copper shadow-inner sm:h-[72px] sm:w-[72px]">
                        <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.6} />
                      </span>
                      <span className="mt-1 min-w-0 leading-tight">
                        <span className="block font-display text-lg font-bold text-ink sm:text-xl">{title}</span>
                        <span className="mt-1.5 block text-sm leading-relaxed text-ink/60">{text}</span>
                      </span>
                    </div>

                    {i < steps.length - 1 && (
                      <span aria-hidden className="relative hidden w-10 shrink-0 items-center md:flex lg:w-16">
                        <span className="w-full border-t-2 border-dashed border-copper/40" />
                        <span className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-copper ring-4 ring-[#fdf3e4]" />
                      </span>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {faqs.length > 0 && (
        <Faq
          c={{ ...c, homefaq_label: c.faq_label, homefaq_title_1: c.faq_title_1, homefaq_title_accent: c.faq_title_accent, homefaq_text: "" }}
          faqs={faqs}
          hideHelp
        />
      )}

      <Footer />
    </main>
  );
}
