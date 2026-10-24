import Image from "next/image";
import {
  ArrowRight,
  Award,
  Check,
  CirclePlay,
  Compass,
  Eye,
  FileText,
  Handshake,
  Headset,
  Leaf as LeafIcon,
  MapPin,
  Search,
  ShieldCheck,
  Smile,
  Sprout,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import { BuildingsArt, DocumentArt, HomeArt, PeopleArt } from "@/components/dashboard/StatArt";
import Reveal from "@/components/Reveal";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/content";
import { bannerProps, isOn, lines } from "@/lib/siteContent";

// The browser tab title and the Google description come from the admin (About Page > Browser Title).
export async function generateMetadata() {
  const c = await getContent();
  return { title: c.about_seo_title, description: c.about_seo_text };
}

const VALUE_ICONS = [ShieldCheck, Eye, Users, Sprout];
const STEP_ICONS = [Search, MapPin, ShieldCheck, Handshake];
const POINT_ICONS = [FileText, Sprout, Headset];
const STRIP_ICONS = [Users, MapPin, FileText, ShieldCheck];

const NUM_ICONS = [MapPin, Users, ShieldCheck, Handshake];
const NUM_ART = [BuildingsArt, PeopleArt, DocumentArt, HomeArt];
const TRUST_ICONS = [ShieldCheck, Users, Headset];

// "Our Mission" -> a small "OUR" over a big "Mission".
const splitOur = (t) => {
  const m = /^our\s+(.+)$/i.exec(String(t ?? "").trim());
  return m ? ["Our", m[1]] : ["", String(t ?? "")];
};

// One of the two big cards: icon and title, a line, three points, and a photo
// with a round corner and an arrow button.
function MvCard({ tone, icon: Icon, title, text, image, href, points, pointIcons }) {
  const dark = tone === "dark";
  const [small, big] = splitOur(title);
  return (
    <div
      className={`group relative h-full overflow-hidden rounded-[2rem] transition duration-300 hover:-translate-y-1.5 ${
        dark
          ? "bg-gradient-to-br from-[#1f4d36] via-[#173d2b] to-[#0f2b1e] text-white shadow-[0_30px_60px_-28px_rgba(10,40,25,0.8)] ring-1 ring-white/10"
          : "bg-gradient-to-br from-white via-[#fffaf3] to-[#fdebd6] shadow-[0_30px_60px_-28px_rgba(110,60,20,0.45)] ring-1 ring-copper/10"
      }`}
    >
      <div className="relative p-6 sm:p-8 sm:pr-[47%] lg:p-9 lg:pr-[47%]">
        <div className="flex items-center gap-4 sm:gap-5">
          <span
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white ring-1 sm:h-[72px] sm:w-[72px] ${
              dark
                ? "bg-gradient-to-br from-[#3d7a58] to-[#1f5a3a] shadow-[0_0_30px_-4px_rgba(120,200,150,0.55)] ring-white/20"
                : "bg-gradient-to-br from-copper-light to-copper-dark shadow-[0_0_30px_-4px_rgba(217,139,82,0.7)] ring-white/40"
            }`}
          >
            <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.7} />
          </span>
          <div className="leading-none">
            {small && (
              <span className={`block text-[11px] font-semibold uppercase tracking-[0.32em] ${dark ? "text-white/60" : "text-ink/55"}`}>
                {small}
              </span>
            )}
            <span className={`mt-1.5 block font-display text-4xl font-bold sm:text-5xl ${dark ? "text-[#bfe3c6]" : "text-copper"}`}>
              {big}
            </span>
          </div>
        </div>

        <span className={`mt-5 block h-0.5 w-12 rounded-full ${dark ? "bg-[#8fd1a2]" : "bg-copper"}`} />
        <p className={`mt-4 text-lg leading-snug sm:text-xl ${dark ? "text-white/85" : "text-ink/75"}`}>{text}</p>

        <ul className="mt-6 space-y-3.5">
          {points.map((p, i) => {
            const PointIcon = pointIcons[i];
            if (!p.title) return null;
            return (
              <li key={i} className="flex items-center gap-3.5">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    dark ? "bg-white/10 text-[#bfe3c6] ring-1 ring-white/10" : "bg-copper/10 text-copper"
                  }`}
                >
                  <PointIcon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className={`block text-[15px] font-bold ${dark ? "text-white" : "text-ink"}`}>{p.title}</span>
                  {p.text && <span className={`mt-0.5 block text-[13px] ${dark ? "text-white/65" : "text-ink/55"}`}>{p.text}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Photo: a round corner on the left, and an arrow button */}
      {image && (
        <div className="relative mx-6 mb-6 h-52 overflow-hidden rounded-3xl sm:absolute sm:inset-y-0 sm:right-0 sm:m-0 sm:h-auto sm:w-[44%] sm:rounded-none sm:rounded-bl-[7.5rem] sm:rounded-tl-[2.5rem]">
          <Image src={image} alt="" fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 40vw, 90vw" className="object-cover transition duration-700 group-hover:scale-105" />
          <div className={`absolute inset-0 ${dark ? "bg-gradient-to-t from-[#0f2b1e]/50 to-transparent" : "bg-gradient-to-t from-[#8c4821]/25 to-transparent"}`} />
        </div>
      )}
      <a
        href={href}
        aria-label={dark ? "Talk to us" : "See properties"}
        className={`absolute bottom-5 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full shadow-xl ring-8 transition hover:scale-105 sm:bottom-7 sm:right-7 sm:h-16 sm:w-16 ${
          dark
            ? "bg-[#d9f2df] text-[#143f2a] ring-white/10"
            : "bg-gradient-to-br from-copper-light to-copper-dark text-white ring-white/60"
        }`}
      >
        <ArrowRight className="h-6 w-6" />
      </a>
    </div>
  );
}

