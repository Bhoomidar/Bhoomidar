import PageHeader from "@/components/admin/PageHeader";
import FaqsManager from "@/components/admin/FaqsManager";
import { getAllFaqs } from "@/actions/admin/faqs";

export const metadata = { title: "FAQs" };

export default async function FaqsPage() {
  const faqs = await getAllFaqs();

  return (
    <>
      <PageHeader
        label="Content"
        title="Questions &"
        accent="Answers"
        text="The FAQ section on the home page. Add, edit, hide or reorder questions here."
      />
      <FaqsManager faqs={faqs} />
    </>
  );
}
