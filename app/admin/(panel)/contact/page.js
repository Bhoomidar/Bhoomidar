import PageHeader from "@/components/admin/PageHeader";
import SettingsEditor from "@/components/admin/SettingsEditor";
import { getContent } from "@/lib/content";
import { CONTACT_TABS } from "@/lib/siteContent";

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
      <SettingsEditor tabs={CONTACT_TABS} initial={content} />
    </>
  );
}