export default async function AboutPage() {
  const c = await getContent();

  return (
    <main>
      {/* Banner: buttons, three trust points and four number cards */}
      <PageBanner
        {...bannerProps(c, "about")}
        label={c.about_label}
        text={c.about_text}
        actions={
          (c.about_btn1 || c.about_btn2) && (
            <>
              {c.about_btn1 && (
                <a
                  href={c.about_btn1_link || "/properties"}
                  className="group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-copper/40 transition hover:-translate-y-0.5"
                >
                  {c.about_btn1}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </a>
              )}
              {c.about_btn2 && (
                <a
                  href={c.about_btn2_link || "/contact"}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-black/30 px-7 py-3.5 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:-translate-y-0.5 hover:bg-black/45"
                >
                  <CirclePlay className="h-[18px] w-[18px] text-copper-light" />
                  {c.about_btn2}
                </a>
              )}
            </>
          )
        }
        footer={
          (isOn(c.about_show_trust) || isOn(c.about_show_numbers)) && (
            <div className="space-y-8 sm:space-y-10">
              {isOn(c.about_show_trust) && (
                <ul className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:gap-0">
                  {[1, 2, 3].map((n) => {
                    const Icon = TRUST_ICONS[n - 1];
                    const title = c[`about_trust${n}_title`];
                    if (!title) return null;
                    return (
                      <li
                        key={n}
                        className="flex items-center gap-3.5 sm:border-l sm:border-white/15 sm:px-8 sm:first:border-l-0 sm:first:pl-0"
                      >
                        <Icon className="h-8 w-8 shrink-0 text-copper-light" strokeWidth={1.4} />
                        <span className="leading-tight">
                          <span className="block text-sm font-semibold text-white">{title}</span>
                          <span className="mt-1 block text-xs text-white/60">{c[`about_trust${n}_text`]}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {isOn(c.about_show_numbers) && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                  {[1, 2, 3, 4].map((n, i) => {
                    const Icon = NUM_ICONS[i];
                    const Art = NUM_ART[i];
                    return (
                      <div
                        key={n}
                        className="group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.12] via-black/25 to-black/45 p-4 ring-1 ring-copper-light/40 backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:ring-copper-light/70 sm:min-h-[200px] sm:p-5"
                      >
                        <Art className="pointer-events-none absolute -bottom-2 right-2 h-24 w-28 text-copper-light/25 transition duration-500 group-hover:scale-110 sm:h-28 sm:w-32" />
                        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-night/80 text-copper-light ring-2 ring-copper-light/60 shadow-[0_0_24px_-6px_rgba(217,139,82,0.8)] sm:h-14 sm:w-14">
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.7} />
                        </span>
                        <div className="relative mt-5 flex items-end justify-between gap-2">
                          <span className="min-w-0 leading-tight">
                            <span className="block font-display text-3xl font-bold text-copper-light sm:text-[2.6rem]">
                              {c[`num${n}_value`]}
                            </span>
                            <span className="mt-1 block text-xs text-white/85 sm:text-sm">{c[`num${n}_label`]}</span>
                          </span>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/30 text-copper-light ring-1 ring-copper-light/60 transition group-hover:bg-copper-light group-hover:text-night sm:h-10 sm:w-10">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )
        }
      >
        {c.about_title_1}
        <br />
        {c.about_title_2} <span className="text-copper-light">{c.about_title_accent}</span>
      </PageBanner>

      {/* Who we are */}
      {isOn(c.about_show_story) && (
      <section className="relative overflow-hidden bg-cream py-14 sm:py-20 lg:py-28">
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-[#2e7d4f]/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-copper-light/15 blur-3xl" />

        <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          {/* The photo: tilted card on green layers, with small chips */}
          <Reveal>
            <div className="relative mx-auto w-full max-w-lg pb-14 pl-2 pr-3 pt-5 sm:pl-6 lg:max-w-none">
              <div
                className="pointer-events-none absolute left-0 top-10 h-28 w-20 opacity-60"
                style={{ backgroundImage: "radial-gradient(circle, #b5622f 1.6px, transparent 1.6px)", backgroundSize: "14px 14px" }}
              />
              <div
                className="pointer-events-none absolute -bottom-2 right-0 h-28 w-28 opacity-50"
                style={{ backgroundImage: "radial-gradient(circle, #1f5a3a 1.6px, transparent 1.6px)", backgroundSize: "14px 14px" }}
              />

              {/* green layers peeking out from behind the photo */}
              <div className="absolute inset-x-6 top-0 bottom-10 -rotate-[4deg] rounded-[2.2rem] bg-gradient-to-br from-[#1f5a3a] to-[#143f2a] sm:inset-x-10" />
              <div className="absolute bottom-12 right-0 top-12 w-[88%] rotate-[3deg] rounded-[2.2rem] bg-gradient-to-br from-[#2e7d4f] to-[#1f5a3a] opacity-90" />


              <div className="relative aspect-[4/5] -rotate-[1.5deg] overflow-hidden rounded-[2rem] shadow-[0_40px_70px_-28px_rgba(20,60,40,0.65)] ring-4 ring-white/80 sm:aspect-[5/6]">
                <Image
                  src={c.story_image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="object-cover"
                />
                {isOn(c.about_show_chips) && (
                  <>
                    <div className="absolute left-3 top-3 flex max-w-[62%] items-center gap-2.5 rounded-2xl bg-white/90 px-3 py-2.5 shadow-lg backdrop-blur sm:left-5 sm:top-5 sm:gap-3 sm:px-4 sm:py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1f5a3a] text-white sm:h-11 sm:w-11">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span className="block truncate text-xs font-bold text-ink sm:text-sm">{c.story_chip1_title}</span>
                        <span className="mt-0.5 block truncate text-[10px] text-ink/55 sm:text-xs">{c.story_chip1_text}</span>
                      </span>
                    </div>
                    <div className="absolute right-3 top-14 flex max-w-[58%] items-center gap-2.5 rounded-2xl bg-white/90 px-3 py-2.5 shadow-lg backdrop-blur sm:right-5 sm:top-9 sm:gap-3 sm:px-4 sm:py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e3f1e8] text-[#1f5a3a] sm:h-11 sm:w-11">
                        <Sprout className="h-4 w-4 sm:h-5 sm:w-5" />
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span className="block truncate text-xs font-bold text-ink sm:text-sm">{c.story_chip2_title}</span>
                        <span className="mt-0.5 block truncate text-[10px] text-ink/55 sm:text-xs">{c.story_chip2_text}</span>
                      </span>
                    </div>
                  </>
                )}
              </div>

              {isOn(c.about_show_badge) && (
                <div className="float-slow absolute bottom-2 left-0 z-20 flex items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5 shadow-[0_24px_50px_-18px_rgba(20,60,40,0.55)] sm:-left-2 sm:gap-4 sm:px-6 sm:py-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f5a3a] text-white sm:h-14 sm:w-14">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-2xl font-extrabold text-ink sm:text-4xl">{c.story_badge_value}</span>
                    <span className="mt-0.5 block text-xs text-ink/60 sm:text-sm">{c.story_badge_label}</span>
                  </span>
                </div>
              )}
            </div>
          </Reveal>

          {/* The words */}
          <Reveal delay={150}>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-8 bg-copper" />
              {c.story_label}
            </p>

            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.15] text-ink sm:text-5xl">
              {c.story_title_1} <span className="text-copper">{c.story_title_accent}</span>
            </h2>

            {[c.story_p1, c.story_p2, c.story_p3].map(
              (text, i) =>
                text && (
                  <p
                    key={i}
                    className={`${i === 0 ? "mt-6" : "mt-4"} text-base leading-relaxed text-ink/70 lg:text-lg`}
                  >
                    {text}
                  </p>
                ),
            )}

            <ul className="mt-8 space-y-3">
              {lines(c.story_points).map((point, i) => {
                const [title, sub] = point.split("|").map((t) => t.trim());
                const Icon = POINT_ICONS[i % POINT_ICONS.length];
                const green = i % 2 === 1;
                return (
                  <li
                    key={point}
                    className="group flex items-center gap-4 rounded-2xl bg-white px-4 py-3.5 shadow-[0_12px_28px_-18px_rgba(60,60,40,0.5)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:ring-copper/30 sm:px-5"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${
                        green ? "bg-[#e3f1e8] text-[#1f5a3a]" : "bg-copper/10 text-copper"
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block text-[15px] font-bold text-ink sm:text-base">{title}</span>
                      {sub && <span className="mt-1 block text-[13px] text-ink/55 sm:text-sm">{sub}</span>}
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-copper shadow-sm ring-1 ring-copper/25 transition group-hover:bg-copper group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </li>
                );
              })}
            </ul>

            {isOn(c.about_show_story_stats) && (
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 rounded-2xl bg-white p-4 shadow-[0_18px_40px_-22px_rgba(60,60,40,0.5)] ring-1 ring-black/5 sm:p-5 lg:grid-cols-4 lg:gap-0">
                {[1, 2, 3, 4].map((n, i) => {
                  const Icon = STRIP_ICONS[i];
                  const green = i === 3;
                  return (
                    <div
                      key={n}
                      className="flex items-center gap-3 lg:border-l lg:border-black/10 lg:px-4 lg:first:border-l-0 lg:first:pl-0"
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                          green ? "bg-[#e3f1e8] text-[#1f5a3a]" : "bg-copper/10 text-copper"
                        }`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span className="block text-xl font-extrabold text-ink">{c[`story_stat${n}_value`]}</span>
                        <span className="mt-0.5 block text-xs text-ink/55">{c[`story_stat${n}_label`]}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Reveal>
        </div>
      </section>
      )}

      {/* Mission and vision */}
      {isOn(c.about_show_mission) && (
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf6ee] to-[#f6ecdc] py-14 sm:py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(181,98,47,0.10),transparent_70%)]" />

        <div className="container-x relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-8 bg-copper" />
              {c.mv_label}
              <span className="h-px w-8 bg-copper" />
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
              {c.mv_title_1} <span className="text-copper">{c.mv_title_accent}</span>{" "}
              {c.mv_title_2}
            </h2>
            {c.mv_text && <p className="mt-4 text-base leading-relaxed text-ink/60">{c.mv_text}</p>}
          </Reveal>

          <div className="mt-12 grid gap-6 xl:grid-cols-2 xl:gap-8">
            <Reveal className="h-full">
              <MvCard
                tone="light"
                icon={Target}
                title={c.mission_title}
                text={c.mission_text}
                image={c.mission_image}
                href={c.about_btn1_link || "/properties"}
                points={[1, 2, 3].map((n) => ({ title: c[`mission_pt${n}_title`], text: c[`mission_pt${n}_text`] }))}
                pointIcons={[FileText, ShieldCheck, Users]}
              />
            </Reveal>
            <Reveal delay={150} className="h-full">
              <MvCard
                tone="dark"
                icon={Compass}
                title={c.vision_title}
                text={c.vision_text}
                image={c.vision_image}
                href={c.about_btn2_link || "/contact"}
                points={[1, 2, 3].map((n) => ({ title: c[`vision_pt${n}_title`], text: c[`vision_pt${n}_text`] }))}
                pointIcons={[Award, TrendingUp, LeafIcon]}
              />
            </Reveal>
          </div>
        </div>
      </section>
      )}

      {/* Values */}
      {isOn(c.about_show_values) && (
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fdf6ea] to-cream py-14 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top_right,rgba(181,98,47,0.12),transparent_65%)]" />

        <div className="container-x relative">
          <Reveal className="max-w-2xl">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-8 bg-copper" />
              {c.values_label}
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
              {c.values_title_1} <span className="text-copper">{c.values_title_accent}</span>
            </h2>
            {c.values_text && <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/60">{c.values_text}</p>}
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {VALUE_ICONS.map((Icon, i) => {
              const green = i % 2 === 1;
              const words = String(c[`value${i + 1}_title`] ?? "").split(" ").filter(Boolean);
              const accentCount = words.length >= 3 ? 2 : 1;
              const plain = words.slice(0, Math.max(words.length - accentCount, 0)).join(" ");
              const accent = words.slice(Math.max(words.length - accentCount, 0)).join(" ");
              const image = c[`value${i + 1}_image`];
              return (
                <Reveal key={i} delay={i * 100} className="h-full">
                  <div
                    className={`group relative flex h-full flex-col overflow-hidden rounded-3xl p-5 pb-[8.5rem] shadow-[0_24px_50px_-26px_rgba(60,60,40,0.55)] ring-1 transition duration-300 hover:-translate-y-1.5 ${
                      green
                        ? "bg-gradient-to-b from-white via-[#f6f9f4] to-[#e4efe6] ring-[#2e7d4f]/15"
                        : "bg-gradient-to-b from-white via-[#fffaf3] to-[#fbe6cd] ring-copper/15"
                    }`}
                  >
                    <div className="relative flex items-start justify-between">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white/70 ${
                          green ? "bg-gradient-to-br from-[#2e7d4f] to-[#1b4d31]" : "bg-gradient-to-br from-copper-light to-copper-dark"
                        }`}
                      >
                        <Icon className="h-6 w-6" strokeWidth={1.8} />
                      </span>
                      <span className={`select-none font-display text-4xl font-bold ${green ? "text-[#2e7d4f]/25" : "text-copper/25"}`}>
                        0{i + 1}
                      </span>
                    </div>

                    <h3 className="relative mt-4 font-display text-[1.7rem] font-bold leading-tight text-ink">
                      {plain && <>{plain} </>}
                      <span className={green ? "text-[#2e7d4f]" : "text-copper"}>{accent}</span>
                    </h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-ink/70">{c[`value${i + 1}_text`]}</p>

                    {/* photo that fades in from the bottom */}
                    {image && (
                      <div className="pointer-events-none absolute -bottom-7 -inset-x-4 h-[11.75rem] [mask-image:linear-gradient(to_bottom,transparent,black_38%)]">
                        <Image
                          src={image}
                          alt=""
                          fill
                          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 45vw, 90vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                      </div>
                    )}

                    {c.values_btn && (
                      <a
                        href={c.values_btn_link || "/contact"}
                        className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-3 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-sm font-semibold text-ink shadow-lg transition hover:-translate-y-0.5"
                      >
                        {c.values_btn}
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${
                            green ? "bg-[#2e7d4f]" : "bg-copper"
                          }`}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </a>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* How it works */}
      {isOn(c.about_show_steps) && (
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf6ee] to-[#fdf9f3] pb-14 pt-14 sm:pb-20 sm:pt-20 lg:pb-28">
        <div className="pointer-events-none absolute -left-44 top-20 h-[26rem] w-[26rem] rounded-full border-[44px] border-copper/[0.045]" />
        <div className="pointer-events-none absolute -right-44 top-40 h-[26rem] w-[26rem] rounded-full border-[44px] border-copper/[0.045]" />
        <div className="container-x relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-8 bg-copper" />
              {c.steps_label}
              <span className="h-px w-8 bg-copper" />
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
              {c.steps_title_1} <span className="text-copper">{c.steps_title_accent}</span>
            </h2>
            <p className="mt-4 text-base text-ink/65">{c.steps_text}</p>
          </Reveal>

          <div className="relative mt-20 grid gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-4">
            {STEP_ICONS.map((Icon, i) => (
              <Reveal key={i} delay={i * 120} className="relative h-full">
                <div className="group relative h-full">
                  <div className="relative h-full rounded-3xl bg-gradient-to-br from-white to-[#fff4e6] px-5 pb-8 pt-[3.75rem] text-center shadow-[0_26px_50px_-28px_rgba(110,60,20,0.5)] ring-1 ring-copper/10 transition duration-300 group-hover:-translate-y-1.5 group-hover:ring-copper/30">
                    {/* the soft corner at the bottom right */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                      <div className="absolute -bottom-4 -right-4 h-24 w-32 rounded-tl-[100%] bg-gradient-to-tl from-copper/30 to-transparent" />
                    </div>

                    {/* the big round icon, with a thin arc and the step number */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                      <span className="absolute -inset-2 rotate-[20deg] rounded-full border-2 border-transparent border-r-copper/70 border-t-copper/70" />
                      <span className="relative flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#e29a62,#a8531f_62%,#7a3a14)] text-white shadow-[0_18px_30px_-8px_rgba(140,72,33,0.7)] ring-4 ring-white transition duration-300 group-hover:scale-105">
                        <Icon className="h-9 w-9" strokeWidth={1.6} />
                      </span>
                      <span className="absolute -left-9 top-0 flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-copper-dark shadow-md ring-1 ring-copper/20">
                        0{i + 1}
                      </span>
                    </div>

                    <h3 className="relative font-display text-2xl font-bold text-ink">{c[`step${i + 1}_title`]}</h3>
                    <p className="relative mx-auto mt-2 max-w-[230px] text-sm leading-relaxed text-ink/65">
                      {c[`step${i + 1}_text`]}
                    </p>
                    <span className="relative mx-auto mt-5 block h-0.5 w-10 rounded-full bg-copper" />
                  </div>

                  {/* the little curved link to the next step */}
                  {i < STEP_ICONS.length - 1 && (
                    <svg
                      viewBox="0 0 40 30"
                      fill="none"
                      aria-hidden
                      className="pointer-events-none absolute left-full top-[58%] z-10 hidden h-[30px] w-10 -translate-y-1/2 lg:block"
                    >
                      <path d="M0 22C14 24 14 8 40 8" stroke="#b5622f" strokeWidth="1.6" strokeLinecap="round" />
                      <circle cx="20" cy="16" r="5" fill="#8c4821" stroke="#fff" strokeWidth="3" />
                    </svg>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          {(c.about_btn1 || c.about_btn2) && (
            <Reveal className="mt-14 flex flex-col items-center gap-4 sm:mt-16 sm:flex-row sm:flex-wrap sm:justify-center">
              {c.about_btn1 && (
                <a
                  href={c.about_btn1_link || "/properties"}
                  className="group inline-flex items-center justify-center gap-5 rounded-full bg-gradient-to-r from-copper-light to-copper-dark py-2 pl-8 pr-2 text-[15px] font-semibold text-white shadow-[0_20px_40px_-14px_rgba(140,72,33,0.7)] transition hover:-translate-y-0.5"
                >
                  {c.about_btn1}
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7a3a14]/80 ring-1 ring-white/20 transition group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
              )}
              {c.about_btn2 && (
                <a
                  href={c.about_btn2_link || "/contact"}
                  className="group inline-flex items-center justify-center gap-3 rounded-full border border-copper bg-white/60 px-9 py-3.5 text-[15px] font-semibold text-copper-dark transition hover:-translate-y-0.5 hover:bg-copper hover:text-white"
                >
                  {c.about_btn2}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </a>
              )}
            </Reveal>
          )}
        </div>
      </section>
      )}

      {isOn(c.about_show_cta) && <CTA c={c} />}
      <Footer />
    </main>
  );
}
