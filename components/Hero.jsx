import Image from "next/image";
import { ArrowRight, FileText, Home, MapPin, PhoneCall, TrendingUp, Users } from "lucide-react";
import Navbar from "./Navbar";
import { isOn, num } from "@/lib/siteContent";

const STAT_ICONS = [MapPin, Users, FileText, TrendingUp];

export default function Hero({ c }) {
  // Phones can have their own (taller) photo. Without one, the laptop photo is
  // shown as a band, focused where the admin set it.
  const mobileImage = c.hero_image_mobile;
  const laptopPos = `${num(c.hero_image_pos_x, 100)}% ${num(c.hero_image_pos_y, 50)}%`;
  const phonePos = `${num(c.hero_image_mobile_pos_x, 78)}% ${num(c.hero_image_mobile_pos_y, 50)}%`;
  const laptopDark = num(c.hero_overlay, 0) / 100;
  const phoneDark = num(c.hero_overlay_mobile, 0) / 100;

  const showBadge = isOn(c.hero_show_badge) && c.hero_badge;
  const showCard = isOn(c.hero_show_card);
  const showStats = isOn(c.hero_show_stats);

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
            style={{ objectPosition: phonePos }}
            className="zoom-in-slow object-cover lg:hidden"
          />
          <Image
            src={c.hero_image}
            alt=""
            fill
            sizes="100vw"
            style={{ objectPosition: laptopPos }}
            className="zoom-in-slow hidden object-cover lg:block"
          />
        </>
      ) : (
        <>
          {/* Phones: the photo fills the screen, focused on the house. */}
          <div className="absolute inset-0 bg-night lg:hidden" />
          <Image
            src={c.hero_image}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectPosition: phonePos }}
            className="zoom-in-slow object-cover lg:hidden"
          />
          <Image
            src={c.hero_image}
            alt=""
            fill
            sizes="100vw"
            style={{ objectPosition: laptopPos }}
            className="zoom-in-slow hidden object-cover lg:block"
          />
        </>
      )}
      {phoneDark > 0 && (
        <div
          className="absolute inset-0 lg:hidden"
          style={{ backgroundColor: `rgba(0,0,0,${phoneDark})` }}
        />
      )}
      {laptopDark > 0 && (
        <div
          className="absolute inset-0 hidden lg:block"
          style={{ backgroundColor: `rgba(0,0,0,${laptopDark})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/75 lg:bg-gradient-to-r lg:from-[#060d18]/90 lg:via-[#060d18]/55 lg:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent lg:hidden" />
      <div className="absolute inset-0 hidden bg-gradient-to-b from-black/50 via-transparent to-transparent lg:block" />

      <Navbar />

      <div className="container-x relative flex flex-1 flex-col justify-between gap-6 pb-5 pt-[88px] lg:block lg:flex-none lg:pb-14 lg:pt-[max(7.75rem,min(10rem,17vh))] lg:!max-w-none lg:!px-[4.2vw]">
        <div className="max-w-2xl lg:max-w-[44rem]">
          {showBadge && (
            <span
              style={{ animationDelay: "100ms" }}
              className="fade-up inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-black/25 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur lg:px-5 lg:py-2.5 lg:text-xs lg:tracking-[0.24em]"
            >
              <Home className="h-3 w-3 text-copper-light lg:h-4 lg:w-4" />
              {c.hero_badge}
            </span>
          )}

          <h1
            style={{ animationDelay: "250ms" }}
            className={`fade-up ${showBadge ? "mt-4 sm:mt-5" : ""} font-display text-[38px] font-bold leading-[1.1] text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.8),0_4px_24px_rgba(0,0,0,0.7)] sm:text-6xl lg:text-[min(84px,9vh)] lg:leading-[1.06] lg:[text-shadow:none]`}
          >
            {c.hero_title_1}
            <span className="block text-copper-light">{c.hero_title_2}</span>
            <span className="block">
              <span className="relative inline-block">
                {c.hero_title_3}
                <svg
                  className="absolute -bottom-2.5 left-0 h-2.5 w-full text-copper-light lg:hidden"
                  viewBox="0 0 120 10"
                  preserveAspectRatio="none"
                  fill="none"
                  aria-hidden
                >
                  <path d="M2 8C30 2 80 1 118 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                </svg>
              </span>
            </span>
          </h1>

          <p
            style={{ animationDelay: "400ms" }}
            className="fade-up mt-6 max-w-xl whitespace-pre-line text-[15px] font-normal leading-snug text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.85),0_2px_16px_rgba(0,0,0,0.7)] sm:mt-5 sm:text-xl lg:text-[min(22px,2.4vh)] lg:font-normal lg:text-white/90 lg:[text-shadow:none]"
          >
            {c.hero_lead}
          </p>
          <p
            style={{ animationDelay: "500ms" }}
            className="fade-up mt-3 hidden max-w-xl text-base leading-relaxed text-white/80 sm:block lg:mt-1 lg:text-[min(20px,2.2vh)] lg:leading-snug lg:text-white/80"
          >
            {c.hero_text}
          </p>

          <div
            style={{ animationDelay: "650ms" }}
            className="fade-up mt-6 flex flex-row flex-wrap items-center gap-3 sm:gap-4 lg:mt-7"
          >
            {c.hero_btn1 && (
              <a
                href={c.hero_btn1_link || "#properties"}
                className="inline-flex w-auto items-center justify-center gap-3 rounded-lg bg-gradient-to-b from-copper-light to-copper-dark px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:brightness-110 sm:w-auto sm:rounded-md sm:py-3.5 lg:rounded-lg lg:px-9 lg:py-[min(1rem,1.9vh)] lg:text-[17px]"
              >
                {c.hero_btn1} <ArrowRight className="hidden h-4 w-4 lg:block" />
              </a>
            )}
            {c.hero_btn2 && (
              <a
                href={c.hero_btn2_link || "/contact"}
                className="inline-flex w-auto items-center justify-center gap-3 rounded-lg border border-white/35 bg-black/30 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 sm:w-auto sm:rounded-md sm:py-3.5 lg:rounded-lg lg:border-white/30 lg:px-9 lg:py-[min(1rem,1.9vh)] lg:text-[17px]"
              >
                <PhoneCall className="h-[18px] w-[18px]" />
                {c.hero_btn2}
              </a>
            )}
          </div>
        </div>

        <div>
          {showStats && (
          <div
            style={{ animationDelay: "800ms" }}
            className="fade-up mt-5 grid grid-cols-4 rounded-2xl border border-white/10 bg-black/35 px-0 py-3.5 backdrop-blur-md sm:mt-7 sm:w-fit sm:px-3 sm:py-4 lg:mt-[min(2.25rem,4vh)] lg:py-[min(1.25rem,2.4vh)]"
          >
            {STAT_ICONS.map((Icon, i) => (
              <div key={i} className="flex min-w-0 flex-col items-start gap-2 border-l border-white/10 px-2 first:border-l-0 min-[400px]:px-2.5 sm:flex-row sm:items-center sm:gap-3 sm:px-5 lg:px-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-copper-light ring-1 ring-copper/40 sm:h-14 sm:w-14">
                  <Icon className="h-[18px] w-[18px] sm:h-6 sm:w-6" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block whitespace-nowrap text-[12px] font-bold text-white min-[375px]:text-[13px] min-[400px]:text-sm sm:text-base lg:text-lg">
                    {c[`hero_stat${i + 1}_value`]}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-white/70 sm:text-sm lg:text-[13px] lg:text-white/65">
                    {c[`hero_stat${i + 1}_label`]}
                  </span>
                </span>
              </div>
            ))}
          </div>
          )}

        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="container-x relative h-full lg:!max-w-none lg:!px-[4.2vw]">
          {showCard && (
          <div className="float-slow absolute bottom-[6rem] right-[4.2vw] w-[22.5rem] rounded-2xl bg-white p-5 shadow-2xl">
            {cardRows.map(({ icon: Icon, label, value }, i) => (
              <div
                key={i}
                className={`flex items-center gap-3.5 ${i === 0 ? "border-b border-black/5 pb-3.5" : "pt-3.5"}`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f6e9d6] text-copper">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-xs text-ink/55">{label}</span>
                  <span className="mt-0.5 block truncate text-base font-semibold text-ink">{value}</span>
                </span>
                {i === 1 && (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-md ring-1 ring-black/5">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
