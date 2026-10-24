import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BedDouble,
  Building2,
  Check,
  ChevronRight,
  Home,
  IndianRupee,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PropertyGallery from "@/components/PropertyGallery";
import PropertyEnquiry from "@/components/PropertyEnquiry";
import PropertyShare from "@/components/PropertyShare";
import PropertyCard from "@/components/PropertyCard";
import Reveal from "@/components/Reveal";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getContent, getProperties } from "@/lib/content";
import { CATEGORY_ICONS, DETAIL_ICONS } from "@/lib/icons";
import { phoneHref } from "@/lib/siteContent";

// The contact form's own names for each kind of property.
const INTEREST = {
  Residential: "Residential Plots",
  Villa: "Premium Villas",
  "Farm Land": "Farm Land",
  Commercial: "Commercial Plots",
};

// A picture for a fact box, chosen from its label.
function specIcon(label = "") {
  const l = label.toLowerCase();
  if (/size|area|acre|yard|plot/.test(l)) return Ruler;
  if (/location|place|city|address/.test(l)) return MapPin;
  if (/paper|legal|approval|title|document/.test(l)) return ShieldCheck;
  if (/bed|bhk|room/.test(l)) return BedDouble;
  if (/price|cost|rate/.test(l)) return IndianRupee;
  if (/type|kind|use/.test(l)) return Building2;
  return Sparkles;
}

const list = (v) => (Array.isArray(v) ? v : []);
const photos = (p) =>
  [...new Set([p.image_url, ...list(p.gallery)].filter((u) => typeof u === "string" && u))];

async function find(slug) {
  const properties = await getProperties();
  return { properties, property: properties.find((p) => p.slug === slug) };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { property: p } = await find(slug);
  if (!p) return { title: "Property not found | Bhoomidar" };
  const text = p.tagline || p.description?.split("\n")[0] || `${p.title} - ${p.location}`;
  return {
    title: `${p.title} | Bhoomidar`,
    description: text,
    openGraph: { title: p.title, description: text, images: p.image_url ? [p.image_url] : undefined },
  };
}

