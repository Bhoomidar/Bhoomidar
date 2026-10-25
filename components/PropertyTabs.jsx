"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, CalendarCheck, FileText, Images, ListChecks, Star } from "lucide-react";

const ICONS = {
  "#photos": Images,
  "#about": FileText,
  "#why": Star,
  "#details": ListChecks,
  "#facilities": Building2,
  "#visit": CalendarCheck,
};

// Floating bar that jumps to a part of the property page (laptops). It stays
// under the menu while you scroll. The tab you click turns selected at once and
// stays selected until you scroll yourself; after that the bar follows the part
// you are reading. `items`: [["#photos", "Photos"], ...]
export default function PropertyTabs({ items }) {
  const [active, setActive] = useState(items[0]?.[0]);
  // true while the page is scrolling because of a click on a tab
  const picked = useRef(false);

  useEffect(() => {
    // "Book a visit" sits beside the other parts, so scrolling never selects it.
    const ids = items.map(([href]) => href).filter((href) => href !== "#visit");
    const release = () => {
      picked.current = false;
    };
    const onScroll = () => {
      if (picked.current) return;
      let current = ids[0];
      for (const href of ids) {
        const el = document.querySelector(href);
        if (el && el.getBoundingClientRect().top <= 230) current = href;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // the reader takes over: mouse wheel, finger, or keys
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("keydown", release);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
      window.removeEventListener("keydown", release);
    };
  }, [items]);

  return (
    <nav aria-label="On this page" className="sticky top-[76px] z-30 mt-8 hidden lg:block">
      <div className="container-x lg:!max-w-none lg:!px-[4.2vw]">
        <ul className="flex items-stretch rounded-full bg-white/95 px-3 shadow-[0_18px_40px_-22px_rgba(60,35,15,0.5)] ring-1 ring-black/5 backdrop-blur-md">
          {items.map(([href, label], i) => {
            const Icon = ICONS[href] ?? FileText;
            const on = active === href;
            return (
              <li key={href} className="relative flex flex-1 items-center justify-center">
                <a
                  href={href}
                  onClick={() => {
                    picked.current = true;
                    setActive(href);
                  }}
                  aria-current={on ? "true" : undefined}
                  className={`relative flex w-full items-center justify-center gap-3 py-5 text-[15px] font-semibold transition ${
                    on ? "text-copper-dark" : "text-ink/75 hover:text-copper-dark"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${on ? "text-copper" : "text-ink/60"}`} strokeWidth={1.6} />
                  {label}
                  <span
                    className={`absolute inset-x-6 bottom-0 h-[3px] rounded-full bg-copper transition ${
                      on ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </a>
                {i < items.length - 1 && (
                  <span className="absolute right-0 top-1/2 h-7 w-px -translate-y-1/2 bg-black/10" />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
