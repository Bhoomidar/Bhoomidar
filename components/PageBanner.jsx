import Image from "next/image";
import Navbar from "./Navbar";

// Dark photo banner at the top of inner pages. `children` is the heading.
export default function PageBanner({ image, label, text, actions, children }) {
  return (
    <section className="relative overflow-hidden bg-night">
      <Image
        src={image}
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
          {label}
        </p>
        <h1 className="mt-4 font-display text-[38px] font-bold leading-[1.15] text-white sm:mt-5 sm:text-6xl lg:text-[64px]">
          {children}
        </h1>
        {text && (
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 lg:text-lg">
            {text}
          </p>
        )}
        {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>}
      </div>
    </section>
  );
}
