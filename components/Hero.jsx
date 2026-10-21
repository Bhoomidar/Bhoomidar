import Image from "next/image";
import { ArrowRight, Building, ChevronRight, Home, MapPin } from "lucide-react";
import { Building2, Coins, Sprout, Users } from "lucide-react";
import Navbar from "./Navbar";

const STAT_ICONS = [Building2, Users, Coins, Sprout];

export default function Hero({ c }) {
  // Phones can have their own (taller) photo. Without one, the main photo is
  // used and centred on the house.
  const mobileImage = c.hero_image_mobile;

  const cardRows = [
    { icon: MapPin, label: c.hero_card1_label, value: c.hero_card1_value },
    { icon: Home, label: c.hero_card2_label, value: c.hero_card2_value },
  ];

  return (
    <section
      id="home"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-night lg:h-screen"
    >
      {mobileImage ? (
        <>
          <Image
            src={mobileImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="zoom-in-slow object-cover lg:hidden"
          />
          <Image
            src={c.hero_image}
            alt=""
            fill
            sizes="100vw"
            className="zoom-in-slow hidden object-cover object-right lg:block"
          />
        </>
      ) : (
        <>
          {/* Phones: the wide photo as a band across the page (whole house and
              pool visible), fading into a dark background. */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1424] via-[#08101c] to-[#04070c] lg:hidden" />
          <div className="fade-edges-y absolute inset-x-0 top-[16%] h-[50%] lg:hidden">
            <Image
              src={c.hero_image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="zoom-in-slow object-cover object-[78%_center]"
            />
          </div>
          <Image
            src={c.hero_image}
            alt=""
            fill
            sizes="100vw"
            className="zoom-in-slow hidden object-cover object-right lg:block"
          />
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 lg:bg-gradient-to-r lg:from-[#060d18]/90 lg:via-[#060d18]/55 lg:to-transparent" />
      <div className="absolute inset-0 hidden bg-gradient-to-b from-black/50 via-transparent to-transparent lg:block" />

      <Navbar />

      <div className="container-x relative flex flex-1 flex-col justify-between gap-6 pb-5 pt-[88px] lg:block lg:flex-none lg:pb-16 lg:pt-24">
        <div className="max-w-2xl">
          <span
            style={{ animationDelay: "100ms" }}
            className="fade-up inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur"
          >
            <Building className="h-3 w-3 text-copper-light" />
            {c.hero_badge}
          </span>

          <h1
            style={{ animationDelay: "250ms" }}
            className="fade-up mt-4 font-display text-[38px] font-bold leading-[1.1] text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.55)] sm:mt-5 sm:text-6xl lg:text-[min(84px,9vh)] lg:leading-[1.06] lg:[text-shadow:none]"
          >
            {c.hero_title_1}
            <span className="block text-copper-light">{c.hero_title_2}</span>
            <span className="block text-copper-light">{c.hero_title_3}</span>
          </h1>

          <p
            style={{ animationDelay: "400ms" }}
            className="fade-up mt-5 max-w-xl whitespace-pre-line text-[17px] font-medium leading-snug text-white sm:text-xl lg:text-[min(26px,2.8vh)]"
          >
            {c.hero_lead}
          </p>
          <p
            style={{ animationDelay: "500ms" }}
            className="fade-up mt-3 hidden max-w-xl text-base leading-relaxed text-white/80 sm:block lg:text-[min(18px,2.1vh)]"
          >
            {c.hero_text}
          </p>
        </div>

        <div>
          <div
            style={{ animationDelay: "650ms" }}
            className="fade-up flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-4 lg:mt-7"
          >
            <a
              href="#properties"
              className="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-b from-copper-light to-copper-dark px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:brightness-110 sm:w-auto sm:rounded-md sm:py-3.5"
            >
              {c.hero_btn1} <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/register"
              className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-white/80 bg-black/30 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 sm:w-auto sm:rounded-md sm:py-3.5"
            >
              {c.hero_btn2} <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div
            style={{ animationDelay: "800ms" }}
            className="fade-up mt-5 grid max-w-[1020px] grid-cols-2 gap-x-3 gap-y-3.5 sm:mt-7 sm:grid-cols-4 sm:gap-6 lg:mt-9"
          >
            {STAT_ICONS.map((Icon, i) => (
              <div key={i} className="flex items-center gap-2.5 sm:gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f6e9d6] text-copper shadow-md sm:h-14 sm:w-14">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[15px] font-bold text-white sm:text-base">
                    {c[`hero_stat${i + 1}_value`]}
                  </span>
                  <span className="block text-[13px] text-white/75 sm:text-sm">
                    {c[`hero_stat${i + 1}_label`]}
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* Phones: the "featured" card sits in the page at the bottom. */}
          <div
            style={{ animationDelay: "950ms" }}
            className="fade-up mt-4 overflow-hidden rounded-2xl bg-white shadow-2xl lg:hidden"
          >
            {cardRows.map(({ icon: Icon, label, value }, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-4 py-2.5 ${i > 0 ? "border-t border-black/5" : ""}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-xs text-ink/55">{label}</span>
                  <span className="block truncate text-[15px] font-bold text-ink">{value}</span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-ink/40" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="container-x relative h-full">
          <div className="absolute right-10 top-24 -rotate-6 whitespace-pre-line text-right font-hand text-4xl font-semibold leading-tight text-[#f0cfa4] drop-shadow-lg">
            {c.hero_tagline}
          </div>

          <div className="float-slow absolute bottom-24 right-10 w-72 rounded-xl bg-white p-4 shadow-2xl">
            {cardRows.map(({ icon: Icon, label, value }, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 ${i === 0 ? "border-b border-black/5 pb-3" : "pt-3"}`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-copper/10 text-copper">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[11px] text-ink/55">{label}</span>
                  <span className="block text-sm font-semibold">{value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <svg
        className="absolute inset-x-0 bottom-0 hidden h-16 w-full text-cream lg:block"
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 64V14C140 52 300 64 520 64Z" fill="currentColor" />
      </svg>
    </section>
  );
}
