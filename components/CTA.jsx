import Image from "next/image";
import { ArrowRight, IndianRupee, MapPin, Phone } from "lucide-react";
import Reveal from "./Reveal";
import { phoneHref } from "@/lib/siteContent";

// Bottom banner. Customers see the site-visit banner; the partner page passes
// `partner` to show the registration-fee banner instead.
export default function CTA({ c, partner = false }) {
  const copy = partner
    ? {
        title: c.cta_title_1,
        accent: c.cta_title_accent,
        text: c.cta_text,
        label: c.cta_fee_label,
        value: c.cta_fee,
        button: c.cta_button,
        href: "/register",
        Icon: IndianRupee,
      }
    : {
        title: c.enq_title_1,
        accent: c.enq_title_accent,
        text: c.enq_text,
        label: c.enq_card_label,
        value: c.enq_card_value,
        button: c.enq_button,
        href: "/contact",
        Icon: MapPin,
      };

  return (
    <section className="relative overflow-hidden bg-night">
      {c.cta_image_mobile ? (
        <>
          <Image
            src={c.cta_image_mobile}
            alt=""
            fill
            sizes="100vw"
            className="object-cover lg:hidden"
          />
          <Image
            src={c.cta_image}
            alt=""
            fill
            sizes="100vw"
            className="hidden object-cover object-[center_45%] lg:block"
          />
        </>
      ) : (
        <Image
          src={c.cta_image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_45%]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-[#060d18]/95 via-[#060d18]/60 to-[#060d18]/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />
      {/* a thin copper light along the top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper-light/60 to-transparent" />
      <div className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-copper/25 blur-3xl" />

      <div className="container-x relative flex flex-col items-start justify-between gap-9 lg:!max-w-none lg:!px-[4.2vw] py-14 lg:min-h-[340px] lg:flex-row lg:items-center lg:gap-12 lg:py-16">
        <Reveal className="max-w-xl">
          <span className="block h-1 w-12 rounded-full bg-gradient-to-r from-copper-light to-copper-dark" />
          <h2 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-[3.6rem]">
            {copy.title}
            <span className="block bg-gradient-to-r from-[#f0b078] to-[#d98b52] bg-clip-text pb-2 text-transparent">
              {copy.accent}
            </span>
          </h2>
          <p className="mt-1 max-w-md text-[15px] leading-relaxed text-white/80 lg:text-lg">
            {copy.text}
          </p>
        </Reveal>

        <Reveal delay={150} className="w-full max-w-sm lg:w-[22.5rem]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-[#fff6ea] p-6 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/60">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-copper/15 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30">
                <copy.Icon className="h-6 w-6" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm text-ink/60">{copy.label}</span>
                <span className="mt-1 block font-sans text-3xl font-extrabold tabular-nums text-ink">{copy.value}</span>
              </span>
            </div>
            <a
              href={copy.href}
              className="group btn-shimmer relative mt-5 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-5 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-copper/35 transition hover:-translate-y-0.5 hover:brightness-110"
            >
              {copy.button}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            {!partner && c.contact_phone && (
              <a
                href={phoneHref(c.contact_phone)}
                className="relative mt-4 flex items-center justify-center gap-2 text-sm text-ink/60 transition hover:text-copper"
              >
                <Phone className="h-4 w-4 text-copper" />
                Or call <b className="font-semibold text-ink">{c.contact_phone}</b>
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
