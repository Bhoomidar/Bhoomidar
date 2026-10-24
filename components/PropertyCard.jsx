import Image from "next/image";
import { ArrowRight, Home } from "lucide-react";
import { CATEGORY_ICONS, DETAIL_ICONS } from "@/lib/icons";

// "Hot Deal" is red, every other badge ("New Launch", ...) is orange.
const badgeTone = (text) => (/hot/i.test(text) ? "bg-[#e5473d]" : "bg-[#f07b3f]");

// One property card. Used on the home page and on the Properties page.
export default function PropertyCard({ p }) {
  const CategoryIcon = CATEGORY_ICONS[p.category] ?? Home;
  // Properties with a page go there; the built-in samples (no page) go to the contact page.
  const href = p.slug ? `/properties/${p.slug}` : "/contact";

  return (
    <article className="group flex h-full flex-col rounded-2xl bg-white p-1.5 shadow-[0_14px_34px_-14px_rgba(60,35,15,0.28)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_48px_-16px_rgba(60,35,15,0.38)] sm:p-2.5">
      <div className="relative h-28 shrink-0 overflow-hidden rounded-xl bg-[#f1e6d4] sm:h-52">
        {p.image_url && (
          <Image
            src={p.image_url}
            alt={p.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        )}

        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-1.5 py-1 text-[9px] font-semibold text-ink shadow sm:left-3 sm:top-3 sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-xs">
          <CategoryIcon className="h-3 w-3 text-copper sm:h-3.5 sm:w-3.5" />
          {p.category}
        </span>

        {p.badge && (
          <span
            className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-semibold text-white shadow sm:right-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[11px] ${badgeTone(p.badge)}`}
          >
            {p.badge}
          </span>
        )}

        <a
          href={href}
          aria-label={`See ${p.title}`}
          className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-night/85 text-white shadow-lg backdrop-blur transition hover:bg-copper-dark sm:bottom-3 sm:right-3 sm:h-10 sm:w-10"
        >
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </a>
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-2 sm:px-3 sm:pb-2.5 sm:pt-4">
        <h3 className="text-sm font-bold leading-tight sm:text-lg">
          <a href={href} className="transition hover:text-copper-dark">
            {p.title}
          </a>
        </h3>
        {/* on phones only the first three lines show, so the cards stay short */}
        <ul className="mt-1.5 space-y-1 sm:mt-3.5 sm:space-y-2.5">
          {(p.details ?? []).map(({ icon, text }, idx) => {
            const Icon = DETAIL_ICONS[icon] ?? DETAIL_ICONS.MapPin;
            return (
              <li
                key={idx}
                className={`items-start gap-1.5 text-[11px] leading-snug text-ink/70 sm:flex sm:items-center sm:gap-2.5 sm:text-[13px] ${
                  idx >= 3 ? "hidden" : "flex"
                }`}
              >
                <Icon className="mt-px h-3.5 w-3.5 shrink-0 text-copper sm:mt-0 sm:h-4 sm:w-4" />
                {text}
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex flex-col items-stretch gap-1.5 pt-2 sm:flex-row sm:items-end sm:justify-between sm:gap-2 sm:pt-5">
          <div className="min-w-0 leading-tight">
            <p className="text-[15px] font-bold sm:text-2xl">{p.price}</p>
            <p className="mt-0.5 text-[10px] text-ink/55 sm:text-xs">{p.unit}</p>
          </div>
          <a
            href={href}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-copper-light to-copper-dark px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-copper/25 transition hover:brightness-110 sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
          >
            Explore
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
