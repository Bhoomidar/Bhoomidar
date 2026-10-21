import Image from "next/image";
import {
  ArrowRight,
  Check,
  Compass,
  Eye,
  Handshake,
  MapPin,
  Search,
  ShieldCheck,
  Smile,
  Sprout,
  Target,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Reveal from "@/components/Reveal";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/content";
import { lines } from "@/lib/siteContent";

export const metadata = {
  title: "About Us | Bhoomidar",
  description:
    "Bhoomidar is a real estate partner network. We help people invest in good land and property in simple and clear ways.",
};

const VALUE_ICONS = [ShieldCheck, Eye, Users, Sprout];
const STEP_ICONS = [Search, MapPin, ShieldCheck, Handshake];

export default async function AboutPage() {
  const c = await getContent();

  return (
    <main>
      {/* Banner */}
      <section className="relative overflow-hidden bg-night">
        <Image
          src={c.about_image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="zoom-in-slow object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060d18]/95 via-[#060d18]/75 to-[#060d18]/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

        <Navbar />

        <div className="fade-up container-x relative pb-16 pt-32 sm:pb-28 sm:pt-36 lg:pb-36 lg:pt-44">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            <span className="h-px w-8 bg-copper-light" />
            {c.about_label}
          </p>
          <h1 className="mt-4 font-display text-[38px] font-bold leading-[1.15] text-white sm:mt-5 sm:text-6xl lg:text-[64px]">
            {c.about_title_1}
            <br />
            {c.about_title_2} <span className="text-copper-light">{c.about_title_accent}</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 lg:text-lg">
            {c.about_text}
          </p>
        </div>
      </section>

      {/* Who we are */}
      <section className="bg-cream py-14 sm:py-20 lg:py-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -bottom-3 -right-3 h-full w-full rounded-3xl border-2 border-copper/30 sm:-bottom-4 sm:-right-4" />
              <div className="relative aspect-square overflow-hidden rounded-3xl shadow-[0_30px_60px_-24px_rgba(110,60,20,0.5)]">
                <Image
                  src={c.story_image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
              </div>
              <div className="float-slow absolute -left-3 bottom-8 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-2xl sm:-left-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white">
                  <Smile className="h-6 w-6" />
                </span>
                <span className="leading-tight">
                  <span className="block text-2xl font-bold text-ink">
                    {c.story_badge_value}
                  </span>
                  <span className="block text-xs text-ink/60">{c.story_badge_label}</span>
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-8 bg-copper" />
              {c.story_label}
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
              {c.story_title_1} <span className="text-copper">{c.story_title_accent}</span>
            </h2>
            {[c.story_p1, c.story_p2, c.story_p3].map(
              (text, i) =>
                text && (
                  <p
                    key={i}
                    className={`${i === 0 ? "mt-6" : "mt-4"} text-base leading-relaxed text-ink/70 lg:text-lg`}
                  >
                    {text}
                  </p>
                ),
            )}

            <ul className="mt-8 space-y-4">
              {lines(c.story_points).map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-3.5 text-base font-medium text-ink"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Numbers */}
      <section className="relative overflow-hidden bg-night py-14 lg:py-16">
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-copper/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-copper-light/15 blur-3xl" />
        <div className="container-x relative grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n, i) => (
            <Reveal
              key={n}
              delay={i * 100}
              className="text-center lg:border-l lg:border-white/10 lg:first:border-l-0"
            >
              <p className="font-display text-4xl font-bold text-copper-light sm:text-5xl">
                {c[`num${n}_value`]}
              </p>
              <p className="mt-2 text-sm text-white/70">{c[`num${n}_label`]}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Mission and vision */}
      <section className="bg-gradient-to-b from-[#fbf6ee] to-[#f6ecdc] py-14 sm:py-20 lg:py-28">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-8 bg-copper" />
              {c.mv_label}
              <span className="h-px w-8 bg-copper" />
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
              {c.mv_title_1} <span className="text-copper">{c.mv_title_accent}</span>{" "}
              {c.mv_title_2}
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal className="h-full">
              <div className="h-full rounded-3xl bg-white p-8 shadow-[0_24px_50px_-24px_rgba(110,60,20,0.4)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1.5 sm:p-10">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2a1f] to-[#17110c] text-copper-light shadow-lg ring-4 ring-copper-light/20">
                  <Target className="h-7 w-7" strokeWidth={1.8} />
                </span>
                <h3 className="mt-6 font-display text-3xl font-bold text-ink">
                  {c.mission_title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-ink/70">{c.mission_text}</p>
              </div>
            </Reveal>

            <Reveal delay={150} className="h-full">
              <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a2019] to-night p-8 text-white shadow-[0_24px_50px_-24px_rgba(0,0,0,0.6)] transition duration-300 hover:-translate-y-1.5 sm:p-10">
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-copper/30 blur-2xl" />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-lg ring-4 ring-white/10">
                  <Compass className="h-7 w-7" strokeWidth={1.8} />
                </span>
                <h3 className="relative mt-6 font-display text-3xl font-bold">
                  {c.vision_title}
                </h3>
                <p className="relative mt-3 text-base leading-relaxed text-white/75">
                  {c.vision_text}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream py-14 sm:py-20 lg:py-24">
        <div className="container-x">
          <Reveal className="max-w-xl">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-8 bg-copper" />
              {c.values_label}
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
              {c.values_title_1} <span className="text-copper">{c.values_title_accent}</span>
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_ICONS.map((Icon, i) => (
              <Reveal key={i} delay={i * 100} className="h-full">
                <div className="group h-full rounded-2xl bg-gradient-to-br from-[#f7ebd9] to-[#efdcc0] p-6 shadow-[0_14px_34px_-16px_rgba(110,60,20,0.35)] ring-1 ring-white/70 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_-16px_rgba(110,60,20,0.45)]">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2a1f] to-[#17110c] text-copper-light shadow-lg ring-4 ring-copper-light/20 transition group-hover:scale-105">
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-ink">
                    {c[`value${i + 1}_title`]}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">
                    {c[`value${i + 1}_text`]}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-b from-[#f6ecdc] to-[#fbf6ee] pb-14 pt-4 sm:pb-20 lg:pb-28">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-8 bg-copper" />
              {c.steps_label}
              <span className="h-px w-8 bg-copper" />
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
              {c.steps_title_1} <span className="text-copper">{c.steps_title_accent}</span>
            </h2>
            <p className="mt-4 text-base text-ink/65">{c.steps_text}</p>
          </Reveal>

          <div className="relative mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:mt-14 lg:grid-cols-4 lg:gap-6">
            <div className="absolute left-[12.5%] right-[12.5%] top-10 hidden h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent lg:block" />
            {STEP_ICONS.map((Icon, i) => (
              <Reveal key={i} delay={i * 120} className="relative text-center">
                <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30 ring-8 ring-[#faf3e7] sm:h-20 sm:w-20">
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.7} />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-night text-[11px] font-bold text-copper-light sm:h-7 sm:w-7 sm:text-xs">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-4 text-base font-bold text-ink sm:mt-5 sm:text-lg">{c[`step${i + 1}_title`]}</h3>
                <p className="mx-auto mt-1.5 max-w-[200px] text-[13px] leading-relaxed text-ink/65 sm:mt-2 sm:text-sm">
                  {c[`step${i + 1}_text`]}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10 flex flex-col gap-3 sm:mt-14 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <a
              href="/properties"
              className="group inline-flex items-center justify-center gap-3 rounded-lg bg-gradient-to-b from-copper-light to-copper-dark px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5"
            >
              See Properties
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-3 rounded-lg border border-copper px-7 py-3.5 text-sm font-semibold text-copper transition hover:bg-copper hover:text-white"
            >
              Talk to Us <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </section>

      <CTA c={c} />
      <Footer />
    </main>
  );
}
