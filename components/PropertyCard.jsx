import Image from "next/image";
import { ArrowRight, Home } from "lucide-react";
import { CATEGORY_ICONS, DETAIL_ICONS } from "@/lib/icons";

// One property card. Used on the home page and on the Properties page.
export default function PropertyCard({ p }) {
  const CategoryIcon = CATEGORY_ICONS[p.category] ?? Home;

  return (
    <article className="group h-full rounded-2xl bg-white p-1.5 shadow-[0_10px_30px_-12px_rgba(60,35,15,0.25)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_44px_-16px_rgba(60,35,15,0.35)] sm:p-2">
      <div className="relative h-32 overflow-hidden rounded-xl bg-[#f1e6d4] sm:h-52">
        {p.image_url && (
          <Image
            src={p.image_url}
            alt={p.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        )}
        {p.badge && (
          <span className="absolute right-2 top-2 rounded-full bg-[#2f6fd6] px-2 py-0.5 text-[9px] font-semibold text-white shadow sm:right-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[10px]">
            {p.badge}
          </span>
        )}
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#f8f1e6]/95 px-2 py-1 text-[10px] font-semibold text-ink shadow sm:bottom-3 sm:left-3 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[11px]">
          <CategoryIcon className="h-3 w-3 text-copper sm:h-3.5 sm:w-3.5" />
          {p.category}
        </span>
      </div>

      <div className="px-1.5 pb-1.5 pt-3 sm:px-3 sm:pb-3 sm:pt-4">
        <h3 className="text-sm font-bold sm:text-base">{p.title}</h3>
        <ul className="mt-2.5 space-y-2 sm:mt-4 sm:space-y-2.5">
          {(p.details ?? []).map(({ icon, text }, idx) => {
            const Icon = DETAIL_ICONS[icon] ?? DETAIL_ICONS.MapPin;
            return (
              <li
                key={idx}
                className="flex items-start gap-1.5 text-[11.5px] leading-snug text-ink/70 sm:items-center sm:gap-2.5 sm:text-[13px]"
              >
                <Icon className="mt-px h-3.5 w-3.5 shrink-0 text-copper sm:mt-0 sm:h-4 sm:w-4" />
                {text}
              </li>
            );
          })}
        </ul>

        <div className="mt-3 flex items-end justify-between gap-1 border-t border-black/5 pt-3 sm:mt-5 sm:pt-4">
          <div className="min-w-0 leading-tight">
            <p className="text-[15px] font-bold sm:text-2xl">{p.price}</p>
            <p className="text-[10px] text-ink/55 sm:text-xs">{p.unit}</p>
          </div>
          <a
            href="/contact"
            aria-label={`Enquire about ${p.title}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md transition hover:brightness-110 sm:h-11 sm:w-11"
          >
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
