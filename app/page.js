import Hero from "@/components/Hero";
import Properties from "@/components/Properties";
import WhyChoose from "@/components/WhyChoose";
import Partner from "@/components/Partner";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getContent, getProperties, getTestimonials } from "@/lib/content";
import { isOn } from "@/lib/siteContent";

export default async function Home() {
  const [c, properties, testimonials] = await Promise.all([
    getContent(),
    getProperties(),
    getTestimonials(),
  ]);

  return (
    <main>
      <Hero c={c} />
      {isOn(c.show_properties) && <Properties c={c} properties={properties} />}
      {isOn(c.show_why) && <WhyChoose c={c} />}
      {isOn(c.show_partner) && <Partner c={c} />}
      {isOn(c.show_testimonials) && <Testimonials c={c} testimonials={testimonials} />}
      {isOn(c.show_cta) && <CTA c={c} />}
      <Footer />
    </main>
  );
}
