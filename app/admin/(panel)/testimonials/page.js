import PageHeader from "@/components/admin/PageHeader";
import TestimonialsManager from "@/components/admin/TestimonialsManager";
import { getAllTestimonials } from "@/actions/admin/testimonials";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const testimonials = await getAllTestimonials();

  return (
    <>
      <PageHeader
        label="Content"
        title="Partner"
        accent="Testimonials"
        text="What partners say, shown on the home page."
      />
      <TestimonialsManager testimonials={testimonials} />
    </>
  );
}
