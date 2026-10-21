import { ArrowRight, ChartNoAxesColumnIncreasing, MapPin, ShieldCheck, Users } from "lucide-react";
import Reveal from "./Reveal";

const ICONS = [ShieldCheck, MapPin, ChartNoAxesColumnIncreasing, Users];

export default function WhyChoose({ c }) {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-gradient-to-br from-[#fcf6ec] via-[#f8eddc] to-[#f2e2cb] py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-copper-light/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#f0c58f]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[420px] w-[420px] rounded-full border border-copper/10" />
      <div className="pointer-events-none absolute -bottom-52 right-[22%] h-[520px] w-[520px] rounded-full border border-copper/5" />

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1fr_1.15fr]">
        <Reveal>
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
            <span className="h-px w-8 bg-copper" />
            {c.why_label}
          </p>
          <h2 className="mt-5 font-display text-[40px] font-bold leading-[1.1] text-ink sm:text-6xl sm:leading-[1.05]">
            {c.why_title_1}
            <br />
            {c.why_title_2} <span className="text-copper">{c.why_title_accent}</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink/75 lg:text-lg">
            {c.why_text}
          </p>
          <a
            href="/about"
            className="group mt-8 inline-flex items-center gap-3 rounded-lg bg-gradient-to-b from-copper-light to-copper-dark px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-copper/40"
          >
            {c.why_button}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {ICONS.map((Icon, i) => (
            <Reveal key={i} delay={i * 100} className="h-full">
              <div className="group relative flex h-full items-center gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#f7ebd9] to-[#efdcc0] p-6 shadow-[0_14px_34px_-16px_rgba(110,60,20,0.35)] ring-1 ring-white/70 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_-16px_rgba(110,60,20,0.45)]">
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/40 blur-2xl transition group-hover:bg-copper-light/30" />
                <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2a1f] to-[#17110c] text-copper-light shadow-lg ring-4 ring-copper-light/20 transition group-hover:scale-105">
                  <Icon className="h-7 w-7" strokeWidth={1.8} />
                </span>
                <span className="relative">
                  <span className="block text-base font-bold text-ink">
                    {c[`why${i + 1}_title`]}
                  </span>
                  <span className="mt-1 block text-sm leading-snug text-ink/65">
                    {c[`why${i + 1}_text`]}
                  </span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
