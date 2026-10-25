import Image from "next/image";
import { ArrowRight, ChartNoAxesColumnIncreasing, FileCheck2, MapPin, Users } from "lucide-react";
import Reveal from "./Reveal";

const ICONS = [FileCheck2, MapPin, ChartNoAxesColumnIncreasing, Users];

export default function WhyChoose({ c }) {
  return (
    <section
      id="about"
      className="relative flex items-center overflow-hidden bg-gradient-to-b from-[#fdf7ec] to-[#f6e7d0] pb-64 pt-16 sm:pb-80 lg:min-h-[min(100svh,60rem)] lg:items-start lg:pb-24 lg:pt-[max(8.5rem,15svh)]"
    >
      {/* the picture: a house and hills in warm light, along the bottom */}
      <Image
        src={c.why_image}
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none hidden object-cover object-bottom lg:block"
      />
      {/* phones: a tall picture in its own box along the bottom, fading into the cream at its top */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 aspect-[842/1867] w-full overflow-hidden lg:hidden"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, #000 22%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 22%)",
        }}
        aria-hidden
      >
        <Image
          src={c.why_image_mobile || c.why_image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-[#fdf6ea]/90 to-transparent lg:hidden" />
      {/* washed into the cream, so the words on top can be read */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block lg:[mask-image:radial-gradient(circle_at_0_0,transparent_90px,#000_230px)]"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdf6ea] via-[#fdf6ea]/80 to-[#fdf6ea]/0" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff5e6]/30 to-transparent" />
      </div>
      <div
        className="pointer-events-none absolute hidden rounded-full bg-[#f6dfbf]/55 lg:block"
        style={{ left: "91%", top: "-9vw", width: "18vw", height: "18vw" }}
      />
      <div
        className="pointer-events-none absolute hidden rounded-full border border-copper/20 lg:block"
        style={{ left: "75%", top: "-16.4vw", width: "39.5vw", height: "39.5vw" }}
      />

      <div className="container-x relative grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,55%)] lg:items-start lg:gap-12 lg:!max-w-none lg:!px-[4.2vw]">
        <Reveal>
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
            <span className="h-px w-8 bg-copper" />
            {c.why_label}
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-[1.25] text-ink sm:text-5xl lg:text-[48px]">
            {c.why_title_1}
            <br />
            {c.why_title_2} <span className="text-copper">{c.why_title_accent}</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink/75">
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

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-8">
          {ICONS.map((Icon, i) => (
            <Reveal key={i} delay={i * 100} className="h-full">
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-white/65 to-[#fbefdc]/55 p-4 shadow-[0_18px_40px_-22px_rgba(110,60,20,0.4)] ring-1 ring-white/80 backdrop-blur-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_50px_-20px_rgba(110,60,20,0.5)] sm:p-6 lg:px-8 lg:py-7">
                {/* a soft shape and a big faint icon in the corner */}
                <div className="pointer-events-none absolute bottom-0 right-0 h-[72%] w-[62%] rounded-tl-[100%] bg-gradient-to-tl from-[#f3dfc3]/55 to-[#f3dfc3]/0" />
                <Icon
                  className="pointer-events-none absolute bottom-4 right-4 h-10 w-10 text-copper/[0.13] sm:bottom-6 sm:right-6 sm:h-14 sm:w-14 lg:bottom-7 lg:right-7 lg:h-16 lg:w-16"
                  strokeWidth={1.4}
                />

                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a85f2e] to-[#5a2a0e] text-[#f6d9b8] shadow-lg shadow-copper/30 transition group-hover:scale-105 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" strokeWidth={1.7} />
                </span>

                <span className="relative mt-3 block font-display text-base font-bold leading-snug text-ink sm:mt-4 sm:text-xl lg:mt-5">
                  {c[`why${i + 1}_title`]}
                </span>
                <span className="relative mt-2.5 block h-0.5 w-9 rounded-full bg-copper sm:mt-3 lg:mt-4" />
                <span className="relative mt-2.5 block pr-5 text-[13px] leading-snug text-ink/70 sm:mt-3 sm:max-w-[13rem] sm:pr-0 sm:text-sm sm:leading-relaxed lg:mt-3.5 lg:max-w-[14rem]">
                  {c[`why${i + 1}_text`]}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
