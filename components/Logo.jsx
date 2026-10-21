import Image from "next/image";

// The logo has dark green letters, so on a DARK background it sits inside a
// white rounded badge to stay readable (the default). On a LIGHT background
// pass `dark` and it is shown as it is. `size` = height of the logo (Tailwind).
// NOTE: the file name is versioned on purpose. If you replace the logo, save it
// under a NEW name and update `src` here, otherwise Next serves the cached old one.
export default function Logo({ className = "", dark = false, size = "h-12" }) {
  const logo = (
    <Image
      src="/images/bhoomidar-logo.png"
      alt="Bhoomidar - Trusted Land, Brighter Tomorrow"
      width={1100}
      height={303}
      priority
      className={`${size} w-auto`}
    />
  );

  return (
    <a href="/" aria-label="Bhoomidar home" className={`inline-flex ${className}`}>
      {dark ? (
        logo
      ) : (
        <span className="rounded-xl bg-white/95 px-3 py-1.5 shadow-lg shadow-black/25 ring-1 ring-black/5">
          {logo}
        </span>
      )}
    </a>
  );
}
