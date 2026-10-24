import { ArrowRight } from "lucide-react";
import PropertiesHero from "@/components/PropertiesHero";
import PropertiesGrid from "@/components/PropertiesGrid";
import Reveal from "@/components/Reveal";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getContent, getProperties } from "@/lib/content";
import { CATEGORIES } from "@/lib/icons";

export const metadata = {
  title: "Properties | Bhoomidar",
  description:
    "Choose from land and property in the best locations. Plots, villas, farm land and commercial plots.",
};

const LABELS = { Villa: "Villas" };

export default async function PropertiesPage({ searchParams }) {
  const [c, properties, params] = await Promise.all([getContent(), getProperties(), searchParams]);

  // From the search box: /properties?q=noida&type=Villa
  const q = typeof params?.q === "string" ? params.q.slice(0, 80) : "";
  const type = typeof params?.type === "string" && CATEGORIES.includes(params.type) ? params.type : "";
  const types = CATEGORIES.filter((cat) => properties.some((p) => p.category === cat)).map((cat) => ({
    id: cat,
    label: LABELS[cat] ?? cat,
  }));

  return (
    <main>
      <PropertiesHero
        image={c.hero_image}
        imageMobile={c.props_hero_image_mobile || c.hero_image_mobile}
        text={c.props_text}
      />

      <section id="listings" className="scroll-mt-4 bg-cream py-10 sm:py-14 lg:py-16">
        <div className="container-x lg:!max-w-none lg:!px-[4.2vw]">
          <PropertiesGrid properties={properties} initialType={type || "All"} initialQuery={q} />
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#f6ecdc] to-[#fbf6ee] py-14 sm:py-20">
        <Reveal className="container-x text-center">
          <h2 className="font-display text-3xl font-bold leading-[1.2] text-ink sm:text-4xl">
            Cannot find what you <span className="text-copper">need?</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-ink/65">
            Tell us what you are looking for and our team will help you find it.
          </p>
          <a
            href="/contact"
            className="group mt-7 inline-flex items-center gap-3 rounded-lg bg-gradient-to-b from-copper-light to-copper-dark px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5"
          >
            Talk to Us
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
        </Reveal>
      </section>

      <CTA c={c} />
      <Footer />
    </main>
  );
}
