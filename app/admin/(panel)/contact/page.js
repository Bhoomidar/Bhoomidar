import ContactEditor from "@/components/admin/ContactEditor";
import PageHeader from "@/components/admin/PageHeader";
import { getContent } from "@/lib/content";

export const metadata = { title: "Contact Info" };

export default async function ContactCustomizePage() {
  const content = await getContent();

  return (
    <>
      <PageHeader
        label="Customize"
        title="Contact"
        accent="Info"
        text="Your phone, email, address and social links. Also the Contact page text and the footer."
      />
      <ContactEditor initial={content} />
    </>
  );
}
