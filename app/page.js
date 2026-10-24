import Hero from "@/components/Hero";
import Properties from "@/components/Properties";
import WhyChoose from "@/components/WhyChoose";
import Testimonials from "@/components/Testimonials";
import Faq from "@/components/Faq";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getContent, getFaqs, getProperties, getTestimonials } from "@/lib/content";
import { isOn } from "@/lib/siteContent";

export default async function Home() {
  const [c, properties, testimonials, faqs] = await Promise.all([
    getContent(),
    getProperties(),
    getTestimonials(),
    getFaqs(),
  ]);

  return (
    <main>
      <Hero c={c} />
      {isOn(c.show_properties) && <Properties c={c} properties={properties} />}
      {isOn(c.show_why) && <WhyChoose c={c} />}
      {isOn(c.show_testimonials) && <Testimonials c={c} testimonials={testimonials} />}
      {isOn(c.show_home_faq) && faqs.length > 0 && <Faq c={c} faqs={faqs} />}
      {isOn(c.show_cta) && <CTA c={c} />}
      <Footer />
    </main>
  );
}
