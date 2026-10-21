import {
  ArrowRight,
  ClipboardList,
  Gift,
  Handshake,
  Share2,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import Reveal from "@/components/Reveal";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/content";
import { ranks } from "@/lib/data";

export const metadata = {
  title: "Partner Opportunities | Bhoomidar",
  description:
    "Join the Bhoomidar partner program. Earn commission and rewards on every sale.",
};

const BENEFIT_ICONS = [ClipboardList, Handshake, Users, Gift];

const steps = [
  {
    icon: UserPlus,
    title: "Register",
    text: "Create your partner account. It takes only a few minutes.",
  },
  {
    icon: Share2,
    title: "Share",
    text: "Show our properties to people you know.",
  },
  {
    icon: Wallet,
    title: "Earn",
    text: "Get commission when a sale is done through you.",
  },
];

export default async function OpportunitiesPage() {
  const c = await getContent();

  return (
    <main>
      <PageBanner
        image={c.partner_image}
        label="Partner Opportunities"
        text="Join our partner program, help people find good land, and earn commission and rewards on every sale."
        actions={
          <>
            <a
              href="/register"
              className="group inline-flex items-center justify-center gap-3 rounded-lg bg-gradient-to-b from-copper-light to-copper-dark px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:-translate-y-0.5"
            >
              Join as Partner
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-3 rounded-lg border border-white/70 bg-black/20 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Talk to Us <ArrowRight className="h-4 w-4" />
            </a>
          </>
        }
      >
        Grow Your Income
        <br />
        With <span className="text-copper-light">Bhoomidar</span>
      </PageBanner>

      {/* What partners get */}
      <section className="bg-cream py-14 sm:py-20 lg:py-24">
        <div className="container-x">
          <Reveal className="max-w-xl">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-8 bg-copper" />
              Why Join
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
              What You <span className="text-copper">Get</span>
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {BENEFIT_ICONS.map((Icon, i) => (
              <Reveal key={i} delay={i * 100} className="h-full">
                <div className="h-full rounded-2xl bg-gradient-to-b from-white to-[#fcf6ec] p-4 shadow-[0_14px_30px_-16px_rgba(110,60,20,0.4)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 sm:p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30 sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-sm font-bold text-ink">{c[`benefit${i + 1}_title`]}</p>
                  <p className="mt-1 text-xl font-bold text-ink sm:text-2xl">
                    {c[`benefit${i + 1}_value`]}
                  </p>
                  <p className="mt-2 text-xs leading-snug text-ink/60">
                    {c[`benefit${i + 1}_text`]}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ranks and rewards */}
      <section id="rewards" className="relative overflow-hidden bg-night py-14 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-copper/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-copper-light/15 blur-3xl" />

        <div className="container-x relative">
          <Reveal className="max-w-xl">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
              <span className="h-px w-8 bg-copper-light" />
              Partner Rank &amp; Rewards
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-copper-light sm:text-5xl">
              Grow Higher. Earn Bigger.
            </h2>
            <p className="mt-4 text-base text-white/65">
              The more land you sell, the higher your rank. A higher rank means
              more commission and better rewards.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {ranks.map(({ title, area, commission, reward, icon: Icon }, i) => (
              <Reveal
                key={title}
                delay={i * 100}
                className="h-full last:col-span-2 lg:last:col-span-1"
              >
                <div className="h-full rounded-2xl bg-[#f8efe2] p-4 text-center">
                  <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-copper text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-ink">{title}</h3>
                  <p className="mt-1 text-[11px] text-ink/60">{area}</p>
                  <p className="mt-0.5 text-xs font-bold text-copper">{commission}</p>

                  <div className="mt-4 flex h-24 items-center justify-center rounded-xl bg-gradient-to-b from-white to-[#efe2cf] sm:h-28">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-night text-copper-light shadow-lg sm:h-16 sm:w-16">
                      <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.5} />
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-ink/80">{reward}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How to start */}
      <section className="bg-gradient-to-b from-[#fbf6ee] to-[#f6ecdc] py-14 sm:py-20 lg:py-24">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
              <span className="h-px w-8 bg-copper" />
              How To Start
              <span className="h-px w-8 bg-copper" />
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
              Three Easy <span className="text-copper">Steps</span>
            </h2>
          </Reveal>

          <div className="relative mt-12 grid gap-10 sm:grid-cols-3 sm:gap-6">
            <div className="absolute left-[16.6%] right-[16.6%] top-10 hidden h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent sm:block" />
            {steps.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 120} className="relative text-center">
                <span className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30 ring-8 ring-[#faf3e7]">
                  <Icon className="h-8 w-8" strokeWidth={1.7} />
                  <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-night text-xs font-bold text-copper-light">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink/65">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTA c={c} />
      <Footer />
    </main>
  );
}
