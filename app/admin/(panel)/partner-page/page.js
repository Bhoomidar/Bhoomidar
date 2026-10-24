import PageHeader from "@/components/admin/PageHeader";
import SettingsEditor from "@/components/admin/SettingsEditor";
import { getContent } from "@/lib/content";
import { PARTNER_TABS } from "@/lib/siteContent";

export const metadata = { title: "Partner Page" };

export default async function PartnerCustomizePage() {
  const content = await getContent();

  return (
    <>
      <PageHeader
        label="Customize"
        title="Partner"
        accent="Page"
        text="Change the text and image of the partner page (/opportunities). It is not linked from the public website."
      />
      <SettingsEditor tabs={PARTNER_TABS} initial={content} />
    </>
  );
}