export default async function PropertyPage({ params }) {
  const { slug } = await params;
  const [c, { properties, property: p }] = await Promise.all([getContent(), find(slug)]);
  if (!p) notFound();

  const images = photos(p);
  const hero = images[0];
  const CategoryIcon = CATEGORY_ICONS[p.category] ?? Home;
  const paragraphs = String(p.description ?? "").split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);
  const highlights = list(p.highlights);
  const specs = list(p.specs);
  const amenities = list(p.amenities);
  const details = list(p.details);
  const related = properties.filter((x) => x.id !== p.id).slice(0, 3);

  const digits = String(c.contact_phone ?? "").replace(/\D/g, "");
  const wa = digits.length === 10 ? `91${digits}` : digits;
  const waText = encodeURIComponent(`Hello, I want to know more about ${p.title}${p.location ? ` (${p.location})` : ""}.`);

  return (
    <main className="max-lg:bg-night max-lg:pb-20">
      {/* top: the photo, the name and where it is */}
      <section className="relative overflow-hidden bg-night">
        {hero && <Image src={hero} alt="" fill priority sizes="100vw" className="zoom-in-slow object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050b14]/95 via-[#050b14]/70 to-[#050b14]/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

        <Navbar />

        <div className="fade-up container-x relative pb-28 pt-32 sm:pb-32 sm:pt-36 lg:!max-w-none lg:!px-[4.2vw] lg:pb-36 lg:pt-40">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-white/70">
            <a href="/" className="transition hover:text-white">Home</a>
            <ChevronRight className="h-3.5 w-3.5" />
            <a href="/properties" className="transition hover:text-white">Properties</a>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-copper-light">{p.title}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-ink shadow">
              <CategoryIcon className="h-3.5 w-3.5 text-copper" />
              {p.category}
            </span>
            {p.badge && (
              <span
                className={`rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow ${
                  /hot/i.test(p.badge) ? "bg-[#e5473d]" : "bg-[#f07b3f]"
                }`}
              >
                {p.badge}
              </span>
            )}
            <PropertyShare title={p.title} />
          </div>

          <h1 className="mt-5 max-w-4xl font-display text-[40px] font-bold leading-[1.08] text-white sm:text-6xl lg:text-[4.6rem]">
            {p.title}
          </h1>
          {p.location && (
            <p className="mt-5 flex items-center gap-2.5 text-lg text-white/90">
              <MapPin className="h-5 w-5 text-copper-light" />
              {p.location}
              {p.map_url && (
                <a
                  href={p.map_url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 text-sm font-semibold text-copper-light underline-offset-4 hover:underline"
                >
                  View on map
                </a>
              )}
            </p>
          )}
          {p.tagline && <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-xl">{p.tagline}</p>}
        </div>
      </section>

      {/* a strip that sits over the photo: price, quick facts, buttons */}
      <section className="relative z-10 -mt-16 bg-cream sm:-mt-20">
        <div className="container-x lg:!max-w-none lg:!px-[4.2vw]">
          <Reveal>
            <div className="grid gap-5 rounded-3xl bg-white p-5 shadow-[0_30px_70px_-30px_rgba(60,35,15,0.55)] ring-1 ring-black/5 sm:gap-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10">
              <div className="leading-tight">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">{p.unit || "Price"}</p>
                <p className="mt-1 text-4xl font-extrabold tabular-nums text-copper-dark sm:mt-1.5 sm:text-5xl">{p.price}</p>
              </div>

              <ul className="grid grid-cols-1 gap-x-8 gap-y-3 border-t border-black/5 pt-5 min-[420px]:grid-cols-2 sm:pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                {details.map(({ icon, text }, i) => {
                  const Icon = DETAIL_ICONS[icon] ?? DETAIL_ICONS.MapPin;
                  return (
                    <li key={i} className="flex items-center gap-3 text-sm text-ink/80 sm:text-[15px]">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper">
                        <Icon className="h-4 w-4" />
                      </span>
                      {text}
                    </li>
                  );
                })}
              </ul>

              <div className="hidden flex-col gap-3 sm:flex sm:flex-row lg:flex-col">
                <a
                  href="#visit"
                  className="btn-shimmer group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5"
                >
                  Book a site visit
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </a>
                <a
                  href={phoneHref(c.contact_phone)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-copper/40 px-7 py-3.5 text-sm font-semibold text-copper-dark transition hover:bg-copper hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  {c.contact_phone}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* jump to a part of the page, stays under the menu while you scroll (laptops) */}
      <nav
        aria-label="On this page"
        className="sticky top-[76px] z-30 mt-10 hidden border-y border-black/5 bg-white/90 backdrop-blur-md lg:block"
      >
        <ul className="container-x flex gap-2 py-3 lg:!max-w-none lg:!px-[4.2vw]">
          {[
            ["#photos", "Photos"],
            ...(paragraphs.length ? [["#about", "About"]] : []),
            ...(highlights.length ? [["#why", "Highlights"]] : []),
            ...(specs.length ? [["#details", "Key details"]] : []),
            ...(amenities.length ? [["#facilities", "Facilities"]] : []),
            ["#visit", "Book a visit"],
          ].map(([href, label]) => (
            <li key={href}>
              <a
                href={href}
                className="inline-flex rounded-full px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-copper/10 hover:text-copper-dark"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* the photos */}
      <section id="photos" className="scroll-mt-36 bg-cream pt-8 sm:pt-10">
        <div className="container-x lg:!max-w-none lg:!px-[4.2vw]">
          <Reveal>
            <PropertyGallery images={images} title={p.title} />
          </Reveal>
        </div>
      </section>

      {/* the story */}
      <section className="bg-cream py-12 sm:py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14 lg:!max-w-none lg:!px-[4.2vw] xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="space-y-12">
            {paragraphs.length > 0 && (
              <Reveal>
                <h2 id="about" className="scroll-mt-36 font-display text-3xl font-bold text-ink sm:text-4xl">
                  About this <span className="text-copper">property</span>
                </h2>
                <div className="mt-5 space-y-4 text-base leading-relaxed text-ink/75 sm:text-[17px]">
                  {paragraphs.map((t, i) => (
                    <p key={i}>{t}</p>
                  ))}
                </div>
              </Reveal>
            )}

            {highlights.length > 0 && (
              <Reveal>
                <h2 id="why" className="scroll-mt-36 font-display text-3xl font-bold text-ink sm:text-4xl">
                  Why you will <span className="text-copper">like it</span>
                </h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {highlights.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3.5 rounded-2xl bg-white p-4 text-[15px] leading-snug text-ink/80 shadow-[0_14px_30px_-22px_rgba(110,60,20,0.4)] ring-1 ring-black/5"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {specs.length > 0 && (
              <Reveal>
                <h2 id="details" className="scroll-mt-36 font-display text-3xl font-bold text-ink sm:text-4xl">
                  Key <span className="text-copper">details</span>
                </h2>
                <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {specs.map(({ label, value }, i) => {
                    const Icon = specIcon(label);
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-white to-[#fff6ea] p-5 shadow-[0_14px_30px_-22px_rgba(110,60,20,0.4)] ring-1 ring-copper/10"
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/25">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 leading-tight">
                          <dt className="text-xs text-ink/55">{label}</dt>
                          <dd className="mt-1 text-[15px] font-bold text-ink">{value}</dd>
                        </span>
                      </div>
                    );
                  })}
                </dl>
              </Reveal>
            )}

            {amenities.length > 0 && (
              <Reveal>
                <h2 id="facilities" className="scroll-mt-36 font-display text-3xl font-bold text-ink sm:text-4xl">
                  Facilities & <span className="text-copper">amenities</span>
                </h2>
                <ul className="mt-6 flex flex-wrap gap-3">
                  {amenities.map((t, i) => (
                    <li
                      key={i}
                      className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-ink/80 shadow-sm ring-1 ring-black/5"
                    >
                      <Check className="h-4 w-4 text-copper" strokeWidth={2.5} />
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          <aside id="visit" className="scroll-mt-36">
            <div className="lg:sticky lg:top-28">
              <Reveal delay={100}>
                <PropertyEnquiry
                  title={p.title}
                  interest={INTEREST[p.category] ?? "Something else"}
                  price={p.price}
                  unit={p.unit}
                  phone={c.contact_phone}
                  phoneLink={phoneHref(c.contact_phone)}
                  whatsappLink={`https://wa.me/${wa}?text=${waText}`}
                />
              </Reveal>
            </div>
          </aside>
        </div>
      </section>

      {/* more to see */}
      {related.length > 0 && (
        <section className="bg-gradient-to-b from-cream to-[#f6ecdc] pb-16 sm:pb-20">
          <div className="container-x lg:!max-w-none lg:!px-[4.2vw]">
            <Reveal className="flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
                More <span className="text-copper">properties</span>
              </h2>
              <a href="/properties" className="group hidden items-center gap-2 text-sm font-semibold text-copper-dark sm:inline-flex">
                See all
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>
            </Reveal>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {related.map((x, i) => (
                <Reveal key={x.id} delay={i * 100} className="h-full">
                  <PropertyCard p={x} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTA c={c} />
      <Footer />

      {/* phones: price and the three things a buyer does, always in reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[11px] text-ink/55">{p.unit || "Price"}</p>
            <p className="truncate text-xl font-extrabold tabular-nums text-copper-dark">{p.price}</p>
          </div>
          <a
            href={phoneHref(c.contact_phone)}
            aria-label="Call us"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-copper/40 text-copper-dark transition active:bg-copper active:text-white"
          >
            <Phone className="h-5 w-5" />
          </a>
          <a
            href={`https://wa.me/${wa}?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25d366]/15 text-[#128c4a] transition active:bg-[#25d366] active:text-white"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <a
            href="#visit"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-5 text-sm font-semibold text-white shadow-md shadow-copper/30"
          >
            Book visit
          </a>
        </div>
      </div>
    </main>
  );
}
