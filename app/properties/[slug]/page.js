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
import PropertyTabs from "@/components/PropertyTabs";
import RelatedProperties from "@/components/RelatedProperties";
import Reveal from "@/components/Reveal";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getContent, getProperties } from "@/lib/content";
import { DETAIL_ICONS, amenityIcon, categoryIcon } from "@/lib/icons";
import { fill, isOn, phoneHref } from "@/lib/siteContent";

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
  const [c, { property: p }] = await Promise.all([getContent(), find(slug)]);
  if (!p) return { title: c.pd_meta_missing };
  const text = p.tagline || p.description?.split("\n")[0] || [p.title, p.location].filter(Boolean).join(" - ");
  return {
    title: fill(c.pd_meta_title, { title: p.title }),
    description: text,
    openGraph: { title: p.title, description: text, images: p.image_url ? [p.image_url] : undefined },
  };
}

export default async function PropertyPage({ params }) {
  const { slug } = await params;
  const [c, { properties, property: p }] = await Promise.all([getContent(), find(slug)]);
  if (!p) notFound();

  const images = photos(p);
  const hero = p.banner_url || images[0];
  const CategoryIcon = categoryIcon(p);
  const paragraphs = String(p.description ?? "").split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);
  const highlights = list(p.highlights);
  const specs = list(p.specs);
  const amenities = list(p.amenities);
  const details = list(p.details);
  // Other properties of the same type first, then the rest.
  const related = properties
    .filter((x) => x.id !== p.id)
    .sort((a, b) => (b.category === p.category) - (a.category === p.category))
    .slice(0, 8);

  // The last word of the name is picked out in copper ("Green Valley" + "Plots").
  const nameWords = String(p.title).trim().split(/\s+/);
  const titleEnd = nameWords.length > 1 ? nameWords.pop() : "";
  const titleStart = nameWords.join(" ");

  // The detail lines of the strip go in two columns, split by a thin line.
  const half = Math.ceil(details.length / 2);
  const detailColumns = [details.slice(0, half), details.slice(half)].filter((col) => col.length);

  const tabs = [
    ["#photos", c.pd_tab_photos],
    ...(paragraphs.length ? [["#about", c.pd_tab_about]] : []),
    ...(highlights.length ? [["#why", c.pd_tab_why]] : []),
    ...(specs.length ? [["#details", c.pd_tab_details]] : []),
    ...(amenities.length ? [["#facilities", c.pd_tab_facilities]] : []),
    ["#visit", c.pd_tab_visit],
  ].filter(([, label]) => label);

  // Every text of the booking card comes from the admin.
  const form = {
    title1: c.pd_form_title_1,
    titleAccent: c.pd_form_title_accent,
    text: c.pd_form_text,
    name: c.pd_form_name,
    phone: c.pd_form_phone,
    button: c.pd_form_btn,
    sending: c.pd_form_sending,
    call: c.pd_form_call,
    whatsapp: c.pd_form_wa,
    thanksTitle: c.pd_form_thanks_title,
    thanksText: c.pd_form_thanks_text,
    priceLabel: c.pd_price_label,
  };
  const vars = { title: p.title, location: p.location };

  const digits = String(c.contact_phone ?? "").replace(/\D/g, "");
  const wa = digits.length === 10 ? `91${digits}` : digits;
  const waText = encodeURIComponent(fill(c.pd_wa_message, vars));

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
            <a href="/" className="transition hover:text-white">{c.pd_crumb_home}</a>
            <ChevronRight className="h-3.5 w-3.5" />
            <a href="/properties" className="transition hover:text-white">{c.pd_crumb_props}</a>
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
            {c.pd_share && (
              <PropertyShare
                title={p.title}
                label={c.pd_share}
                doneLabel={c.pd_share_done}
                shareText={fill(c.pd_share_text, vars)}
              />
            )}
          </div>

          <h1 className="mt-5 max-w-4xl font-display text-[40px] font-bold leading-[1.08] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-[4.6rem]">
            {titleStart}
            {titleEnd && (
              <>
                {" "}
                <span className="bg-gradient-to-b from-[#ffd9aa] to-copper-light bg-clip-text text-transparent [text-shadow:none]">
                  {titleEnd}
                </span>
              </>
            )}
          </h1>
          {p.location && (
            <p className="mt-6 flex items-center gap-2.5 text-lg text-white/90">
              <MapPin className="h-6 w-6 text-copper-light" />
              {p.location}
              <span className="ml-1 hidden h-px w-16 bg-copper-light/70 sm:block" />
              {p.map_url && (
                <a
                  href={p.map_url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 text-sm font-semibold text-copper-light underline-offset-4 hover:underline"
                >
                  {c.pd_map_link}
                </a>
              )}
            </p>
          )}
          {p.tagline && <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-xl">{p.tagline}</p>}
        </div>
      </section>

      {/* a strip that sits over the photo: price, quick facts, buttons */}
      <section className="relative z-10 -mt-16 bg-cream pt-5 sm:-mt-20 sm:pt-6">
        <div className="container-x lg:!max-w-none lg:!px-[4.2vw]">
          <Reveal>
            <div className="grid gap-5 rounded-3xl bg-gradient-to-b from-[#fffdf9] to-[#fcf3e6] p-5 shadow-[0_30px_70px_-30px_rgba(60,35,15,0.55)] ring-1 ring-copper/30 sm:gap-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10">
              <div className="leading-tight">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/55">{p.unit || c.pd_price_label}</p>
                <p className="mt-1 text-4xl font-extrabold tabular-nums text-copper-dark sm:mt-1.5 sm:text-5xl lg:text-[3.4rem]">{p.price}</p>
                <span className="mt-3 block h-0.5 w-10 rounded-full bg-copper/60" />
              </div>

              <div className="grid gap-y-3 border-t border-black/5 pt-5 sm:pt-6 lg:grid-cols-2 lg:border-t-0 lg:pt-0">
                {detailColumns.map((col, c2) => (
                  <ul
                    key={c2}
                    className="grid content-center gap-x-8 gap-y-3 min-[420px]:max-lg:grid-cols-2 lg:gap-y-5 lg:border-l lg:border-copper/20 lg:pl-10"
                  >
                    {col.map(({ icon, text }, i) => {
                      const Icon = DETAIL_ICONS[icon] ?? DETAIL_ICONS.MapPin;
                      return (
                        <li key={i} className="flex items-center gap-3.5 text-sm text-ink/80 sm:text-base">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f9e3cf] text-copper shadow-inner">
                            <Icon className="h-5 w-5" strokeWidth={1.7} />
                          </span>
                          {text}
                        </li>
                      );
                    })}
                  </ul>
                ))}
              </div>

              <div className="hidden flex-col gap-3 sm:flex sm:flex-row lg:flex-col">
                {c.pd_btn_visit && (
                  <a
                    href="#visit"
                    className="btn-shimmer group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5"
                  >
                    {c.pd_btn_visit}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </a>
                )}
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
      <PropertyTabs items={tabs} />

      {/* the photos */}
      <section id="photos" className="scroll-mt-36 lg:scroll-mt-52 bg-cream pt-8 sm:pt-10">
        <div className="container-x lg:!max-w-none lg:!px-[4.2vw]">
          <Reveal>
            <PropertyGallery images={images} title={p.title} allLabel={c.pd_photos_all} moreLabel={c.pd_photos_more} />
          </Reveal>
        </div>
      </section>

      {/* the story */}
      <section className="bg-cream py-12 sm:py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14 lg:!max-w-none lg:!px-[4.2vw] xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="space-y-12">
            {paragraphs.length > 0 && (
              <Reveal>
                <h2 id="about" className="scroll-mt-36 lg:scroll-mt-52 font-display text-3xl font-bold text-ink sm:text-4xl">
                  {c.pd_about_1} <span className="text-copper">{c.pd_about_accent}</span>
                </h2>
                <span className="mt-3 block h-0.5 w-12 rounded-full bg-copper/70" />
                <div className="mt-5 space-y-4 text-base leading-relaxed text-ink/75 sm:text-[17px]">
                  {paragraphs.map((t, i) => (
                    <p key={i}>{t}</p>
                  ))}
                </div>
              </Reveal>
            )}

            {highlights.length > 0 && (
              <Reveal>
                <h2 id="why" className="scroll-mt-36 lg:scroll-mt-52 font-display text-3xl font-bold text-ink sm:text-4xl">
                  {c.pd_why_1} <span className="text-copper">{c.pd_why_accent}</span>
                </h2>
                <span className="mt-3 block h-0.5 w-12 rounded-full bg-copper/70" />
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {highlights.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-4 rounded-2xl bg-white p-4 text-[15px] leading-snug text-ink/80 shadow-[0_14px_30px_-22px_rgba(110,60,20,0.4)] ring-1 ring-black/5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30 ring-4 ring-copper/15">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {specs.length > 0 && (
              <Reveal>
                <h2 id="details" className="scroll-mt-36 lg:scroll-mt-52 font-display text-3xl font-bold text-ink sm:text-4xl">
                  {c.pd_details_1} <span className="text-copper">{c.pd_details_accent}</span>
                </h2>
                <span className="mt-3 block h-0.5 w-12 rounded-full bg-copper/70" />
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
                {c.pd_amen_label && (
                  <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-ink/60">
                    <span className="h-3.5 w-px bg-copper" />
                    {c.pd_amen_label}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <h2 id="facilities" className="scroll-mt-36 lg:scroll-mt-52 font-display text-3xl font-bold text-ink sm:text-4xl">
                    {c.pd_amen_title_1} <span className="text-copper">{c.pd_amen_title_accent}</span>
                  </h2>
                  {c.pd_amen_text && <p className="max-w-sm text-sm leading-relaxed text-ink/65">{c.pd_amen_text}</p>}
                </div>
                <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {amenities.map((t, i) => {
                    const Icon = amenityIcon(t);
                    return (
                      <li
                        key={i}
                        className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-[15px] font-medium text-ink/85 shadow-[0_10px_26px_-18px_rgba(60,35,15,0.4)] ring-1 ring-black/5"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e5efe1] text-[#2f6b3a]">
                          <Icon className="h-5 w-5" strokeWidth={1.7} />
                        </span>
                        {t}
                      </li>
                    );
                  })}
                </ul>
              </Reveal>
            )}
          </div>

          <aside id="visit" className="scroll-mt-36 lg:scroll-mt-52">
            <div className="lg:sticky lg:top-28">
              <Reveal delay={100}>
                <PropertyEnquiry
                  t={form}
                  interest={p.title}
                  message={fill(c.pd_form_message, vars)}
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
      {isOn(c.pd_show_more) && related.length > 0 && (
        <section className="bg-gradient-to-b from-cream to-[#f6ecdc] pb-12 pt-4 sm:pb-16">
          <div className="container-x lg:!max-w-none lg:!px-[4.2vw]">
            <Reveal>
              <RelatedProperties c={c} items={related} />
            </Reveal>
          </div>
        </section>
      )}

      <CTA c={c} />
      <Footer />

      {/* phones: price and the three things a buyer does, always in reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="[overflow-wrap:anywhere] text-[11px] text-ink/55">{p.unit || c.pd_price_label}</p>
            <p className="[overflow-wrap:anywhere] text-xl font-extrabold tabular-nums text-copper-dark">{p.price}</p>
          </div>
          <a
            href={phoneHref(c.contact_phone)}
            aria-label={c.pd_form_call}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-copper/40 text-copper-dark transition active:bg-copper active:text-white"
          >
            <Phone className="h-5 w-5" />
          </a>
          <a
            href={`https://wa.me/${wa}?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            aria-label={c.pd_form_wa}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25d366]/15 text-[#128c4a] transition active:bg-[#25d366] active:text-white"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <a
            href="#visit"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-5 text-sm font-semibold text-white shadow-md shadow-copper/30"
          >
            {c.pd_bar_book}
          </a>
        </div>
      </div>
    </main>
  );
}
