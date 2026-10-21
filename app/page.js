import Hero from "@/components/Hero";
import Properties from "@/components/Properties";
import WhyChoose from "@/components/WhyChoose";
import Partner from "@/components/Partner";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getContent, getProperties, getTestimonials } from "@/lib/content";

export default async function Home() {
  const [c, properties, testimonials] = await Promise.all([
    getContent(),
    getProperties(),
    getTestimonials(),
  ]);

  return (
    <main>
      <Hero c={c} />
      <Properties c={c} properties={properties} />
      <WhyChoose c={c} />
      <Partner c={c} />
      <Testimonials c={c} testimonials={testimonials} />
      <CTA c={c} />
      <Footer />
    </main>
  );
}
