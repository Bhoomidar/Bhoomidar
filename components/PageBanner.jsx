import Image from "next/image";
import Navbar from "./Navbar";

// Dark photo banner at the top of inner pages. `children` is the heading.
// Optional: a separate phone photo (`imageMobile`), where the photo is focused
// (`position` / `positionMobile`, CSS object-position) and an extra black layer
// (`darkness` / `darknessMobile`, 0 to 1). See bannerProps() in lib/siteContent.
export default function PageBanner({
  image,
  imageMobile,
  position = "50% 50%",
  positionMobile = "50% 50%",
  darkness = 0,
  darknessMobile = 0,
  label,
  text,
  actions,
  children,
}) {
  return (
    <section className="relative overflow-hidden bg-night">
      {imageMobile ? (
        <>
          <Image
            src={imageMobile}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectPosition: positionMobile }}
            className="zoom-in-slow object-cover lg:hidden"
          />
          <Image
            src={image}
            alt=""
            fill
            sizes="100vw"
            style={{ objectPosition: position }}
            className="zoom-in-slow hidden object-cover lg:block"
          />
        </>
      ) : (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ "--pos-phone": positionMobile, "--pos-laptop": position }}
          className="zoom-in-slow object-cover [object-position:var(--pos-phone)] lg:[object-position:var(--pos-laptop)]"
        />
      )}
      {darknessMobile > 0 && (
        <div
          className="absolute inset-0 lg:hidden"
          style={{ backgroundColor: `rgba(0,0,0,${darknessMobile})` }}
        />
      )}
      {darkness > 0 && (
        <div
          className="absolute inset-0 hidden lg:block"
          style={{ backgroundColor: `rgba(0,0,0,${darkness})` }}
        />
      )}
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
