import Image from "next/image";
import { ArrowRight, Check, ClipboardList, Gift, Handshake, Users } from "lucide-react";
import Reveal from "./Reveal";
import { lines } from "@/lib/siteContent";

const BENEFIT_ICONS = [ClipboardList, Handshake, Users, Gift];

export default function Partner({ c }) {
  return (
    <section id="opportunities" className="bg-cream lg:py-3">
      <div className="grid lg:grid-cols-[41%_1fr]">
        <div className="relative min-h-[560px] overflow-hidden lg:min-h-[640px] lg:rounded-r-[28px]">
          <Image
            src={c.partner_image}
            alt=""
            fill
            sizes="(min-width: 1024px) 41vw, 100vw"
            className="-scale-x-100 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

          <div className="relative flex h-full min-h-[560px] items-center p-4 lg:min-h-[640px] lg:p-3">
            <Reveal className="w-full max-w-[340px]">
              <div className="rounded-2xl border border-white/10 bg-[#17110d]/85 p-6 text-white shadow-2xl backdrop-blur-md lg:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                  {c.partner_card_label}
                </p>
                <h3 className="mt-3 font-display text-3xl font-bold leading-[1.12] lg:text-[38px]">
                  {c.partner_card_1}
                  <br />
                  {c.partner_card_2}
                  <br />
                  <span className="text-copper-light">{c.partner_card_accent}</span>
                </h3>
                <ul className="mt-6 space-y-4">
                  {lines(c.partner_points).map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-3 text-[15px] font-medium"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark shadow">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-14 lg:py-10 lg:pl-14 lg:pr-[max(2.5rem,calc((100vw_-_1440px)/2_+_2.5rem))]">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/65">
              {c.partner_label}
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.1] text-ink sm:text-5xl lg:text-[48px]">
              {c.partner_title_1}
              <br />
              {c.partner_title_2} <span className="text-copper">{c.partner_title_accent}</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/70">
              {c.partner_text}
            </p>
          </Reveal>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {BENEFIT_ICONS.map((Icon, i) => (
              <Reveal key={i} delay={i * 100} className="h-full">
                <div className="h-full rounded-2xl bg-gradient-to-b from-white to-[#fcf6ec] p-5 shadow-[0_14px_30px_-16px_rgba(110,60,20,0.4)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-sm font-bold text-ink">{c[`benefit${i + 1}_title`]}</p>
                  <p className="mt-1 whitespace-nowrap text-2xl font-bold text-ink">
                    {c[`benefit${i + 1}_value`]}
                  </p>
                  <p className="mt-2 text-xs leading-snug text-ink/60">
                    {c[`benefit${i + 1}_text`]}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <a
            href="/register"
            className="mt-9 inline-flex w-fit min-w-[240px] items-center justify-between gap-6 rounded-lg bg-gradient-to-b from-copper to-copper-dark px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5 hover:brightness-110"
          >
            {c.partner_button} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
