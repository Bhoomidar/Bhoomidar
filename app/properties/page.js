import { ArrowRight } from "lucide-react";
import PageBanner from "@/components/PageBanner";
import PropertiesGrid from "@/components/PropertiesGrid";
import Reveal from "@/components/Reveal";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getContent, getProperties } from "@/lib/content";

export const metadata = {
  title: "Properties | Bhoomidar",
  description:
    "Choose from land and property in the best locations. Plots, villas, farm land and commercial plots.",
};

export default async function PropertiesPage() {
  const [c, properties] = await Promise.all([getContent(), getProperties()]);

  return (
    <main>
      <PageBanner image={c.hero_image} label="Our Properties" text={c.props_text}>
        Find Your
        <br />
        <span className="text-copper-light">Perfect Land</span>
      </PageBanner>

      <section className="bg-cream py-12 sm:py-16 lg:py-20">
        <div className="container-x">
          <PropertiesGrid properties={properties} />
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
