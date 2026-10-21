import Image from "next/image";
import { Globe, Mail, MapPin, Phone, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/content";
import { phoneHref } from "@/lib/siteContent";

export const metadata = {
  title: "Contact Us | Bhoomidar",
  description:
    "Have a question about a property or the partner program? Send us a message or call us.",
};

export default async function ContactPage() {
  const c = await getContent();

  const website = /^https?:/.test(c.contact_website)
    ? c.contact_website
    : `https://${c.contact_website}`;

  const contactInfo = [
    { icon: Phone, title: "Call Us", value: c.contact_phone, href: phoneHref(c.contact_phone) },
    { icon: Mail, title: "Email Us", value: c.contact_email, href: `mailto:${c.contact_email}` },
    { icon: MapPin, title: "Visit Us", value: c.contact_address, href: null },
    { icon: Globe, title: "Website", value: c.contact_website, href: website },
  ];

  const faqs = [1, 2, 3, 4]
    .map((n) => ({ q: c[`faq${n}_q`], a: c[`faq${n}_a`] }))
    .filter((f) => f.q && f.a);

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
        <div className="absolute inset-0 bg-gradient-to-r from-[#060d18]/95 via-[#060d18]/70 to-[#060d18]/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

        <Navbar />

        <div className="fade-up container-x relative pb-14 pt-32 sm:pb-24 sm:pt-36 lg:pb-28 lg:pt-44">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            <span className="h-px w-8 bg-copper-light" />
            {c.contact_label}
          </p>
          <h1 className="mt-4 font-display text-[38px] font-bold leading-[1.15] text-white sm:mt-5 sm:text-6xl lg:text-[64px]">
            {c.contact_title_1}
            <br />
            {c.contact_title_2}{" "}
            <span className="text-copper-light">{c.contact_title_accent}</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 lg:text-lg">
            {c.contact_text}
          </p>
        </div>
      </section>

      <section className="relative bg-gradient-to-b from-[#fbf6ee] to-[#f6ecdc] pb-14 pt-10 sm:pb-20 sm:pt-14 lg:pb-28 lg:pt-20">
        <div className="pointer-events-none absolute -left-24 top-1/2 h-96 w-96 rounded-full bg-copper-light/15 blur-3xl" />

        <div className="container-x relative">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4">
              {contactInfo.map(({ icon: Icon, title, value, href }, i) => {
                const Tag = href ? "a" : "div";
                return (
                  <Reveal key={title} delay={i * 100}>
                    <Tag
                      {...(href ? { href } : {})}
                      className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_18px_40px_-20px_rgba(110,60,20,0.35)] sm:gap-5 sm:p-5 ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-20px_rgba(110,60,20,0.45)]"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2a1f] to-[#17110c] text-copper-light shadow-lg ring-4 ring-copper-light/20 transition group-hover:scale-105 sm:h-14 sm:w-14">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span className="block text-xs font-medium text-ink/55">{title}</span>
                        <span className="mt-1 block break-words text-base font-bold text-ink">
                          {value}
                        </span>
                      </span>
                    </Tag>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={150}>
              <div className="h-full rounded-3xl bg-white p-5 shadow-[0_30px_60px_-24px_rgba(110,60,20,0.4)] ring-1 ring-black/5 sm:p-10">
                <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
                  {c.form_title_1} <span className="text-copper">{c.form_title_accent}</span>
                </h2>
                <p className="mb-8 mt-2 text-sm text-ink/60">{c.form_text}</p>
                <ContactForm />
              </div>
            </Reveal>
          </div>

          {faqs.length > 0 && (
            <Reveal className="mt-14 sm:mt-20 lg:mt-24">
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
                <span className="h-px w-8 bg-copper" />
                {c.faq_label}
              </p>
              <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
                {c.faq_title_1} <span className="text-copper">{c.faq_title_accent}</span>
              </h2>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {faqs.map(({ q, a }) => (
                  <details
                    key={q}
                    className="group rounded-2xl bg-white p-6 shadow-[0_14px_30px_-18px_rgba(110,60,20,0.3)] ring-1 ring-black/5 open:ring-copper/30"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-ink [&::-webkit-details-marker]:hidden">
                      {q}
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper transition group-open:rotate-45 group-open:bg-copper group-open:text-white">
                        <Plus className="h-4 w-4" />
                      </span>
                    </summary>
                    <p className="mt-4 text-sm leading-relaxed text-ink/65">{a}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
