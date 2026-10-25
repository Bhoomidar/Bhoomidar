import { ArrowRight, Clock, FileText, Headset, Send } from "lucide-react";
import PropertiesHero from "@/components/PropertiesHero";
import PropertiesGrid from "@/components/PropertiesGrid";
import Reveal from "@/components/Reveal";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getCategories, getContent, getProperties } from "@/lib/content";
import { isOn } from "@/lib/siteContent";

export const metadata = {
  title: "Properties | Bhoomidar",
  description:
    "Choose from land and property in the best locations. Plots, villas, farm land and commercial plots.",
};

// Icons for the three small points in the "Cannot find what you need?" box.
const HELP_ICONS = [Headset, FileText, Clock];

export default async function PropertiesPage({ searchParams }) {
  const [c, properties, categories, params] = await Promise.all([
    getContent(),
    getProperties(),
    getCategories(),
    searchParams,
  ]);

  // From the search box: /properties?q=noida&type=Villa
  const q = typeof params?.q === "string" ? params.q.slice(0, 80) : "";
  const type =
    typeof params?.type === "string" && properties.some((p) => p.category === params.type) ? params.type : "";

  return (
    <main>
      <PropertiesHero
        image={c.hero_image}
        imageMobile={c.props_hero_image_mobile || c.hero_image_mobile}
        text={c.props_text}
      />

      <section id="listings" className="scroll-mt-4 bg-cream py-10 sm:py-14 lg:py-16">
        <div className="container-x lg:!max-w-none lg:!px-[4.2vw]">
          <PropertiesGrid properties={properties} categories={categories} initialType={type || "All"} initialQuery={q} />
        </div>
      </section>

      {isOn(c.show_props_help) && (
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fdf4e8] to-[#fbf0e2] py-14 sm:py-20 lg:py-24">
        {/* a thin curve and some dots */}
        <svg viewBox="0 0 400 300" fill="none" aria-hidden className="pointer-events-none absolute -left-4 bottom-0 hidden h-72 w-96 lg:block">
          <path d="M0 40C120 60 160 200 260 250S380 280 400 270" stroke="#d98b52" strokeOpacity="0.35" strokeWidth="1.2" />
        </svg>
        <svg viewBox="0 0 400 300" fill="none" aria-hidden className="pointer-events-none absolute -right-2 top-4 hidden h-72 w-96 lg:block">
          <path d="M400 70C300 90 230 150 220 300" stroke="#d98b52" strokeOpacity="0.4" strokeWidth="1.2" />
          <circle cx="300" cy="106" r="9" fill="#e3a874" />
        </svg>
        <div
          className="pointer-events-none absolute bottom-8 left-8 hidden h-24 w-32 opacity-50 sm:block"
          style={{ backgroundImage: "radial-gradient(circle, #b5622f 1.4px, transparent 1.4px)", backgroundSize: "18px 18px" }}
        />

        <Reveal className="container-x relative text-center">
          {c.props_help_label && (
            <p className="flex items-center justify-center gap-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-copper-dark">
              <span className="h-px w-14 bg-copper/60" />
              {c.props_help_label}
              <span className="h-px w-14 bg-copper/60" />
            </p>
          )}
          <h2 className="mt-4 font-display text-3xl font-bold leading-[1.2] text-ink sm:text-5xl">
            {c.props_help_title_1} <span className="text-copper">{c.props_help_title_accent}</span>
          </h2>
          {c.props_help_text && (
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink/60 sm:text-lg">{c.props_help_text}</p>
          )}

          <ul className="mx-auto mt-9 flex max-w-4xl flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-0">
            {[1, 2, 3].map((n) => {
              const text = c[`props_help_pt${n}`];
              if (!text) return null;
              const Icon = HELP_ICONS[n - 1];
              return (
                <li
                  key={n}
                  className="flex items-center gap-4 text-left sm:border-l sm:border-copper/25 sm:px-8 sm:first:border-l-0 sm:first:pl-0 sm:last:pr-0"
                >
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#f9e3cf] text-copper-dark shadow-inner">
                    <Icon className="h-7 w-7" strokeWidth={1.5} />
                  </span>
                  <span className="max-w-[170px] text-[15px] font-medium leading-snug text-ink">{text}</span>
                </li>
              );
            })}
          </ul>

          {c.props_help_btn && (
            <div className="relative mt-10 inline-block">
              <svg viewBox="0 0 40 40" fill="none" aria-hidden className="pointer-events-none absolute -left-14 top-1/2 hidden h-10 w-10 -translate-y-1/2 sm:block">
                <path d="M30 6 22 14M36 20H24M30 34l-8-8" stroke="#d98b52" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <svg viewBox="0 0 40 40" fill="none" aria-hidden className="pointer-events-none absolute -right-14 top-1/2 hidden h-10 w-10 -translate-y-1/2 sm:block">
                <path d="M10 6l8 8M4 20h12M10 34l8-8" stroke="#d98b52" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <a
                href={c.props_help_link || "/contact"}
                className="group inline-flex items-center justify-center gap-4 rounded-2xl bg-gradient-to-b from-copper-light to-copper-dark px-12 py-4 text-lg font-semibold text-white shadow-[0_24px_44px_-14px_rgba(140,72,33,0.7)] transition hover:-translate-y-0.5"
              >
                <Send className="h-5 w-5" />
                {c.props_help_btn}
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </a>
            </div>
          )}
        </Reveal>
      </section>
      )}

      <CTA c={c} />
      <Footer />
    </main>
  );
}
