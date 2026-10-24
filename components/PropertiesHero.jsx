import Image from "next/image";
import { FileText, MapPin, ShieldCheck, Users } from "lucide-react";
import Navbar from "./Navbar";

const TRUST = [
  { icon: ShieldCheck, lines: ["Verified", "Properties"] },
  { icon: FileText, lines: ["Clear", "Documents"] },
  { icon: MapPin, lines: ["Prime", "Locations"] },
  { icon: Users, lines: ["Expert", "Guidance"] },
];

// Top of the Properties page: photo, heading and four promises.
export default function PropertiesHero({ image, imageMobile, text }) {
  return (
    <section className="relative overflow-hidden bg-night max-lg:aspect-[848/1855] lg:min-h-[min(84svh,50rem)]">
      {imageMobile ? (
        <>
          <Image src={imageMobile} alt="" fill priority sizes="100vw" className="zoom-in-slow object-cover object-bottom lg:hidden" />
          <Image src={image} alt="" fill sizes="100vw" className="zoom-in-slow hidden object-cover object-[75%_50%] lg:block" />
        </>
      ) : (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="zoom-in-slow object-cover object-[72%_50%] lg:object-[75%_50%]"
        />
      )}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-[#050b14]/95 via-[#050b14]/65 to-transparent lg:block" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent lg:from-black/60 lg:to-black/40" />

      <Navbar />

      <div className="fade-up container-x relative pb-8 pt-28 sm:pt-36 lg:flex lg:min-h-[inherit] lg:flex-col lg:justify-center lg:pb-16 lg:pt-36 lg:!max-w-none lg:!px-[4.2vw]">
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-copper-light">
          <span className="h-px w-10 bg-copper-light" />
          Our Properties
        </p>
        <h1 className="mt-4 font-display text-[44px] font-bold leading-[1.06] text-white sm:mt-5 sm:text-6xl lg:text-[min(88px,9.5vh)]">
          Find Your
          <span className="block text-copper-light">Perfect Land</span>
        </h1>
        {text && <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-xl lg:max-w-[38rem] lg:text-[min(22px,2.5vh)]">{text}</p>}

        {/* promises */}
        <ul className="mt-7 grid grid-cols-4 sm:mt-9 sm:flex sm:flex-wrap sm:items-center sm:gap-y-4 lg:mt-10">
          {TRUST.map(({ icon: Icon, lines }, i) => (
            <li key={lines[0]} className="flex flex-col items-center gap-2.5 border-l border-white/20 text-center first:border-l-0 sm:flex-row sm:gap-3.5 sm:border-0 sm:pr-7 sm:text-left">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2a1608]/80 text-copper-light ring-1 ring-copper/50 sm:h-14 sm:w-14">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} />
              </span>
              <span className="text-[13px] font-medium leading-tight text-white min-[400px]:text-sm sm:text-base">
                {lines[0]}
                <br />
                {lines[1]}
              </span>
              {i < TRUST.length - 1 && <span className="ml-3 hidden h-9 w-px bg-white/20 sm:block" />}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
